const Writer = require('../writer.js');
const Reader = require('../reader.js');

const elementToGetIndexFrom = Writer.Flags([2, 1], 4);
const groupToTakeSizeFrom = Writer.Group([
  Writer.Integer(10, 3),
  [
    Writer.String('Well'),
    Writer.String('done')
  ]
]);

const result = Writer.make([
  Writer.Integer(10, 2, {littleEndian: true}),
  Writer.String('hello!', 10),
  Writer.IndexOf(elementToGetIndexFrom, 2),
  elementToGetIndexFrom,
  groupToTakeSizeFrom,
  Writer.SizeOf(groupToTakeSizeFrom, 2),
  groupToTakeSizeFrom.SizeOf(1),
  groupToTakeSizeFrom.IndexOf(1)
]);

console.log(result);

const ExtendedReader = Reader.extend({
  readInt1: function (number) {
    return Reader.prototype.readUIntLE.call(this, number);
  },
  readStrNull: function () {
    const result = this.read.call(this, this.until(0));
    this.skip(1);

    return result;
  }
});

const ExtendedReader2 = Reader.extend(function ExtendedReader(buffer, params) {
  Reader.call(this, buffer);
  this.params = params;
}, {
  readIntWithParams: function (number) {
    return this.readUIntLE(number) + this.params;
  }
});

const extended = new ExtendedReader(result);

console.log(extended.readInt1(2), extended.readStrNull());

const extended2 = new ExtendedReader2(result, 2);

console.log(extended2.readIntWithParams(2));
