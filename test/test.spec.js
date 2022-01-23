'use strict';

const chai = require('chai');
const expect = chai.expect;

describe('Compact objects deep', function() {
  let compactDeep;

  before(function() {
    compactDeep = require('../index');
  });

  it('Object with simple values', function() {
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

    expect(result).to.deep.equal({
      one: '1',
      two: 2,
      six: 0,
      eight: true
    });
  });

  it('All values of object are empty', function() {
    const source = {
      array: [],
      obj: {},
      false: false,
      null: null,
      undefined: undefined,
      str: ''
    };

    const result = compactDeep(source);

    expect(result).to.deep.equal({});
  });

  it('Array', function() {
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

    expect(result).to.deep.equal([
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
    ]);
  });

  it('Many arrays', function() {
    const source = {
      arr1: [],
      arr2: [ 1, '', '5'],
      arr3: [ '', [], [ [], 2, [ [ { a: 'a' } ] ] ] ]
    };

    const result = compactDeep(source);

    expect(result).to.deep.equal({
      arr2: [ 1, '5'],
      arr3: [ [ 2, [ [ { a: 'a' } ] ] ] ]
    });
  });

  describe('With customizer', function() {
    it('Save falsy values', function() {
      const source = {
        one: 1,
        two: '',
        obj: {
          obj_one: 11,
          obj_two: false
        }
      };

      const result = compactDeep(source, function(val) {
        return val;
      });

      expect(result).to.deep.equal({
        one: 1,
        two: '',
        obj: {
          obj_one: 11,
          obj_two: false
        }
      });
    });

    it('Save falsy only concrete path', function() {
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

      expect(result).to.deep.equal({
        one: 1,
        arr: [
          1,
          []
        ]
      });
    });

    it('Save falsy values with concrete key', function() {
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

      expect(result).to.deep.equal({
        one: 1,
        saveMe: '',
        obj: {
          two: 2,
          saveMe: '',
          obj: {
            saveMe: null
          }
        }
      });
    });

    it('With function as values', function() {
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

      expect(result).to.have.any.keys('func1', 'func2');

      expect(result.func1()).to.equal(1);
      expect(result.obj.func2(45)).to.equal(45);
    });

    describe('Check paths', function() {
      it('Array paths', function() {
        const source = [
          [              // [0]
            { b: 'a' },  // [0].[0]
            [            // [0].[1]
              2,         // [0].[1].[0]
              [
                3,
                [ 4, { a: 'b' } ]
              ]
            ]
          ]
        ];

        const paths = [];

        compactDeep(source, function(val, key, path) {
          paths.push(path);
        });

        expect(paths).to.deep.equal([
          '[0]',
          '[0].[0]',
          '[0].[0].b',
          '[0].[1]',
          '[0].[1].[0]',
          '[0].[1].[1]',
          '[0].[1].[1].[0]',
          '[0].[1].[1].[1]',
          '[0].[1].[1].[1].[0]',
          '[0].[1].[1].[1].[1]',
          '[0].[1].[1].[1].[1].a'
        ]);
      });

      it('Object paths', function() {
        const source = {
          a: {
            b: {
              c: {
                d: {
                  e: {
                    f: [ 1, 6]
                  }
                }
              }
            }
          }
        };

        const paths = [];

        compactDeep(source, function(val, key, path) {
          paths.push(path);
        });

        expect(paths).to.have.lengthOf(8);

        expect(paths).to.include('a');
        expect(paths).to.include('a.b');
        expect(paths).to.include('a.b.c');
        expect(paths).to.include('a.b.c.d');
        expect(paths).to.include('a.b.c.d.e');
        expect(paths).to.include('a.b.c.d.e.f');
        expect(paths).to.include('a.b.c.d.e.f.[0]');
        expect(paths).to.include('a.b.c.d.e.f.[1]');
      });
    });
  });
});