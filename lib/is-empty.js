'use strict';

const isEmpty = require('lodash.isempty');

module.exports = function(val) {
  if (typeof val === 'number' && val === val) {
    return false;
  }

  if (typeof val === 'boolean') {
    return !val;
  }

  return isEmpty(val);
};