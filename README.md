# mbr-buffer
Reading and writing Buffer operations

My projects always have restrictions to not to use third party packages.
Only the ones included in default NodeJS and my own other projects.
This approach helps to make them really lightweight and fast.

## Reader
Utility to read from buffer. Instance has internal cursor which moves on each read operation or on demand.
You are always free to extend it by methods reqired by your project.
```
const reader = new Reader(buffer);
```
### reader.append
`reader.append(buffer)`

Append new data chunk to existing one without index being reset.

*buffer* - new data chunk to be appended.

Returns current Reader instance.

### reader.goTo
`reader.goTo(index)`

Move cursor so certain position.

*index* - position to go to.

Returns current Reader instance.

### reader.isEndReached
`reader.isEndReached()`

Check if cursor reached the end of storing data.

Returns `true` if end has been reached or `false` otherwise.

### reader.last
`reader.last(value, encoding = reader.encoding)`

Get index of last occurrence of `value`.

*value* - value to search. Can be either string or buffer, or one-byte number (0 - 255).

*encoding* - encoding of string value type. If value is not of string type, then argument is ignored.

Returns index as number type.

### reader.next
`reader.next(value, encoding = reader.encoding)`

Get index of next (after current cursor position) occurrence of `value`.

*value* - value to search. Can be either string or buffer, or one-byte number (0 - 255).

*encoding* - encoding of string value type. If value is not of string type, then argument is ignored.

Returns index as number type.

### reader.read
`reader.read(length = 1, encoding = reader.encoding)`

Read string from `length` bytes starting from current cursor position.

### reader.readInt
`reader.readInt(length = 1, littleEndian = false, unsigned = false)`

Read integer from `length` bytes starting from current cursor position.

*length* - byte count to read from.

*littleEndian* - is integer written in little-endian byte direction. Big-endian otherwise.

*unsigned* - is integer is unsigned.

Returns number.

### reader.readIntBE, .readIntLE, .readUIntBE, readUIntLE
```
reade.readIntBE(length = 1);  // Signed in big-endian byte direction
reade.readIntLE(length = 1);  // Signed in little-endian byte direction
reade.readUIntBE(length = 1); // Unsigned in big-endian byte direction
reade.readUIntLE(length = 1); // Unsigned in little-endian byte direction
```

Read signed or unsigned integer in desired byte direction from `length` bytes starting from current cursor position.

*length* - byte count to read from.

Returns number.

### reader.shft
`reader.shift(count)`

Move cursor by `count` of bytes, but return previous index value, unlike `.skip` method.

*count* - count of bytes to move cursor by.

Returns previous cursor position index as number type.

### reader.skip
`reader.skip(count = 1)`

Skip `count` of bytes and place cursor at new position.

*count* - count of bytes to be skipped.

Returns current Reader instance.

### reader.slice
`reader.slice(length)`

Read length bytes from current cursor position into new buffer. Note that both buffers share the same place in memory
so if one buffer has been modified then other one is modified as well.

*length* - byte count to read.

Returns new buffer object.

### reader.until
`reader.until(value, encoding = reader.encoding)`

Get byte count from current cursor position to next occurrence of `value`.

*value* - value to search. Can be either string or buffer, or one-byte number (0 - 255).

*encoding* - encoding of string value type. If value is not of string type, then argument is ignored.

Returns length as number.

### Reader.extend (static method)
`Reader.extend([constructor], methods)`

Create new constructor as an extension of Reader.

*constructor* - new constructor to extend Reader. Default one will be created if argument is omitted.

*methods* - methods to be appended to new prototype.

Returns new constructor function.

Example:

```
// Extend base class with two new methods: `readStrNull` which reads string
// from current cursor position until firs 0x00 byte and `readBase64` that
// returns `length` of bytes as base64.
const ExtendedReader1 = Reader.extend({
  readStrNull: function () {
    return this.read(this.until(0));
  },
  readBase64: function (length) {
    return this.slice(length).toString('base64');
  }
});

// Extend base class with custom constructor and `readAndAppendPrefix` method.
const ExtendedReader2 = Reader.extend(function (buffer, prefix) {
    Reader.call(this, buffer);
    this.prefix = prefix;
}, {
    readAndAppendPrefix: function (length) {
        return this.prefix + this.read(length);
    }
});
```

