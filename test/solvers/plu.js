var Matrix = require('../../linAlg/matrix');
var PLUS = Matrix.Solver.PLUS;
var expect = require('chai').expect;

describe('PLU solver', function() {
   var A, S, b, x, n;
   it('works for a vector on RHS', function() {
      for (var i = 0; i < 10; i += 1) {
         n = 2 + Math.floor(Math.random() * 30);
         A = new Matrix(function() { return Math.random() * 10 }, {nrow: n, ncol:n});
         b = new Matrix.Vector(Math.random, n);
         S = new PLUS(A);
         x = S.solve(b);
         expect(x.length).to.equal(n);
         expect(A.mult(x).equals(b, 0.00001)).to.be.ok;
      }
   });
   it('works for non-zero diagonal entries and matrix RHS', function() {
      for (var i = 0; i < 10; i += 1) {
         n = 2 + Math.floor(Math.random() * 30);
         A = new Matrix(function() { return Math.random() * 10 }, {nrow: n, ncol:n});
         b = new Matrix(Math.random, { nrow: n, ncol: Math.floor(Math.random() * 20) + 1 });
         S = new PLUS(A);
         x = S.solve(b);
         expect(x.nrow).to.equal(n);
         expect(x.ncol).to.equal(b.ncol);
         expect(A.mult(x).equals(b, 0.00001)).to.be.ok;
      }
   });
});
