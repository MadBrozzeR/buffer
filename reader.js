const UTF_8 = 'utf8';

function Reader (buffer) {
  this.buffer = buffer;
  this.index = 0;
  this.encoding = UTF_8;
}
Reader.prototype.shift = function (length) {
  const oldIndex = this.index;
  this.index += length;

  return oldIndex;
}
Reader.prototype.readInt = function (length = 1, littleEndian = false, unsigned = false) {
  let method;

  if (littleEndian) {
    method = unsigned ? this.buffer.readUIntLE : this.buffer.readIntLE;
  } else {
    method = unsigned ? this.buffer.readUIntBE : this.buffer.readIntBE;
  }

  return method.call(this.buffer, this.shift(length), length);
};
Reader.prototype.readIntBE = function (length) {
  return this.readInt(length);
};
Reader.prototype.readIntLE = function (length) {
  return this.readInt(length, true);
};
Reader.prototype.readUIntBE = function (length) {
  return this.readInt(length, false, true);
};
Reader.prototype.readUIntLE = function (length) {
  return this.readInt(length, true, true);
};

Reader.prototype.read = function (length = 1, encoding) {
  const oldIndex = this.shift(length);

  return this.buffer.toString(encoding || this.encoding, oldIndex, oldIndex + length);
};
Reader.prototype.slice = function (length) {
  const oldIndex = this.shift(length);

  return this.buffer.slice(oldIndex, oldIndex + length);
}
Reader.prototype.next = function (value, encoding) {
  return this.buffer.indexOf(value, this.index, encoding || this.encoding);
};
Reader.prototype.last = function (value, encoding) {
  return this.buffer.lastIndexOf(value, undefined, encoding || this.encoding);
};
Reader.prototype.until = function (value, encoding) {
  return this.next(value, encoding) - this.index;
};
Reader.prototype.skip = function (count = 1) {
  this.index += count;

  return this;
};
Reader.prototype.goTo = function (index) {
  this.index = index;

  return this;
};

module.exports = Reader;