## Writer

Set of functions to write into new buffer. Unlike Reader, Writer is not a constructor.

### Writer.Group
`Writer.Group([elements]);`

Create group of elements or nested groups. Explicitly stores it's offset and size, which can be obtained by
`Writer.IndexOf` and `Writer.SizeOf`. Or by `group.IndexOf` and `group.SizeOf` which are essentially the same.

It is still possible to use arrays instead of Groups, but in that case you won't have direct access to size and offset.
You can use first element for offset and manually calculate size of all nested elements.

*elements* - array of child elements or nested groups.

Own methods:

`group.SizeOf(length = 1, {unsigned = false, littleEndian = false});`

Create reference to group size. Alias for `Writer.SizeOf`.

`group.IndexOf(length = 1, {unsigned = false, littleEndian = false});`

Create reference to group offset. Alias for `Writer.IndexOf`.

### Writer.Integer
`Writer.Integer(value, length = 1, {unsigned = false, littleEndian = false});`

Create integer element.

*value* - value to write.

*length* - byte length in new buffer.

*props.unsigned* - integer is unsigned.

*props.littleEndian* - integer in little-endian format.

### Writer.String
`Writer.String(value, length = value.length, {encoding = 'utf8'});`

Create string element.

*value* - value to write.

*length* - byte length in new buffer.

*props.encoding* - text encoding.

#### Writer.Fill
`Writer.Fill(value = 0, length = 1);`

Fill `length` bytes with given `value`s.

*value* - value to write into each byte.

*length* - count of bytes to be filled.

### Writer.Buffer
`Writer.Buffer(value, length = value.length);`

Create buffer element.

*value* - value to write.

*length* - byte length in new buffer.

### Writer.Flags
`Writer.Flags([values], length = 1);`

Create flags.

*values* - array of values as bits.

*length* - byte length in new buffer.

### Writer.IndexOf
`Writer.IndexOf(value, length = 1, {unsigned = false, littleEndian = false});`

Create reference to element's offset.

*value* - element (or group) to reference.

*length* - byte length in new buffer.

*props.unsigned* - integer is unsigned.

*props.littleEndian* - integer in little-endian format.

### Writer.SizeOf
`Writer.SizeOf(value, length = 1, {unsigned = false, littleEndian = false});`

Create reference to element's size.

*value* - element (or group) to reference.

*length* - byte length in new buffer.

*props.unsigned* - integer is unsigned.

*props.littleEndian* - integer in little-endian format.

### Writer.make
`Writer.make([elements]);`

Create buffer from elements. Array may consist of elements or other arrays. Nesting is supported.
If element is not an instance of Array, Writer.Group or any extension of Writer.Element (BufferElement)
then it will be ignored. So it is possible to use ternary operator to decide wether you need to include
element in array (Group) or not:
```
[
    ...
    someCase ? Writer.String('Yes!') : null,
    !!orSomeOtherCase && Writer.String('A-ha!')
    ...
]
```

*elements* - elements to convert into buffer.

### Writer.Element.extend
`Writer.Element.extend(constructor, valueOf);`

Way to create your own elements for your project.

*constructor* - constructor function to be extended.

*valueOf* - function that explains how to compile your value into result buffer.

Proper example:

```
const CustomElement = Writer.Element.extend(function (value, length, params) {
  // Call default constructor to set value and reserved buffer length.
  Writer.Element.call(this, value, length);

  // Set all desired custom parameters.
  this.params = params.
}, function () {
  // Make buffer you need.
  const buffer = Buffer.alloc(this.length);

  // Return an appropriate object.
  return Writer.Element.valueOf.call(this, buffer);
}).generator();

const customElement = CustomElement('value', 10);
```

Calling to `.generator()` method at the end is not required, but it's a good way to avoid using
`new` keyword before your custom element constructor. Otherwise element should be created like so:

```
const customElement = new CustomElement('value', 10);
```
