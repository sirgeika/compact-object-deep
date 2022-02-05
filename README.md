# compact-object-deep

Creates a deep clone of object with all falsey values removed.
The values `false`, `null`, `""`, `undefined`, and `NaN` are falsey.

If `customizer` is provided it's invoked to check value. If `customizer` returns 
`undefined` compacting is handled by the method instead.
The customizer invoked with up to four argument: `(value, key, path, object)`.

The `customizer` can't delete property with not empty value:
- If value of object is not empty - it can change their value.
- If value of object is empty - it can help keep this prop.


```bash
npm install compact-object-deep
```

```js
const compactDeep = require('compact-object-deep');

const source = {
  one: '1',
  two: 2,
  three: '',
  four: null,
  five: undefined,
  six: 0,
  seven: false,
  eight: true
};

const result = compactDeep(source);
/*
    {
      one: '1',
      two: 2,
      six: 0,
      eight: true
    }
*/
```

```js
const source = [
  '1',
  2,
  '',
  'str',
  [ 1 ],
  [],
  {},
  {
    one: 1,
    two: '',
    three: 3,
    four: {
      fone: '',
      ftwo: 2
    }
  }
];

const result = compactDeep(source);
/*
[
  '1',
  2,
  'str',
  [ 1 ],
  {
    one: 1,
    three: 3,
    four: {
      ftwo: 2
    }
  }
] 
*/
```

#### Arrays

```js
const source = {
  arr1: [],
  arr2: [ 1, '', '5'],
  arr3: [ '', [], [ [], 2, [ [ { a: 'a' } ] ] ] ]
};

const result = compactDeep(source);
/*
{
  arr2: [ 1, '5'],
  arr3: [ [ 2, [ [ { a: 'a' } ] ] ] ]
} 
*/
```

### With customizer

#### Keep falsy value only concrete `path`
```js
const source = {
  one: 1,
  two: '',
  arr: [
    1,
    [],
    ''
  ]
};

const result = compactDeep(source, function(val, key, path) {
  if (path === 'arr.[1]') {
    return val;
  }
});

/*
 {
    one: 1,
    arr: [
      1,
      []
    ]
  }
*/
```

#### Keep falsy value only concrete `key`

```js
const source = {
  one: 1,
  saveMe: '',
  notSaveMe: false,
  obj: {
    two: 2,
    saveMe: '',
    obj: {
      saveMe: null,
      poch: null
    }
  }
};

const result = compactDeep(source, function(val, key) {
  if (key === 'saveMe') {
    return val;
  }
});

/*
  {
    one: 1,
    saveMe: '',
    obj: {
      two: 2,
      saveMe: '',
      obj: {
        saveMe: null
      }
    }
  }
*/
```

#### Keep functions

```js
const source = {
  func1: function() {
    return 1;
  },
  obj: {
    func2: function(val) {
      return val;
    }
  }
};

const result = compactDeep(source, function(val) {
  if (typeof val === 'function') {
    return val;
  }
});

result.func1() === 1;
result.obj.func2(45) === 45;
```