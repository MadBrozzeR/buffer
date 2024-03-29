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
BufferElement.prototype.is = function (description) {
  this.description = description;

  return this;
}
BufferElement.generator = function () {
  const Constructor = this;

  return function (...args) {
    return new Constructor(...args);
  }
}
BufferElement.extend = function (func, valueOf) {
  func.prototype = Object.create(this.prototype);
  func.prototype.constructor = func;
  func.extend = this.extend;
  func.generator = this.generator;

  valueOf && (func.prototype.valueOf = valueOf);

  return func;
}

const IntegerType = BufferElement.extend(function IntegerType (value, length = 1, params = {}) {
  BufferElement.call(this, value, length);
  this.unsigned = params.unsigned || false;
  this.littleEndian = params.littleEndian || false;
}, function () {
  const buffer = Buffer.allocUnsafe(this.length);
  let method;

  if (this.length === 8) {
    if (!buffer.writeBigInt64LE) {
      throw new Error('BigInt buffer methods is not supported. Consider upgrading NodeJS up to 12+');
    }

    if (this.unsigned) {
      method = this.littleEndian ? buffer.writeBigUInt64LE : buffer.writeBigUInt64BE;
    } else {
      method = this.littleEndian ? buffer.writeBigInt64LE : buffer.writeBigInt64BE;
    }
  } else {
    if (this.unsigned) {
      method = (this.littleEndian) ? buffer.writeUIntLE : buffer.writeUIntBE;
    } else {
      method = (this.littleEndian) ? buffer.writeIntLE : buffer.writeIntBE;
    }
  }
  method.call(buffer, this.value, 0, this.length);

  return BufferElement.prototype.valueOf.call(this, buffer);
});

const FloatType = BufferElement.extend(function FloatType (value, params = {}) {
  BufferElement.call(this, value, 4);
  this.littleEndian = params.littleEndian || false;
}, function () {
  const buffer = Buffer.allocUnsafe(this.length);

  if (this.littleEndian) {
    buffer.writeFloatLE(this.value);
  } else {
    buffer.writeFloatBE(this.value);
  }

  return BufferElement.prototype.valueOf.call(this, buffer);
});

const DoubleType = BufferElement.extend(function DoubleType (value, params = {}) {
  BufferElement.call(this, value, 8);
  this.littleEndian = params.littleEndian || false;
}, function () {
  const buffer = Buffer.allocUnsafe(this.length);

  if (this.littleEndian) {
    buffer.writeDoubleLE(this.value);
  } else {
    buffer.writeDoubleBE(this.value);
  }

  return BufferElement.prototype.valueOf.call(this, buffer);
});

const StringType = BufferElement.extend(function StringType (value, length, params = {}) {
  this.encoding = params.encoding || UTF_8;
  BufferElement.call(this, value, length || Buffer.byteLength(value, this.encoding));
}, function () {
  const buffer = Buffer.alloc(this.length);
  buffer.write(this.value, this.encoding);

  return BufferElement.prototype.valueOf.call(this, buffer);
});

const FillType = BufferElement.extend(function FillType (value = 0, length = 1) {
    BufferElement.call(this, value, length);
}, function () {
    const buffer = Buffer.alloc(this.length, this.value);

    return BufferElement.prototype.valueOf.call(this, buffer);
});

const FlagsType = BufferElement.extend(function FlagsType (value, length = 1) {
  BufferElement.call(this, value, length);
}, function () {
  const buffer = Buffer.allocUnsafe(this.length);
  let value = 0;

  for (let index = 0 ; index < this.value.length ; ++index) {
    value |= this.value[index];
  }
  buffer.writeUIntBE(value, 0, this.length);

  return BufferElement.prototype.valueOf.call(this, buffer);
});

const BufferType = BufferElement.extend(function BufferType (value, length) {
  BufferElement.call(this, value, length || value.length);
}, function () {
  let buffer;
  if (this.value.length === this.length) {
    buffer = this.value;
  } else {
    buffer = Buffer.alloc(this.length);
    this.value.copy(buffer);
  }

  return BufferElement.prototype.valueOf.call(this, buffer);
});

const IndexOfType = IntegerType.extend(function IndexOfType (value, length = 1, params) {
  IntegerType.call(this, 0, length, params);
  this.element = value;
}, function () {
  this.value = this.element ? this.element.offset : 0;
  return IntegerType.prototype.valueOf.call(this);
});

const SizeOfType = IntegerType.extend(function SizeOfType (value, length = 1, params) {
  IntegerType.call(this, 0, length, params);
  this.element = value;
}, function () {
  this.value = this.element && this.element.length || 0;
  return IntegerType.prototype.valueOf.call(this);
});

function Group (group) {
  this.group = group;
  this.size = 0;
}
Group.prototype.flatten = function (result = {value: [], length: 0}) {
  this.offset = result.length;

  for (let index = 0 ; index < this.group.length ; ++index) {
    flatten(this.group[index], result);
  }
  this.length = result.length - this.offset;
};
Group.prototype.SizeOf = function (length, params) {
  return new SizeOfType(this, length, params);
};
Group.prototype.IndexOf = function (length, params) {
  return new IndexOfType(this, length, params);
};
Group.prototype.push = function () {
  this.group.push.apply(this.group, arguments);
};
Group.generator = function (group) {
  return new Group(group);
};

function flatten (object, result = {value: [], length: 0}) {
  if (object instanceof Group) {
    object.flatten(result);
  } else if (object instanceof Array) {
    for (let index = 0 ; index < object.length ; ++index) {
      flatten(object[index], result);
    }
  } else if (object instanceof BufferElement) {
    result.value.push(object);
    object.offset = result.length;
    result.length += object.length;
  }

  return result;
}

function make (object) {
  const flattenedObject = flatten(object);
  const result = Buffer.allocUnsafe(flattenedObject.length);

  for (let index = 0 ; index < flattenedObject.value.length ; ++index) {
    flattenedObject.value[index].writeTo(result);
  }

  return result;
}

function debug (object) {
  const flattenedObject = flatten(object);
  let result = '';

  for (let index = 0 ; index < flattenedObject.value.length ; ++index) {
    const element = flattenedObject.value[index];
    const value = element.valueOf();

    result += value.value.toString('hex').replace(/(.{2})(?!$)/g, '$1 ') + '\n  ' +
      element.constructor.name +
      (element.description ? (' [' + element.description + ']') : '') + '\n    ' +
      element.value + '\n';
  }

  return result;
}

module.exports = {
  Element: BufferElement,
  Integer: IntegerType.generator(),
  Float: FloatType.generator(),
  Double: DoubleType.generator(),
  String: StringType.generator(),
  Fill: FillType.generator(),
  Buffer: BufferType.generator(),
  Flags: FlagsType.generator(),
  IndexOf: IndexOfType.generator(),
  SizeOf: SizeOfType.generator(),
  Group: Group.generator,

  make: make,
  flatten: flatten,
  debug: debug,
};
