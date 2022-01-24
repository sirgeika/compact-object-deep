'use strict';

const isEmpty = require('./lib/is-empty');
const isObject = require('lodash.isobject');

const setObjectValue = function(object, path, value) {
  object[path] = value;
  return object;
};

const setArrayValue = function(array, path, value) {
  array.push(value);
  return array;
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

const compact = function(obj={}, customizer=() => {}, path='') {

  const collection = defineCollection(obj);
  const initialValue = defineInitialValue(obj);
  const setter = defineSetter(obj);
  const getter = defineGetter(obj);
  const pathGetter = definePathGetter(obj);

  return collection.reduce(function(result, keyValue, index) {
    const localPath = path + (path ? '.' : '') + pathGetter(keyValue, index);
    const sourceVal = getter(keyValue);

    let customizedVal = customizer(sourceVal, keyValue, localPath, obj);
    if (typeof customizedVal !== 'undefined') {
      return setter(result, keyValue, customizedVal);
    }

    if (!isEmpty(sourceVal)) {
      let tmp = sourceVal;
      if (isObject(tmp)) {
        tmp = compact(tmp, customizer, localPath);
      }
      if (!isEmpty(tmp)) {
        setter(result, keyValue, tmp);
      }
    }
    return result;
  }, initialValue);
};

const compactObjectDeep = function(obj, customizer) {
  if (isEmpty(obj) || !isObject(obj)) {
    return obj;
  }

  return compact(obj, customizer);
};

module.exports = compactObjectDeep;
