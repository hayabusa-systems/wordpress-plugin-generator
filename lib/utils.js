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