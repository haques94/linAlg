(function(define) {'use strict';
define(function(require) {

/* Returns a function which takes the Matrix constructor and
 * creates the subclass DenseM of Matrix
 */
return function(Matrix) {

   /* eslint-disable complexity */
   // Subclass of `Matrix` representing 'dense' matrices.
   function DenseM(arr, options) {
      if (!Array.isArray(arr)) {
         if (typeof arr === 'function') {
            return new DenseM.TabularM(arr, options);
         }
         return new DenseM.SparseM(arr, options);
      }
      if (arr.length === 0) { throw new Error('Cannot create empty matrix yet.'); }
      if (typeof options === 'boolean') { options = { byRow: options }; }
      if (options == null) { options = {}; }
      this.byRow = options.byRow === true;  // byRow defaults to false
      if (Array.isArray(arr[0])) {
         // If array of arrays, set an options parameter and flatten the array
         // The other dimension can be deduced from overall length
         // Assumes arrays are equal length.
         options[this.byRow ? 'nrow' : 'ncol'] = arr.length;
         arr = [].concat.apply([], arr);
      }
      this.values = new Matrix.Vector(arr);
      this.nrow = options.nrow || Math.floor(arr.length / options.ncol);
      this.ncol = options.ncol || Math.floor(arr.length / this.nrow);
      if (this.ncol * this.nrow !== this.values.length) {
         throw new Error('Declared matrix dimensions invalid');
      }
      return this;
   }
   /* eslint-enable */

   DenseM.prototype = Object.create(Matrix.prototype);

   DenseM.SparseM  = require('./dense/sparse')(Matrix, DenseM);
   DenseM.TabularM = require('./dense/tabular')(Matrix, DenseM);

   DenseM.prototype.each = function each(f) {
      var f2 = function f2(val, n) {
         return f(val, this.rowFromIndex(n), this.colFromIndex(n));
      }.bind(this);
      this.values.each(f2, true);
      return this;
   };

   return DenseM;
};

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
