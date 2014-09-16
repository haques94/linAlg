(function(define) {'use strict';
define(function(require) {

return function(Matrix, StructuredM) {
   // return A + kB
   function SumM(A, B, k) {
      if (k == null) { k = 1; }
      if (!Matrix.sameDims(A, B)) {
         throw new Error('Cannot add matrices with different dimensions.');
      }
      return computeSum(A, B, k);
   }

   SumM.prototype = Object.create(StructuredM.prototype);

   function computeSum(A, B, k) {
      // if both sparse, return a sparse (via SparseM.add??)
      if (A.isA(Matrix.DenseM.SparseM) && B.isA(Matrix.DenseM.SparseM)) {
         return Matrix.DenseM.SparseM.add(A, B, k);
      }
      // if both cdiag, return a cdiag
      if (A.isA(StructuredM.CDiagM) && B.isA(StructuredM.CDiagM)) {
         return StructuredM.CDiagM.add(A, B, k);
      }
      // in every other case, use commonConstr (give constructor a function)
      return new (Matrix.commonConstr(A, B))(function(i, j) {
         return A.get(i, j) + k * B.get(i, j);
      }, A);
   }

   return SumM;
};

});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
