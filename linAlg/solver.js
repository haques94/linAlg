(function(define) {'use strict';
define(function(require) {

return function(Matrix) {

   var Vector;

   Vector = Matrix.Vector;

   /**
    * Top level class for solving linear systems
    */
   function Solver(A) {
      /* Each subclass should define this.nrow */
      var ret;
      if (A.isUpper()) {
         return A.isLower() ? new Solver.DiagS(A.diagView()) : new Solver.UpperS(A);
      } else if (A.isLower()) { return new Solver.LowerS(A); }
      if (A.isSymmetric()) {
         ret = new Solver.CholeskyS(A);
         if (!ret.isSingular()) { return ret; }
      }
      return new Solver.PLUS(A);
   }

   Solver.Matrix = Matrix;
   Solver.prototype = Object.create({});

   Solver.DiagS     = require('./solver/diag')(Solver);
   Solver.LowerS    = require('./solver/lower')(Solver);
   Solver.UpperS    = require('./solver/upper')(Solver);
   Solver.PLUS      = require('./solver/plu')(Solver);
   Solver.CholeskyS = require('./solver/cholesky')(Solver);

   /** Expects b to be a Vector or Matrix (maybe array also?) */
   Solver.prototype.solve = function solve(b) {
      this.ensureCompatibleDims(b);
      if (b instanceof Vector) { return this._solve(b); }
      return new Matrix(b.mapCol(this._solve.bind(this)));
   };

   /**
    * Return whether the system that the solver solves is "singular". Overridden in
    * subclasses.
    * When `isSingular` returns true, you should not call `solve`.
    */
   Solver.prototype.isSingular = function isSingular() {
      return false;
   };

   Solver.prototype.ensureCompatibleDims = function ensureCompatibleDims(b) {
      if (this.nrow !== (b instanceof Vector ? b.length : b.nrow)) {
         throw new Error('Solver and RHS have incompatible dimensions.');
      }
      return;
   };

   return Solver;
};

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
