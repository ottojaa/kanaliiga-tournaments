import { Parser } from 'binary-parser';

const selectDataType = function() {
  if (this.type === 'IntProperty') {
    return 1;
  } else if (this.type === 'ArrayProperty') {
    return 2;
  } else if (this.type === 'StrProperty' || this.type === 'NameProperty') {
    return 3;
  } else if (this.type === 'ByteProperty') {
    return 4;
  } else if (this.type === 'QWordProperty') {
    return 5;
  } else if (this.type === 'BoolProperty') {
    return 6;
  } else if (this.type === 'FloatProperty') {
    return 7;
  } else {
    throw new Error(JSON.stringify(this));
  }
};

// A function which returns 1 if the property name is "None", 0 if not.
// Again the parser choices needs int keys.
const readUntilNone = function(item, buf) {
  return item.name === 'None' || item.name === 'none' || !item.name;
};

const isNone = function() {
  if (this.name === 'None') {
    return 1;
  }

  return 0;
};

// JS can not handle 64 bit integers, so the parser reads 2 32 bit integers.
// This function converts the 32 bit integer from decimal to hex (little endian).
const decToHex = function(item) {
  let hex = parseInt(item, 10).toString(16);
  let len = 8 - hex.length;

  if (len > 0) {
    for (len; len > 0; --len) {
      hex = '0' + hex;
    }
  }

  return hex;
};

// ------------------------------------------------------------------------------
// Value parsers
// ------------------------------------------------------------------------------

// Parses an 32 bit integer.
// tslint:disable: member-ordering
const IntProperty = new Parser().endianess('little').int32('value');

// Parses a 32 bit integer length value of the following string
// and the string itself with Null stripped.
const StrProperty = new Parser()
  .endianess('little')
  .int32('vl')
  .string('value', { encoding: 'ascii', length: 'vl', stripNull: true });

// The byte property contains 2 strings prefixed by 2 32 bit integers as lengths
// (Strange byte type ...)
const ByteProperty = new Parser()
  .endianess('little')
  .int32('vl1')
  .string('value1', { encoding: 'ascii', length: 'vl1', stripNull: true })
  .int32('vl2')
  .string('value2', { encoding: 'ascii', length: 'vl2', stripNull: true });

// Parses a 64 bit integer into 2 32 bit integers as hex values.
const QWordProperty = new Parser()
  .endianess('little')
  .int32('hex2', { formatter: decToHex })
  .int32('hex1', { formatter: decToHex });

// Parses 0 or 1 (1 byte).
const BoolProperty = new Parser().endianess('little').bit8('value');

// Parses a 32 bit single precision value.
const FloatProperty = new Parser().floatle('value');

// ------------------------------------------------------------------------------
// Array Parsers
// ------------------------------------------------------------------------------

// This parser is like the property parser, just for the properties of the array.
// See below for description.
const ArrayPropertyDetail = new Parser()
  .endianess('little')
  .int32('nl')
  .string('name', { encoding: 'ascii', length: 'nl', stripNull: true })
  .choice('more', {
    tag: isNone,
    choices: {
      1: new Parser(),
      0: new Parser()
        .endianess('little')
        .int32('tl')
        .string('type', { encoding: 'ascii', length: 'tl', stripNull: true })
        .int32('unkn1')
        .int32('unkn2')
        .choice('details', {
          tag: selectDataType,
          choices: {
            1: IntProperty,
            3: StrProperty,
            4: ByteProperty,
            5: QWordProperty,
            6: BoolProperty,
            7: FloatProperty,
          },
        }),
    },
  });

// This parser parses the array property, which has a length of elements
// (like 4 representing 4 Goals) and a array of goal properties.
const ArrayProperty = new Parser()
  .endianess('little')
  .int32('length')
  .array('array', {
    type: new Parser().array('part', { type: ArrayPropertyDetail, readUntil: readUntilNone }),
    length: 'length',
  });

// ------------------------------------------------------------------------------
// Property parser
// ------------------------------------------------------------------------------

// This Parser parses the property section. It contains every single match
// information like goals, teamsize, score, etc.
// Every property has a name (string) prefixed by a length (int32).
// Then a type information (string) prefixed by a length (int32).
// And the value of the property (Selecting the right value parser).
const Property = new Parser()
  .endianess('little')
  .int32('nl')
  .string('name', { encoding: 'ascii', length: 'nl', stripNull: true })
  .choice('more', {
    tag: isNone,
    choices: {
      1: new Parser(),
      0: new Parser()
        .endianess('little')
        .int32('tl')
        .string('type', { encoding: 'ascii', length: 'tl', stripNull: true })
        .int32('unkn1')
        .int32('unkn2')
        .choice('details', {
          tag: selectDataType,
          choices: {
            1: IntProperty,
            2: ArrayProperty,
            3: StrProperty,
            4: ByteProperty,
            5: QWordProperty,
            6: BoolProperty,
            7: FloatProperty,
          },
        }),
    },
  });

export class RLParser {
  RocketLeagueParser = new Parser()
    .endianess('little')
    .int32('part_1_length')
    .uint32('part_1_crc')
    .uint32('engine_version')
    .uint32('license_version')
    .uint32('net_version')
    .uint32('tl')
    .string('type', {
      encoding: 'ascii',
      length: 'tl',
      stripNull: true,
    })
    .array('properties', {
      type: Property,
      readUntil: readUntilNone,
    });
}
