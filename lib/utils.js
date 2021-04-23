'use strict';

// It does not correspond to special cases.
module.exports.convertPruralForm = function (word) {
  if (['s', 'x', 'z'].includes(word.slice(-1))) {
    return word + 'es';
  } else if (['sh', 'ch'].includes(word.slice(-2))) {
    return word + 'es';
  } else if (word.slice(-2) == 'is') {
    return word.slice(0, -2) + 'es';
  } else if (['ay', 'iy', 'uy', 'ey', 'oy'].includes(word.slice(-2))) {
    return word + 's';
  } else if (word.slice(-1) == 'y') {
    return word.slice(0, -1) + 'ies';
  } else if (word.slice(-2) == 'us') {
    return word.slice(0, -2) + 'i';
  } else {
    return word + 's';
  }
}

module.exports.convertPhpType = function (type) {
  const t = type.toUpperCase();
  if (['INTEGER', 'INT', 'SMALLINT', 'TINYINT', 'MEDIUMINT', 'BIGINT'].includes(t)) {
    return 'int';
  } else if (['FLOAT', 'DOUBLE'].includes(t)) {
    return 'float';
  } else if (['DECIMAL', 'NUMERIC'].includes(t)) {
    return 'string';
  } else if (['BIT'].includes(t)) {
    return 'string';
  } else if (['CHAR', 'VARCHAR', 'BLOB', 'TEXT'].includes(t)) {
    return 'string';
  } else if (['BINARY', 'VARBINARY'].includes(t)) {
    return 'string';
  } else if (['ENUM'].includes(t)) {
    return 'int';
  } else if (['SET'].includes(t)) {
    return 'string';
  } else if (['DATE', 'DATETIME', 'TIMESTAMP', 'TIME'].includes(t)) {
    return 'DateTime';
  } else if (['YEAR'].includes(t)) {
    return 'string';
  }
}
module.exports.convertSnakeCase = function (str) {
  let converted = str[0].toLowerCase() + str.slice(1);
  const regex = /([A-Z])/g;
  return converted.replace(regex, '_\L$1');
}