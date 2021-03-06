var Matrix = require('../../linAlg/matrix');
var chai = require('chai');
var expect = chai.expect;

var sorter = function(a, b) { 
   if (a[1] < b[1]) return -1;
   if (a[1] > b[1]) return 1;
   if (a[2] < b[2]) return -1;
   if (a[2] > b[2]) return 1;
   return -1;
};

var A1 = new Matrix([4, 6, 7, 2, 1, 3], { nrow : 2 });
var A2 = new Matrix({ 2: { 3: 8, 4: 2}, 4: { 1: 5 }}, { nrow : 4, ncol: 6 });
var A3 = new Matrix(function(i, j) { return i * j; }, { nrow: 4, ncol: 6 });
var A4 = A3.view([3, 4], [1, 3]); // [[3, 4], [9, 12]]
describe('eachRow', function() {
   it('passes the correct arguments to f', function() {
      var f = function(val, i) { a.push([val, i]); };
      var a; // accumulator
      function testMatrix(m) {
         a = [];
         m.eachRow(f);
         for(var i = 1; i <= m.nrow; i += 1) {
            expect(a[i - 1][1]).to.equal(i);
            expect(a[i - 1][0].toArray()).to.deep.equal(m.rowView(i).toArray());
         }
      }
      [A1, A2, A3, A4].forEach(testMatrix);
   });
});
describe('eachCol', function() {
   it('passes the correct arguments to f', function() {
      var f = function(val, i) { a.push([val, i]); };
      var a; // accumulator
      function testMatrix(m) {
         a = [];
         m.eachCol(f);
         for(var i = 1; i <= m.ncol; i += 1) {
            expect(a[i - 1][1]).to.equal(i);
            expect(a[i - 1][0].toArray()).to.deep.equal(m.colView(i).toArray());
         }
      }
      [A1, A2, A3, A4].forEach(testMatrix);
   });
});
describe('forEach', function() {
   it('exists', function() {
      expect(A1).to.respondTo('forEach');
      expect(A2).to.respondTo('forEach');
      expect(A3).to.respondTo('forEach');
      expect(A4).to.respondTo('forEach');
   });
   it('passes the correct arguments to f', function() {
      var f = function(val, i, j) { a.push([val, i, j]); };
      var a; // accumulator
      function testArray(m) {
         a = [];
         m.forEach(f);
         expect(a.length).to.equal(m.nrow * m.ncol); // if not skipZeros
         a.sort(sorter);
         var c = 0;
         for(var i = 1; i <= m.nrow; i += 1) {
            for(var j = 1; j <= m.ncol; j += 1) {
               expect(a[c]).to.deep.equal([m.get(i, j), i, j]);
               c += 1;
            }
         }
      }
      [A1, A3, A4].forEach(testArray);
   });
   it('can be called with skipZeros set to true', function() {
      var f = function(val, i, j) { a.push([val, i, j]); };
      var a; // accumulator
      a = [];
      A2.forEach(f);
      expect(a.length).to.equal(3);
      a.sort(sorter);
      expect(a[0]).to.deep.equal([8, 2, 3]);
      expect(a[1]).to.deep.equal([2, 2, 4]);
      expect(a[2]).to.deep.equal([5, 4, 1]);
   });
});
describe('reduce', function() {
   it('makes the correct calls, in some order', function() {
      var f = function(acc, val, i, j) { a.push([val, i, j]); };
      var a; // accumulator
      function testArray(m) {
         a = [];
         m.reduce(f, 0);
         expect(a.length).to.equal(m.nrow * m.ncol); // if not skipZeros
         a.sort(sorter);
         var c = 0;
         for(var i = 1; i <= m.nrow; i += 1) {
            for(var j = 1; j <= m.ncol; j += 1) {
               expect(a[c]).to.deep.equal([m.get(i, j), i, j]);
               c += 1;
            }
         }
      }
      [A1, A3, A4].forEach(testArray);
   });
   it('passes the correct acc value on every call', function() {
      var makef = function(c) {
         return function(acc, val, i, j) {
            expect(acc).to.equal(c);
            c = Math.random();
            return c;
         }
      };
      var init;
      init = Math.random(); A1.reduce(makef(init), init);
      init = Math.random(); A2.reduce(makef(init), init);
      init = Math.random(); A2.reduce(makef(init), init, true);
      init = Math.random(); A3.reduce(makef(init), init);
      init = Math.random(); A4.reduce(makef(init), init);
   });
   it('skips zeros if in sparse matrix and skipZeros is true', function() {
      var f = function(acc, val, i, j) { a.push([val, i, j]); };
      var a; // accumulator
      a = [];
      A2.reduce(f, 0);
      expect(a.length).to.equal(3);
      a.sort(sorter);
      expect(a[0]).to.deep.equal([8, 2, 3]);
      expect(a[1]).to.deep.equal([2, 2, 4]);
      expect(a[2]).to.deep.equal([5, 4, 1]);
   });
   it('returns correct result', function() {
      var f = function(acc, val) { return acc + val; };
      expect(A1.reduce(f, 0)).to.equal(4 + 6 + 7 + 2 + 1 + 3);
      expect(A1.reduce(f, 0, true)).to.equal(4 + 6 + 7 + 2 + 1 + 3);
      expect(A2.reduce(f, 0)).to.equal(8 + 2 + 5);
      expect(A2.reduce(f, 0, true)).to.equal(8 + 2 + 5);
      expect(A4.reduce(f, 0)).to.equal(3 + 4 + 9 + 12);
      expect(A4.reduce(f, 0, true)).to.equal(3 + 4 + 9 + 12);
   });
});
describe('reduceRow', function() {
   it('makes the correct calls, in some order', function() {
      var f = function(acc, row, i) { a.push([row, i]); };
      var a; // accumulator
      function testArray(m) {
         a = [];
         m.reduceRow(f, 0);
         expect(a.length).to.equal(m.nrow); // if not skipZeros
         a.sort(function(a, b) { return a[1] - b[1]; });
         for(var i = 1; i <= m.nrow; i += 1) {
            expect(a[i - 1][1]).to.equal(i);
            expect(a[i - 1][0].toArray()).to.deep.equal(m.rowView(i).toArray());
         }
      }
      [A1, A2, A3, A4].forEach(testArray);
   });
   it('passes the correct acc value on every call', function() {
      var makef = function(c) {
         return function(acc, row, i) {
            expect(acc).to.equal(c);
            c = Math.random();
            return c;
         }
      };
      var init;
      init = Math.random(); A1.reduceRow(makef(init), init);
      init = Math.random(); A2.reduceRow(makef(init), init);
      init = Math.random(); A3.reduceRow(makef(init), init);
      init = Math.random(); A4.reduceRow(makef(init), init);
   });
   it('returns correct result', function() {
      var f = function(acc, row) { return acc + row.reduce(function(a, b) { return a + b; }, 0); };
      expect(A1.reduceRow(f, 0)).to.equal(4 + 6 + 7 + 2 + 1 + 3);
      expect(A2.reduceRow(f, 0)).to.equal(8 + 2 + 5);
      expect(A4.reduceRow(f, 0)).to.equal(3 + 4 + 9 + 12);
   });
});
describe('reduceCol', function() {
   it('makes the correct calls, in some order', function() {
      var f = function(acc, col, j) { a.push([col, j]); };
      var a; // accumulator
      function testArray(m) {
         a = [];
         m.reduceCol(f, 0);
         expect(a.length).to.equal(m.ncol); // if not skipZeros
         a.sort(function(a, b) { return a[1] - b[1]; });
         for(var j = 1; j <= m.ncol; j += 1) {
            expect(a[j - 1][1]).to.equal(j);
            expect(a[j - 1][0].toArray()).to.deep.equal(m.colView(j).toArray());
         }
      }
      [A1, A2, A3, A4].forEach(testArray);
   });
   it('passes the correct acc value on every call', function() {
      var makef = function(c) {
         return function(acc, col, j) {
            expect(acc).to.equal(c);
            c = Math.random();
            return c;
         }
      };
      var init;
      init = Math.random(); A1.reduceCol(makef(init), init);
      init = Math.random(); A2.reduceCol(makef(init), init);
      init = Math.random(); A3.reduceCol(makef(init), init);
      init = Math.random(); A4.reduceCol(makef(init), init);
   });
   it('returns correct result', function() {
      var f = function(acc, col) { return acc + col.reduce(function(a, b) { return a + b; }, 0); };
      expect(A1.reduceCol(f, 0)).to.equal(4 + 6 + 7 + 2 + 1 + 3);
      expect(A2.reduceCol(f, 0)).to.equal(8 + 2 + 5);
      expect(A4.reduceCol(f, 0)).to.equal(3 + 4 + 9 + 12);
   });
});
describe('Matrix#map', function() {
   it('calls function with the correct args', function() {
      var f = function(val, i, j) { a.push([val, i, j]); };
      var a; // accumulator
      function testArray(m) {
         a = [];
         m.map(f).toArray();
         expect(a.length).to.equal(m.nrow * m.ncol); // if not skipZeros
         a.sort(sorter);
         var c = 0;
         for(var i = 1; i <= m.nrow; i += 1) {
            for(var j = 1; j <= m.ncol; j += 1) {
               expect(a[c]).to.deep.equal([m.get(i,j), i, j]);
               c += 1;
            }
         }
      }
      [A1, A3, A4].forEach(testArray);
   });
   it('returns a matrix with the correct entries', function() {
      var f = function(v) { return v * 2; };
      function test(m) {
         var m2 = m.map(f); // result
         expect(m2.nrow).to.equal(m.nrow);
         expect(m2.ncol).to.equal(m.ncol);
         for(var i = 1; i <= m.nrow; i += 1) {
            for(var j = 1; j <= m.ncol; j += 1) {
               expect(m2.get(i, j)).to.equal(f(m.get(i, j)));
            }
         }
      }
      [A1, A2, A3, A4].forEach(test);
   });
   it('preserves sparseness', function() {
      var f = function(val, i, j) { a.push([val, i, j]); };
      var a; // accumulator
      a = [];
      var m = A2.map(f);
      m.toArray();
      expect(a.length).to.equal(3);
      a.sort(sorter);
      expect(m).to.be.instanceof(Matrix.SparseM);
      expect(m.nrow).to.equal(A2.nrow);
      expect(m.ncol).to.equal(A2.ncol);
      expect(a[0]).to.deep.equal([8, 2, 3]);
      expect(a[1]).to.deep.equal([2, 2, 4]);
      expect(a[2]).to.deep.equal([5, 4, 1]);
   });
});
describe('Matrix#mapRow', function() {
   it('makes the correct calls', function() {
      var f = function(row, i) { a.push([row, i]); };
      var a; // accumulator
      function testArray(m) {
         a = [];
         m.mapRow(f);
         expect(a.length).to.equal(m.nrow); // if not skipZeros
         a.sort(function(a, b) { return a[1] - b[1]; });
         for(var i = 1; i <= m.nrow; i += 1) {
            expect(a[i - 1][1]).to.equal(i);
            expect(a[i - 1][0].toArray()).to.deep.equal(m.rowView(i).toArray());
         }
      }
      [A1, A2, A3, A4].forEach(testArray);
   });
   it('returns a correct Vector when f returns single values', function() {
      function f(row, i) {
         return i + 2;
      }
      function test(m) {
         var v = m.mapRow(f);
         expect(v).to.be.instanceof(Matrix.Vector);
         expect(v.length).to.equal(m.nrow);
         for(var i = 1; i <= m.nrow; i += 1) {
            expect(v.get(i)).to.equal(i + 2);
         }
      }
      [A1, A2, A3, A4].forEach(test);
   });
   it('returns a correct Matrix when f returns vectors', function() {
      function f(row, i) {
         return new Matrix.Vector([i, i+1]);
      }
      function test(m) {
         var m2 = m.mapRow(f);
         expect(m2).to.be.instanceof(Matrix);
         expect(m2.nrow).to.equal(m.nrow);
         expect(m2.ncol).to.equal(2);
         for(var i = 1; i <= m.nrow; i += 1) {
            expect(m2.get(i, 1)).to.equal(i);
            expect(m2.get(i, 2)).to.equal(i + 1);
         }
      }
      [A1, A2, A3, A4].forEach(test);
   });
   it('returns a correct Matrix when f returns arrays', function() {
      function f(row, i) {
         return [i, i+1];
      }
      function test(m) {
         var m2 = m.mapRow(f);
         expect(m2).to.be.instanceof(Matrix);
         expect(m2.nrow).to.equal(m.nrow);
         expect(m2.ncol).to.equal(2);
         for(var i = 1; i <= m.nrow; i += 1) {
            expect(m2.get(i, 1)).to.equal(i);
            expect(m2.get(i, 2)).to.equal(i + 1);
         }
      }
      [A1, A2, A3, A4].forEach(test);
   });
});
describe('Matrix#mapCol', function() {
   it('makes the correct calls', function() {
      var f = function(col, j) { a.push([col, j]); };
      var a; // accumulator
      function testArray(m) {
         a = [];
         m.mapCol(f);
         expect(a.length).to.equal(m.ncol); // if not skipZeros
         a.sort(function(a, b) { return a[1] - b[1]; });
         for(var j = 1; j <= m.ncol; j += 1) {
            expect(a[j - 1][1]).to.equal(j);
            expect(a[j - 1][0].toArray()).to.deep.equal(m.colView(j).toArray());
         }
      }
      [A1, A2, A3, A4].forEach(testArray);
   });
   it('returns a correct Vector when f returns single values', function() {
      function f(col, j) {
         return j + 2;
      }
      function test(m) {
         var v = m.mapCol(f);
         expect(v).to.be.instanceof(Matrix.Vector);
         expect(v.length).to.equal(m.ncol);
         for(var j = 1; j <= m.ncol; j += 1) {
            expect(v.get(j)).to.equal(j + 2);
         }
      }
      [A1, A2, A3, A4].forEach(test);
   });
   it('returns a correct Matrix when f returns vectors', function() {
      function f(col, j) {
         return new Matrix.Vector([j, j+1]);
      }
      function test(m) {
         var m2 = m.mapCol(f);
         expect(m2).to.be.instanceof(Matrix);
         expect(m2.ncol).to.equal(m.ncol);
         expect(m2.nrow).to.equal(2);
         for(var j = 1; j <= m.ncol; j += 1) {
            expect(m2.get(1, j)).to.equal(j);
            expect(m2.get(2, j)).to.equal(j + 1);
         }
      }
      [A1, A2, A3, A4].forEach(test);
   });
   it('returns a correct Matrix when f returns arrays', function() {
      function f(col, j) {
         return [j, j+1];
      }
      function test(m) {
         var m2 = m.mapCol(f);
         expect(m2).to.be.instanceof(Matrix);
         expect(m2.ncol).to.equal(m.ncol);
         expect(m2.nrow).to.equal(2);
         for(var j = 1; j <= m.ncol; j += 1) {
            expect(m2.get(1, j)).to.equal(j);
            expect(m2.get(2, j)).to.equal(j + 1);
         }
      }
      [A1, A2, A3, A4].forEach(test);
   });
});
describe('Predicates', function() {
   it('any and all', function() {
      var M = new Matrix([0.23, 1.2, -1.1, 1.1], { nrow: 2 });
      expect(M.any(function(x) { return x < 0; })).to.be.true;
      expect(M.any(function(x) { return x < -2; })).to.be.false;
      expect(M.all(function(x) { return x < 2; })).to.be.true;
      expect(M.all(function(x) { return x < 1; })).to.be.false;
   });
});
