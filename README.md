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
### reader.slice
`reader.slice(length)`

Read length bytes from current cursor position into new buffer. Note that both buffers share the same place in memory
so if one buffer has been modified then other one is modified as well.

*length* - byte count to read.

### reader.goTo
`reader.goTo(index)`

Move cursor so certain position.

### reader.last
`reader.last(value, encoding = reader.encoding)`

Get index of last occurrence of `value`.

*value* - value to search. Can be either string or buffer, or one-byte number (0 - 255).

*encoding* - encoding of string value type. If value is not of string type, then argument is ignored.

### reader.next
`reader.next(value, encoding = reader.encoding)`

Get index of next (after current cursor position) occurrence of `value`.

*value* - value to search. Can be either string or buffer, or one-byte number (0 - 255).

*encoding* - encoding of string value type. If value is not of string type, then argument is ignored.

### reader.read
`reader.read(length = 1, encoding = reader.encoding)`

Read string from `length` bytes starting from current cursor position.

### reader.readInt
`reader.readInt(length = 1, littleEndian = false, unsigned = false)`

Read integer from `length` bytes starting from current cursor position.

*length* - byte count to read from.

*littleEndian* - is integer written in little-endian byte direction. Big-endian otherwise.

*unsigned* - is integer is unsigned.

### reader.readIntBE, .readIntLE, .readUIntBE, readUIntLE
```
reade.readIntBE(length = 1);  // Signed in big-endian byte direction
reade.readIntLE(length = 1);  // Signed in little-endian byte direction
reade.readUIntBE(length = 1); // Unsigned in big-endian byte direction
reade.readUIntLE(length = 1); // Unsigned in little-endian byte direction
```

Read signed or unsigned integer in desired byte direction from `length` bytes starting from current cursor position.

*length* - byte count to read from.

### reader.skip
`reader.skip(count = 1)`

Skip `count` of bytes and place cursor at new position.

*count* - count of bytes to be skipped.

### reader.until
`reader.until(value, encoding = reader.encoding)`

Get byte count from current cursor position to next occurrence of `value`.

*value* - value to search. Can be either string or buffer, or one-byte number (0 - 255).

*encoding* - encoding of string value type. If value is not of string type, then argument is ignored.

## Writer

Set of functions to write into new buffer. Unlike Reader, Writer is not a constructor.

### Writer.Integer
`Writer.Integer(value, length, {unsigned = false, littleEndian = false});`

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

### Writer.Buffer
`Writer.Buffer(value, length = value.length);`

Create buffer element.

*value* - value to write.

*length* - byte length in new buffer.

### Writer.Flags
`Writer.Flags([values], length);`

Create flags.

*values* - array of values as bits.

*length* - byte length in new buffer.

### Writer.IndexOf
`Writer.IndexOf(value, length, {unsigned = false, littleEndian = false});`

Create reference to element's offset.

*value* - element to reference.

*length* - byte length in new buffer.

*props.unsigned* - integer is unsigned.

*props.littleEndian* - integer in little-endian format.

### Writer.make
`Writer.make([elements]);`

Create buffer from elements. Array may consist of elements or other arrays. Nesting is supported.

*elements* - elements to convert into buffer.
