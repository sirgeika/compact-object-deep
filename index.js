'use strict';

const isEmpty = require('./lib/is-empty');
const isObject = require('lodash.isobject');

const setObjectValue = function(object, path, value) {
  object[path] = value;
};

const setArrayValue = function(array, path, value) {
  array.push(value);
};

const defineSetter = function(value) {
  if (Array.isArray(value)) {
    return setArrayValue;
  }
  return setObjectValue;
};

const defineGetter = function(obj) {
  if (Array.isArray(obj)) {
    return function(value) {
      return value;
    };
  }
  return function(path) {
    return obj[path];
  };
};

const defineInitialValue = function(value) {
  if (Array.isArray(value)) {
    return [];
  }

  if (isObject(value)) {
    return {};
  }
  return value;
};

const defineCollection = function(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (isObject(value)) {
    return Object.keys(value);
  }

  return [];
};

const definePathGetter = function(value) {
  if (Array.isArray(value)) {
    return function(keyValue, index) {
      return [ '[', index, ']'].join('');
    };
  }
  return function(key) {
    return key;
  };
};

const compact = function(obj, customizer, path='') {

  const collection = defineCollection(obj);
  const initialValue = defineInitialValue(obj);
  const setter = defineSetter(obj);
  const getter = defineGetter(obj);
  const pathGetter = definePathGetter(obj);

  return collection.reduce(function(res, keyValue, index) {
    const localPath = path + (path ? '.' : '') + pathGetter(keyValue, index);
    const sourceVal = getter(keyValue);

    let customVal;
    if (typeof customizer === 'function') {
      customVal = customizer(sourceVal, keyValue, localPath, obj);
    }

    if (customVal !== undefined) {
      setter(res, keyValue, customVal);
    } else {
      if (!isEmpty(sourceVal)) {
        let tmp = sourceVal;
        if (isObject(tmp)) {
          tmp = compact(tmp, customizer, localPath);
        }
        if (!isEmpty(tmp)) {
          setter(res, keyValue, tmp);
        }
      }
    }

    return res;
  }, initialValue);
};

const compactObjectDeep = function(obj, customizer) {
  if (isEmpty(obj) || !isObject(obj)) {
    return obj;
  }

  return compact(obj, customizer);
};

module.exports = compactObjectDeep;
