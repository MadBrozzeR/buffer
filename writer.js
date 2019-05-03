const UTF_8 = 'utf8';

function BufferElement (value, length) {
  this.value = value;
  this.length = length;
  this.offset = 0;
}
BufferElement.prototype.valueOf = function (buffer) {
  return {
    length: this.length,
    value: buffer,
    offset: this.offset
  };
}
BufferElement.prototype.writeTo = function (buffer) {
  const value = this.valueOf();

  value.value.copy(buffer, this.offset);
}

function IntegerType (value, length, params = {}) {
  BufferElement.call(this, value, length);
  this.unsigned = params.unsigned || false;
  this.littleEndian = params.littleEndian || false;
}
IntegerType.prototype = Object.create(BufferElement.prototype);
IntegerType.prototype.valueOf = function () {
  const buffer = Buffer.allocUnsafe(this.length);
  let method;

  if (this.unsigned) {
    method = (this.littleEndian) ? buffer.writeUIntLE : buffer.writeUIntBE;
  } else {
    method = (this.littleEndian) ? buffer.writeIntLE : buffer.writeIntBE;
  }
  method.call(buffer, this.value, 0, this.length);

  return BufferElement.prototype.valueOf(buffer);
}

function StringType (value, length, params = {}) {
  this.encoding = params.encoding || UTF_8;
  BufferElement.call(this, value, length  || Buffer.byteLength(value, this.encoding));
}
StringType.prototype = Object.create(BufferElement.prototype);
StringType.prototype.valueOf = function () {
  const buffer = Buffer.alloc(this.length);
  buffer.write(this.value, this.encoding);

  return BufferElement.prototype.valueOf(buffer);
}

function FlagsType (value, length) {
  BufferElement.call(this, value, length);
}
FlagsType.prototype = Object.create(BufferElement.prototype);
FlagsType.prototype.valueOf = function () {
  const buffer = Buffer.allocUnsafe(this.length);
  let value = 0;

  for (let index = 0 ; index < this.value.length ; ++index) {
    value |= this.value[index];
  }
  buffer.writeUIntBE(value, 0, this.length);

  return BufferElement.prototype.valueOf(buffer);
}

function BufferType (value, length) {
  BufferElement.call(this, value, length || value.length);
}
BufferType.prototype = Object.create(BufferElement.prototype);
BufferType.prototype.valueOf = function () {
  let buffer;
  if (this.value.length === this.length) {
    buffer = this.value;
  } else {
    buffer = Buffer.alloc(this.length);
    this.value.copy(buffer);
  }

  return BufferElement.prototype.valueOf(buffer);
}

function IndexOfType (value, length, params) {
  IntegerType.call(this, 0, length, params);
  this.element = value;
}
IndexOfType.prototype = Object.create(IntegerType.prototype);
IndexOfType.prototype.valueOf = function () {
  this.value = this.element.offset;
  return IntegerType.prototype.valueOf.call(this);
}

function flaten (object, result = {value: [], length: 0}) {
  if (object instanceof Array) {
    for (let index = 0 ; index < object.length ; ++index) {
      flaten(object[index], result);
    }
  } else if (object instanceof BufferElement) {
    result.value.push(object);
    object.offset = result.length;
    result.length += object.length;
  }
  return result;
}

function make (object) {
  const flatenedObject = flaten(object);
  const result = Buffer.allocUnsafe(flatenedObject.length);

  for (let index = 0 ; index < flatenedObject.value.length ; ++index) {
    flatenedObject.value[index].writeTo(result);
  }

  return result;
}

function generator (className) {
  return function (...args) {
    return new className(...args);
  }
}

module.exports = {
  Element: BufferElement,
  Integer: generator(IntegerType),
  String: generator(StringType),
  Buffer: generator(BufferType),
  Flags: generator(FlagsType),
  IndexOf: generator(IndexOfType),

  make: make
};
