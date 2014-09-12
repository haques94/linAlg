(function(define) {'use strict';
define(function(require) {

/* Returns a function which takes the Matrix constructor and
 * creates the subclass DiagM of Matrix
 */
return function(Matrix, StructuredM) {

   // Subclass of `StructuredM` representing "Diagonal" matrices.
   // DiagM takes ownership of the diagonal vector and may
   // change its values when it itself is changed. Clone the
   // array/vector before passing it to avoid this.
   //
   // `diagonal` needs to be a `Vector`, an array, a function, or a number.
   //
   // `nrow` needs to be an object with an `nrow` property, or a number.
   //
   // One can only set values on the diagonal of a DiagM matrix.
   // Trying to set outside the diagonal will result in error.
   // In order to set values outside the diagonal, would need to
   // "unstructure" the matrix.
   //
   // Using rowView/colView on diagonal matrices may be quite inefficient,
   // as it does not recognize the sparse nature of those vectors.
   function DiagM(diagonal, nrow) {
      if (!(diagonal instanceof Matrix.Vector)) {
         if (typeof diagonal === 'function') {
            diagonal = function(i) {
               return this(i, i);
            }.bind(diagonal);
         }
         diagonal = new Matrix.Vector(diagonal, nrow && nrow.nrow || nrow);
      }
      this.byRow = false;
      this.values = diagonal;
      this.nrow = this.values.length;
      this.ncol = this.values.length;
   }

   DiagM.prototype = Object.create(StructuredM.prototype);

   DiagM.prototype.validate = function(i, j, val) {
      if (i === j) { return true; }
      if (arguments.length > 2 && val !== 0) {
         throw new Error('Trying to set non-diagonal entry in diagonal matrix');
      }
      return false;
   };

   DiagM.prototype.toIndex = function toIndex(i, j) {
      return i;
   };
   DiagM.prototype.rowFromIndex = function rowFromIndex(n) {
      return n;
   };
   DiagM.prototype.colFromIndex = function colFromIndex(n) {
      return n;
   };

   DiagM.prototype.constr = function constr() {
      return DiagM;
   };

   return DiagM;
};

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
