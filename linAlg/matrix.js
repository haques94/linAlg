/**
 * Javascript implementation of Linear Algebra Matrices.
 * @module Matrix
 * @author Haris Skiadas <skiadas@hanover.edu>, Barb Wahl <wahl@hanover.edu>
 */
(function(define) {'use strict';
define(function(require) {

   var op;

   op = require('./utils').op;
   /**
    * The `Matrix` class is a representation of 2-dimensional algebraic matrices
    * with real entries. Their values are internally represented as `Vector`s.
    * One can access the matrix dimensions via the properties `nrow` and `ncol`.
    *
    * New `Matrix` objects are created via the `Matrix` constructor, which accepts
    * a number of options for its first argument, `arr`:
    *
    * 1. Called with another `Matrix`, simply returns the matrix itself.
    * 2. Called with a single array of values, constructs a matrix based on these values.
    * The dimensions and other properties of this array are determined by the second
    * argument, which is an object `options` containg one or more of the keys
    * `nrow`, `ncol`, `byRow`.
    * 3. Called with an array of arrays of values, it constructs a matrix with columns
    * based on those arrays. The number of arrays (length of `arr`) becomes `ncol`. The
    * arrays in `arr` are expected to have the same length, and that becomes `nrow`.
    * The options object is optional, but may contain a "byRow" entry, which if `true`
    * indicates that the roles of `column` and `row` would be interchanged, i.e.
    * the arrays in `arr` would become rows instead of columns.
    * 4. Called with a function `f(i,j)`, it uses that function to determine the `Matrix`'s
    * values. In that case an `options` second argument specifying `nrow` and `ncol` is needed.
    *
    * Examples:
    *
    *     // All these create:
    *     //        0 1 1
    *     //        2 0 1
    *     //
    *     new Matrix([0, 2, 1, 0, 1, 1], { nrow : 2 }); // by column default
    *     new Matrix([0, 1, 1, 2, 0, 1], { nrow : 2, byRow: true });
    *     new Matrix([[0, 1, 1], [2, 0, 1]], { byRow : true });
    *     new Matrix([[0, 2], [1, 0], [1, 1]]);
    *     // Sparse matrix:
    *     new Matrix({ 1: { 2: 1, 3: 1}, 2: { 1: 2, 3: 1 }}, { nrow : 2, ncol: 3 });
    *
    *     // The following produces in rows: [[1, 2, 3], [2, 4, 6]]
    *     new Matrix(function(i, j) { return i * j; }, { nrow: 2, ncol: 3 });
    */
   function Matrix(arr, options) {
      if (arr instanceof Matrix) { return arr; }
      return new Matrix.DenseM(arr, options);
   }

   /* The class `Vector` as it is accessed from `Matrix`. */
   Matrix.Vector   = require('./vector');
   /**
    * Subclass of `Matrix` representing "dense" matrices.
    * Dense matrices are internally stored simply as Javascript Arrays.
    * Users should not need to access this subclass directly.
    */
   Matrix.DenseM   = require('./matrix/dense')(Matrix);
   /**
    * Subclass of `Matrix` representing "sparse" matrices.
    * Sparse matrices are stored as objects, whose keys represent the indices
    * that have non-zero values.
    * Users should not need to access this subclass directly.
    */
   Matrix.SparseM  = Matrix.DenseM.SparseM;
   /**
    * Subclass of `Matrix` representing matrices whose values are specified via
    * a function `f(i)` of the index.
    * The values of the matrix are computed lazily, only when they are accessed.
    * Users should not need to access this subclass directly.
    */
   Matrix.TabularM = Matrix.DenseM.TabularM;
   /**
    * Subclass of `Matrix` acting as a superclass for classes of matrices
    * with extra structure. Users should not need to access this subclass
    * directly.
    */
   Matrix.StructuredM = require('./matrix/structured')(Matrix);
   /**
    * Subclass of `StructuredM` representing "Lower triangular" matrices.
    *
    * The constructor expects two arguments:
    * - The first argument,`values`, cam be:
    *     1. A full square matrix, in which case its lower triangular part is used.
    *     See also `Matrix.prototype.lower`. If the passed matrix is already of class
    *     `Matrix.LowerTriM`, it is simply returned by the constructor.
    *     2. A function `f(i, j)`. The second argument `nrow` is then needed to specify the
    *     number of rows/columns of the resulting matrix. The `nrow` argument may be either a
    *     number or an object with an `nrow` property.
    *     3. A single value, to be used for all entries. The second argument `nrow` is needed.
    */
   Matrix.LowerTriM   = Matrix.StructuredM.LowerTriM;
   /**
    * Subclass of `StructuredM` representing "Upper triangular" matrices.
    *
    * See `Matrix.LowerTriM` for the constructor parameters. See `Matrix.prototype.upper` for
    * obtaining the upper triangle of a given square matrix.
    */
   Matrix.UpperTriM   = Matrix.StructuredM.UpperTriM;
   /**
    * Subclass of `StructuredM` representing symmetric matrices.
    *
    * A symmetric matrix behaves exactly like a `Matrix.LowerTriM` matrix reflected across the
    * main diagonal.
    */
   Matrix.SymmetricM  = Matrix.StructuredM.SymmetricM;
   /**
     * Subclass of `Matrix` representing outer products of vectors (i.e., rank-1
     * matrices).  Users should not need to access this subclass directly.
    */
   Matrix.OuterM      = Matrix.StructuredM.OuterM;
   /**
     * Subclass of `Matrix` representing sums (A + k * B) of matrices.
     * Users should not need to access this subclass directly.
    */
   Matrix.SumM        = Matrix.StructuredM.SumM;
   /**
     * Subclass of `Matrix` representing products of matrices.
     * Users should not need to access this subclass directly.
    */
   Matrix.ProdM       = Matrix.StructuredM.ProdM;
   /**
    * Subclass of `Matrix` representing diagonal matrices.
    * Users should not need to access this subclass directly. Use `Matrix.diag` instead.
    *
    * One can only set values on the diagonal of a DiagM matrix.
    * Trying to set outside the diagonal will result in error.
    * In order to set values outside the diagonal, would need to
    * "unstructure" the matrix.
    *
    * Using rowView/colView on diagonal matrices may be quite inefficient,
    * as it does not recognize the sparse nature of those vectors.
    */
   Matrix.DiagM       = Matrix.StructuredM.DiagM;
   /**
    * Subclass of `Matrix` representing matrices that are constant multiples of
    * the identity. The constructor expects two arguments: `val` with the value to be
    * used, and `nrow`, which is either a number indicating the number of rows or
    * an object with an `nrow` property.
    *
    * CDiagM matrices are immutable.
    */
   Matrix.CDiagM      = Matrix.StructuredM.CDiagM;
   /**
    * Subclass of `Matrix` representing permutation matrices. The constructor expects two
    * arguments, a `perm` object that determines a `Permutation`, and an `nrow` number/object
    * specifying the matrix dimensions.
    *
    * Multiplying a non-permutation matrix m by a permutation matrix p
    * returns an appropriate view (`Matrix.ViewM`) into m.  Multiplying two permutation
    * matrices returns the matrix for the composed permutation (`Matrix.PermM`).
    */
   Matrix.PermM       = Matrix.StructuredM.PermM;
   /**
    * Subclass of `Matrix` representing submatrix views into another matrix. Changes
    * to the view are reflected on the original matrix and vice-versa. Use
    * `Matrix.prototype.view` to create these.
    *
    * See also: `Matrix.prototype.rowView`, `Matrix.prototype.colView`,
    * `Matrix.prototype.diagView`.
    */
   Matrix.ViewM    = require('./matrix/view')(Matrix);

   /**
    * Subclass of Vector that is used internally by `Matrix` for representing
    * the rows/columns/diagonals of a matrix as vectors.
    *
    * For creating these, see: `Matrix.prototype.rowView`, `Matrix.prototype.colView`,
    * `Matrix.prototype.diagView`.
    */
   Matrix.ViewMV    = require('./matrix/viewmv')(Matrix);

   /**
    * Class containing solvers for various linear systems. TODO: Add Solver module docs
    */
   Matrix.Solver    = require('./solver')(Matrix);
   // Static methods

   /**
    * Return a square diagonal matrix with values given by `diagonal`. The argument
    * `diagonal` may be an array, a `Vector`, or a function `f(i)`. In the latter case,
    * a second argument `len` is required to provide the length of the resulting diagonal.
    * `len` may also be an object with an `nrow` property.
    *
    * This method takes ownership of the `diagonal` vector and may
    * change its values when it itself is changed. Clone the
    * array/vector before passing it to avoid this.
    *
    * To obtain a diagonal of an arbitrary matrix, see `Matrix.prototype.diagView`.
    */
   Matrix.diag = function diag(diagonal, len) {
      return new Matrix.DiagM(diagonal, len);
   };

   /**
    * Return a constant multiple of the identity matrix. These matrices cannot become mutable.
    * They should be treated as constants.
    * The second argument, `nrow` can be the number of rows, or an object with an `nrow`
    * argument. For instance to create an identity matrix with size same as the matrix `A`
    * one would do:
    *
    *     Matrix.const(1, A);  // Identity matrix with dimension same as A.
    */
   Matrix.const = function constant(val, nrow) {
      return new Matrix.CDiagM(val, nrow);
   };

   /**
    * Return a permutation matrix based on the permutation indicated by `perm`. `perm` can be
    * a `Permutation` object, or anything that can be turned to one (see `Permutation`).
    */
   Matrix.perm = function perm(perm, nrow) {
      return new Matrix.PermM(perm, nrow);
   };
   /**
    * Bind the arguments row-wise into a matrix. The arguments may be a
    * mixture of matrices and vectors, but their `ncol/length` must all be the same.
    */
   Matrix.rowBind = function rowBind(matrices) {
      var ncol;
      matrices = [].concat.apply([], // byRow = true
         [].map.call(arguments, function(m) {
            return m instanceof Matrix ? m.toArray(true) : [m.toArray()];
         })
      );
      ncol = matrices[0].length;
      if (!matrices.every(function(m) { return m.length === ncol; })) {
         throw new Error('Trying to rowBind rows of unequal length.');
      }
      return new Matrix(matrices, true); // byRow = true
   };
   /** See `Matrix.rowBind` */
   Matrix.prototype.rowBind = function rowBind(matrices) {
      matrices = Array.prototype.slice.call(arguments);
      matrices.unshift(this);
      return Matrix.rowBind.apply(null, matrices);
   };
   /** See `Matrix.rowBind` */
   Matrix.Vector.rowBind = Matrix.rowBind;
   /** See `Matrix.rowBind` */
   Matrix.Vector.prototype.rowBind = Matrix.prototype.rowBind;

   /**
    * Bind the arguments column-wise into a matrix. The arguments may be a
    * mixture of matrices and vectors, but their `nrow/length` must all be the same.
    */
   Matrix.colBind = function colBind(matrices) {
      var nrow;
      matrices = [].concat.apply([], // byRow = false
         [].map.call(arguments, function(m) {
            return m instanceof Matrix ? m.toArray() : [m.toArray()];
         })
      );
      nrow = matrices[0].length;
      if (!matrices.every(function(m) { return m.length === nrow; })) {
         throw new Error('Trying to colBind columns of unequal length.');
      }
      return new Matrix(matrices, false); // byRow = false
   };
   /** See `Matrix.colBind` */
   Matrix.prototype.colBind = function colBind(matrices) {
      matrices = Array.prototype.slice.call(arguments);
      matrices.unshift(this);
      return Matrix.colBind.apply(null, matrices);
   };
   /** See `Matrix.colBind` */
   Matrix.Vector.colBind = Matrix.colBind;
   /** See `Matrix.colBind` */
   Matrix.Vector.prototype.colBind = Matrix.prototype.colBind;

   /**
    * The array of constructors for this type and its supertypes, in order from
    * most specific to most general.
    */
   Matrix.prototype.classes = [ Matrix ];

   /**
    * Return whether `constr` is in the list of class constructors produced by
    * `Matrix.prototype.classes`.
    */
   Matrix.prototype.isA = function(constr) {
      return this.classes.reduce(function(acc, con2) {
         return acc || constr === con2;
      }, false);
   };

   /**
    * Return a common constructor for `A` and `B`, from the lists provided by
    * `Matrix.prototype.classes`.
    */
   Matrix.commonConstr = function(A, B) {
      var i;
      for (i = 0; i < A.classes.length; i += 1) {
         if (B.isA(A.classes[i])) {
            return A.classes[i];
         }
      }
      throw new Error('Matrix is not a common ancestor for these BAD guys.');
   };

   /**
    * Return the value at location `(i, j)`. Returns `0` if accessing a location out
    * of bounds.
    *
    * Called with 0 or 1 arguments, it is an alias for `Matrix.prototype.toArray`.
    */
   Matrix.prototype.get = function get(i, j) {
      if (arguments.length <= 1) {
         return this.toArray(i || false);
      }
      return this._get(i, j);
   };

   /**
    * Internally used by `Matrix.prototype.get`. May be used in place of
    * `Matrix.prototype.get` if both arguments are always present.
    */
   Matrix.prototype._get = function _get(i, j) {
      if (!this.validIndices(i, j)) { return null; } // Out of matrix bounds fetch
      if (!this.validate(i, j)) { return 0; }        // Out of structure fetch
      return this.compute(i, j);
   };

   /**
    * Computes the value at the (i, j) location. _Internal method_. Use `Matrix.prototype.get`
    * instead.
    */
   Matrix.prototype.compute = function compute(i, j) {
      return this.values.get(this.toIndex(i, j));
   };

   /**
    * Set the value of the matrix at the `(i, j)` location to `val`. Requires that
    * the matrix be set to be mutable.
    *
    * If called with only one argument, then that argument may be a function `f(i, j)`, or
    * a single value, or a `Matrix` with the same dimensions. That argument will then be used
    * to set all the values of the Matrix.
    *
    *     var A1 = new Matrix([1, 2, 3, 4, 5, 6], { nrow: 2, byRow: true });
    *     A1.set(1, 1, 42);    // Throws an exception
    *     A1.mutable(true);    // Set matrix to mutable
    *     A1.set(2, 2, 42);    // Changes 5 to 42
    *     A1.set(Math.random); // Fills A1 with random values
    *     A1.set(5);           // Sets all entries to 5
    *     var A2 = new Matrix([1, 2, 3, 4, 5, 6], { nrow: 2, byRow: true });
    *     A1.set(A2);          // Sets all values of A1 based on those from A2
    *     A1.set(1, 1, 42);    // Only changes A1, not A2
    *
    * Trying to set at an out-of-bounds location results in an exception. If the matrix is
    * "structured", trying to set at a location outside the structure (e.g. an off-diagonal
    * entry of a diagonal matrix) also results in an exception.
    *
    * __NOTE__: In order to avoid unnecessary computations, many matrix operations avoid
    * computing their values until those values are called for. If you have used a matrix or
    * vector in the construction of other matrices/vectors, then you should avoid changing
    * that matrice's values, as the effects of those changes on the dependent objects are
    * unpredictable. In general, you should treat a matrix that has been used in the creation
    * of other matrices as an immutable object, unless `Matrix.prototype.force` has been called
    * on those other matrices.
    */
   Matrix.prototype.set = function set(i, j, val) {
      function changeAll(target, vals) {
         var row, col;
         function makeLookup(vals) {
            if (typeof vals === 'function') { return vals; }
            if (vals instanceof Matrix) {
               Matrix.ensureSameDims(target, vals);
               return vals.get.bind(vals);
            }
            return function(i, j) { return vals; };
         }
         vals = makeLookup(vals);
         target.each(function(val, i, j) { target._set(i, j, vals(i, j)); });
      }
      if (arguments.length === 1) {
         changeAll(this, i);
      } else {
         this._set(i, j, val);
      }
      return this;
   };

   /**
    * Internally used by `Matrix.prototype.set`. _Internal method_. May be used
    * instead of `Matrix.prototype._set` if all three arguments are always present.
    */
   Matrix.prototype._set = function _set(i, j, val) {
      if (!this.validate(i, j, val) || !this.validIndices(i, j)) {
         throw new Error('Setting out of Matrix bounds');
      }
      return this.change(i, j, val);
   };

   /**
    * Internal method used by `Matrix.prototype._set` to change the value of the
    * matrix at a particular location. _Internal method_. This method bypasses
    * various checks and should only be used with extreme care.
    */
   Matrix.prototype.change = function change(i, j, val) {
      this.values._set(this.toIndex(i, j), val);
      return this;
   };

   /**
    * Overriden by subclasses that need special index/value validation.
    *
    * This method will be called from `Matrix.prototype._get` with two arguments `(i, j)`.
    * It should return whether the pair `(i, j)` is valid for that array's structure, without
    * worrying about being out of bounds (which is checked separately).
    *
    * This method is also called from `Matrix.prototype._set` with three arguments
    * `(i, j, val)`, where `val` is the value that is to be set in those coordinates.
    * It should either return `false ` or throw an error if the assignment should not
    * happen, and return true if it should be allowed to happen.
    */
   Matrix.prototype.validate = function validate(i, j, val) {
      return true;
   };
   /**
    * Return an array of arrays representing the matrix. This representation is
    * as an array of columns (or an array of rows if `byRow` is `true`).
    *
    *     var A = new Matrix([1, 2, 3, 4, 5, 6], { byRow: true, nrow: 3 });
    *     A.toArray(true);  // [[1, 2], [3, 4], [5, 6]]
    *     A.toArray(false); // [[1, 3, 5], [2, 4, 6]]
    */
   Matrix.prototype.toArray = function toArray(byRow) {
      var arr = [];
      if (byRow) {
         this.eachRow(function(row) {
            arr.push(row.toArray());
         });
      } else {
         this.eachCol(function(col) {
            arr.push(col.toArray());
         });
      }
      return arr;
   };

   /**
    * Return a flat vector of the matrix values by concatenating its
    * columns (or its rows if `byRow` is true). This is not a view into
    * the matrix, and cannot be used to change the matrix values.
    */
   Matrix.prototype.toVector = function toVector(byRow) {
      var obj;
      byRow = byRow || false;
      obj = { nrow: this.nrow, ncol: this.ncol, byRow: byRow };
      return new Matrix.Vector(function(n) {
         return this.get(this.rowFromIndex.call(obj, n),
                         this.colFromIndex.call(obj, n));
      }.bind(this), this.nrow * this.ncol);
   };

   /** Force unresolved computations for the matrix. */
   Matrix.prototype.force = function force() {
      return this;
   };

   /**
    * Return the constructor method to be used for creating new objects of
    * this type.
    *
    * Each of these constructors will accept the parameter list `(f, obj)`
    * where `f(i, j)` is a function for generating matrix values, and `obj`
    * has properties `nrow` and `ncol`.
    */
   Matrix.prototype.constr = function constr() {
      return Matrix;
   };

   /**
    * Create a clone of the matrix. The clone inherits the values that the matrix
    * has at the time of cloning. If `faithful` is `true` (default), then the clone
    * also inherits any structure (e.g. being diagonal) when possible.
    *
    * Unfaithful clones are useful if you want to set values of a structured matrix
    * outside of the structure (e.g. setting off-diagonal elements on a diagonal matrix).
    * In general, `Matrix.prototype.set` respects any imposed structure the matrix has
    * on its creation.
    */
   Matrix.prototype.clone = function clone(faithful) {
      if (faithful === false) { // Want faithful to default to true
         return this._clone();
      }
      return this._faithfulClone();
   };
   /* Unfaithful clone. Returns a dense matrix. */
   Matrix.prototype._clone = function _clone() {
      return new Matrix(this.toArray());
   };
   /* Faithful clone. Goes through Matrix#map. */
   Matrix.prototype._faithfulClone = function _faithfulClone() {
      return this.map(function(x) { return x; }).force();
   };

   /** Return the solution to `Ax = b`, where `A` is `this` and  `b` is a `Matrix` or `Vector`.
    * Only works for square non-singular matrices `A` at the moment. */
   Matrix.prototype.solve = function solve(b) {
      if (this._solver == null) { this._solver = this.getSolver(); }
      if (this._solver.isSingular()) { throw new Error('System not solvable'); }
      return this._solver.solve(b);
   };

   /** Internally used to obtain a solver for systems. */
   Matrix.prototype.getSolver = function getSolver() {
      return new Matrix.Solver(this);
   };

   /** Return the inverse of `this`, if `this` is a square non-singular matrix. */
   Matrix.prototype.inverse = function inverse() {
      return this.solve(Matrix.const(1, this));
   };

   /*
    * Return the vector index that would correspond to the i-th row and j-th column.
    * This is used to access the appropriate location in the vector that represents
    * the matrix's values. _This is an internal method_.
    */
   Matrix.prototype.toIndex = function toIndex(i, j) {
      return this.byRow ? (i - 1) * this.ncol + j : (j - 1) * this.nrow + i;
   };
   /*
    * Return the row corresponding to the vector index `n`. This is a partial
    * inverse to `Matrix.prototype.toIndex`. _This is an internal method_.
    */
   Matrix.prototype.rowFromIndex = function rowFromIndex(n) {
      if (this.byRow) {
         return Math.floor((n - 1) / this.ncol) + 1;
      }
      return (n - 1) % this.nrow + 1;
   };
   /*
    * Return the column corresponding to the vector index `n`. This is a partial
    * inverse to `Matrix.prototype.toIndex`. _This is an internal method_.
    */
   Matrix.prototype.colFromIndex = function colFromIndex(n) {
      if (this.byRow) {
         return (n - 1) % this.ncol + 1;
      }
      return Math.floor((n - 1) / this.nrow) + 1;
   };
   /**
    * Return the outer product matrix of two vectors. If a function
    * `f(val1, val2, i, j)` is provided as the second argument, it will be used.
    * If no second argument is provided, the usual multiplication of numbers is
    * used resulting in the standard outer product.
    *
    * TODO: Include helpful examples.
    *
    * TODO: Find a way to add this the Vector docs
    * @memberof Vector
    */
   Matrix.Vector.prototype.outer = function outer(v2, f) {
      var tabf;
      if (f == null) { return new Matrix.OuterM(this, v2); }
      f = op[f] != null ? op[f] : f;
      tabf = function(i, j) { return f(this.get(i), v2.get(j), i, j); }.bind(this);
      return new Matrix(tabf, { nrow: this.length, ncol: v2.length });
   };

   /**
    * Return `this + k * other`, where `this` and `other` are matrices of the
    * same dimensions, and `k` is a scalar.
    */
   Matrix.prototype.pAdd = function pAdd(other, k) {
      return new Matrix.SumM(this, other, k);
   };

   /**
    * Return `k * this`, where `k` is a scalar (required numerical argument).
    */
   Matrix.prototype.sMult = function sMult(k) {
      return this.map(function(val) { return k * val; });
   };

   /**
    * Return the matrix product `this * other`, where `this` and `other` have
    * compatible dimensions.
    */
   Matrix.prototype.mult = function mult(other) {
      return new Matrix.ProdM(this, other);
   };
   /** TODO: Find a way to add to Vector docs */
   Matrix.Vector.prototype.mult = function mult(other) {
      return new Matrix.ProdM(this, other);
   };
   /**
    * Multiply the matrix on the left with a vector `vec`. `vec.length` must equal `this.nrow`.
    * Returns a vector of length `this.ncol`. This is an _internal method_ and bypasses certain tests.
    */
   Matrix.prototype.lvMult = function lvMult(vec) {
      return new Matrix.Vector(function(j) {
         return vec.dot(this.colView(j));
      }.bind(this), this.ncol);
   };
   /**
    * Multiply on the right with a vector `vec`. `vec.length` must equal `this.ncol`.
    * Returns a vector of length `this.nrow`. This is an _internal method_ and bypasses certain tests.
    */
   Matrix.prototype.rvMult = function rvMult(vec) {
      return new Matrix.Vector(function(i) {
         return vec.dot(this.rowView(i));
      }.bind(this), this.nrow);
   };
   /**
    * Return a view into a submatrix of `this`.
    *
    * The parameters `rowIndex`, `colIndex`
    * may be either arrays or functions `f(i)` used to obtain the indices.
    * In the latter case, a third argument `dims` is required.
    *
    * `dims` is an object with properties `nrow` or `ncol` as needed, specifying the
    * dimensions of the resulting matrix.
    *
    *     // A 2x3 matrix
    *     var A1 = new Matrix([2, 3, 4, 5, 6, 7], { nrow: 2 });
    *     // Both return a view into the 2nd & 3rd columns as a 2x2 matrix
    *     var A2 = A1.view([1, 2], [2, 3]);
    *     var A2 = A1.view([1, 2], function(j) { return 1 + j; }, { ncol: 2 });
    *
    * The View matrix (vector) is linked to the original matrix.
    * The mutable state of the view is that of the original
    * matrix. Changing the values in the view also changes the values in the matrix,
    * and vice versa. Use `Matrix.prototype.clone` on the view matrix to break the link.
    */
   Matrix.prototype.view = function view(rowIndex, colIndex, dims) {
      return new Matrix.ViewM(this, rowIndex, colIndex, dims);
   };
   /** Return a `Vector` view of the `i`-th row of the matrix. */
   Matrix.prototype.rowView = function rowView(i) {
      return new Matrix.ViewMV(this, i, 'row');
   };
   /** Return a `Vector` view of the `j`-th column of the matrix. */
   Matrix.prototype.colView = function colView(j) {
      return new Matrix.ViewMV(this, j, 'col');
   };
   /** Return an array of all matrix rows as rowViews */
   Matrix.prototype.rows = function rows() {
      var res, i;
      res = [];
      for (i = 1; i <= this.nrow; i += 1) { res.push(this.rowView(i)); }
      return res;
   };
   /** Return an array of all matrix columns as colViews */
   Matrix.prototype.cols = function cols() {
      var res, j;
      res = [];
      for (j = 1; j <= this.ncol; j += 1) { res.push(this.colView(j)); }
      return res;
   };
   /**
    * Return a `Vector` view of the diagonal of the matrix specified by
    * the given `offset` (defaults to 0). The main diagonal has offset 0, the diagonal
    * above it has offset 1, while the one below the main diagonal has offset -1.
    * Asking for a diagonal beyond the matrix bounds results in an error.
    *
    *     var A1 = new Matrix([2, 3, 4, 5, 6, 7], { nrow: 2 });
    *     A1.diagView();    // [2, 5];
    *     A1.diagView(-1);  // [3];
    *     A1.diagView(1);   // [4, 7];
    *     A1.diagView(2);   // [6];
    *     A1.diagView(3);   // Error;
    */
   Matrix.prototype.diagView = function diagView(offset) {
      return new Matrix.ViewMV(this, offset || 0, 'diag');
   };

   /** Permute the rows of the matrix. */
   Matrix.prototype.rowPermute = function rowPermute(perm) {
      return Matrix.perm(perm, this.nrow).mult(this);
   };

   /** Permute the columns of the matrix. */
   Matrix.prototype.colPermute = function colPermute(perm) {
      return this.mult(Matrix.perm(perm, this.ncol).transpose());
   };

   /**
    * With no arguments, returns the mutable state of the matrix.
    *
    * With a boolean argument, sets the mutable state of the matrix and returns
    * the matrix.
    */
   Matrix.prototype.mutable = function mutable(newSetting) {
      if (newSetting != null) {
         this.values.mutable(newSetting);
         return this;
      }
      return this.values.mutable();
   };

   /**
    * Apply the given function to each entry in the matrix. The signature of the
    * function is `f(val, i, j)`.
    *
    * `Each` respects the "structure" of the matrix. For instance
    * on a `SparseM` matrix, it will only be called on the non-zero entries, on a
    * `DiagM` matrix it will only be called on the diagonal entries, on a `SymmetricM`
    * matrix it will be called on only roughly one half of the entries and so on.
    *
    * If you really need the function to be called on _each_ matrix entry, regardless of
    * structure, then you should use `Matrix.prototype.clone` first to create an
    * "unfaithful clone".
    */
   Matrix.prototype.each = function each(f) {
      var i, j;
      for (i = 1; i <= this.nrow; i += 1) {
         for (j = 1; j <= this.ncol; j += 1) {
            f(this.compute(i, j), i, j);
         }
      }
   };
   /** Alias for `Matrix.prototype.each` */
   Matrix.prototype.forEach = function(f) { return this.each(f); };

   /**
    * Apply the function `f` to each row in the matrix. The signature of `f` is
    * `f(row, i)` where `row` is a `Vector` object representing the `i`-th row.
    */
   Matrix.prototype.eachRow = function eachRow(f) {
      var i;
      for (i = 1; i <= this.nrow; i += 1) {
         f(this.rowView(i), i);
      }
      return this;
   };

   /**
    * Apply the function `f` to each column in the matrix. The signature of `f` is
    * `f(col, j)` where `col` is a `Vector` object representing the `j`-th col.
    */
   Matrix.prototype.eachCol = function eachCol(f) {
      var j;
      for (j = 1; j <= this.ncol; j += 1) {
         f(this.colView(j), j);
      }
      return this;
   };

   /**
    * Return the accumulated value of the calls of `f(acc, val, i, j)` over the entries
    * of the matrix, with `acc` starting with value `initial`.
    *
    * `Matrix.prototype.reduce` is similar to `Matrix.prototype.each` in how it deals
    * with structured matrices.
    *
    * Compare with `Vector.prototype.reduce`.
    *
    *     var A = new Matrix(Math.random, { nrow: 3, ncol: 2 });
    *     // Counts the number of entries in A which exceed 0.5
    *     A.reduce(function(acc, val, i, j) {
    *       return acc + (val > 0.5 ? 1 : 0);
    *     }, 0);
    */
   Matrix.prototype.reduce = function reduce(f, initial) {
      this.each(function(val, i, j) {
         initial = f(initial, val, i, j);
      });
      return initial;
   };

   /**
    * Return the accumulated value of the calls of `f(acc, row, i, j)` over the rows
    * of the matrix, with `acc` starting with value `initial`.
    *
    *     // Add the rows in A with 2-norm >= 1
    *     A.reduce(function(acc, row, i, j) {
    *       if (row.norm() >= 1) { return acc.pAdd(row); }
    *       return acc;
    *     }, Vector.const(0, A.ncol));
    */
   Matrix.prototype.reduceRow = function reduceRow(f, initial) {
      var i;
      for (i = 1; i <= this.nrow; i += 1) {
         initial = f(initial, this.rowView(i), i);
      }
      return initial;
   };

   /**
   * Return the accumulated value of the calls of `f(acc, col, i, j)` over the columns
   * of the matrix, with `acc` starting with value `initial`.
    */
   Matrix.prototype.reduceCol = function reduceCol(f, initial) {
      var j;
      for (j = 1; j <= this.ncol; j += 1) {
         initial = f(initial, this.colView(j), j);
      }
      return initial;
   };

   // WE ARE HERE!
   /**
    * Apply the function `f(val, i, j)` to every entry of the matrix, and assemble the
    * returned values into a new matrix. Just like `Matrix.prototype.each`, this method
    * respects the structure of the input matrix, and will return a matrix with the
    * same structure, only applying `f` on the values pertinent to the structure.
    *
    * If you really need the function to be called on _each_ matrix entry, regardless of
    * structure, then you should use `Matrix.prototype.clone` first to create an
    * "unfaithful clone".
    *
    *     // Create a matrix containing the absolute values of the values in A.
    *     A.map(Math.abs);
    */
   Matrix.prototype.map = function map(f) {
      return new (this.constr())(function(i, j) {
         return f(this.get(i, j), i, j);
      }.bind(this), this);
   };

   /**
    * Apply the function `f(row, i)` to each row in the matrix, and assemble the resulting
    * values.
    *
    * If the return values of `f` are numbers, they are assembled into a `Vector`. If they
    * are arrays or `Vector`s, then they must be of the same length, and they are assembled
    * into a matrix with `nrow` equal to the original matrix's `nrow`, and `ncol` equal to
    * the value's length.
    *
    *     // Create an n x 3 array of the index, 1-norm and 2-norm of each row.
    *     A.mapRow(function(row, i) { return [i, row.norm(1), row.norm(2) ]; });
    */
   Matrix.prototype.mapRow = function mapRow(f) {
      var newRows = [];
      this.eachRow(function(row, i) { newRows.push(f(row, i)); });
      if (newRows[0] instanceof Matrix.Vector) {
         return new Matrix(newRows.map(function(row) {
            return row.toArray();
         }), true);
      }
      if (Array.isArray(newRows[0])) {
         return new Matrix(newRows, true);
      }
      // values of f are numbers
      return new Matrix.Vector(newRows);
   };

   /**
    * Similar to `Matrix.prototype.mapRow`, but operating on the columns of the matrix
    * instead.
    */
   Matrix.prototype.mapCol = function mapCol(f) {
      var newCols = [];
      this.eachCol(function(col, j) { newCols.push(f(col, j)); });
      if (newCols[0] instanceof Matrix.Vector) {
         return new Matrix(newCols.map(function(col) {
            return col.toArray();
         }));
      }
      if (Array.isArray(newCols[0])) {
         return new Matrix(newCols);
      }
      // values of f are numbers
      return new Matrix.Vector(newCols);
   };

   /**
    * Apply function `f(val1, val2, i, j)` to all pairwise entries of `this` and `other`.
    * The matrices must have the same dimensions. No promises are made about the order of
    * iteration.
    */
   Matrix.prototype.eachPair = function eachPair(other, f) {
      var i, j;
      Matrix.ensureSameDims(this, other);
      for (i = 1; i <= this.nrow; i += 1) {
         for (j = 1; j <= this.ncol; j += 1) {
            f(this.get(i, j), other.get(i, j), i, j);
         }
      }
   };

   /**
    * Reduce on the pair of matrices `this` and `other` using the function
    * `f(acc, val1, val2, i, j)`, with an `initial` value.
    * The matrices must have the same dimensions. No promises are made about the order of
    * iteration.
    */
   Matrix.prototype.reducePair = function reducePair(other, f, initial) {
      var i, j;
      Matrix.ensureSameDims(this, other);
      for (i = 1; i <= this.nrow; i += 1) {
         for (j = 1; j <= this.ncol; j += 1) {
            initial = f(initial, this.get(i, j), other.get(i, j), i, j);
         }
      }
      return initial;
   };

   /**
    * Create a new matrix by applying the function `f(val1, val2, i, j)` to all pairwise entries
    * of `this` and `other`. No matrix structure is preserved.
    * The matrices must have the same dimensions.
    */
   Matrix.prototype.mapPair = function mapPair(other, f) {
      Matrix.ensureSameDims(this, other);
      return new Matrix(function(i, j) {
         return f(this.get(i, j), other.get(i, j), i, j);
      }.bind(this), this);
   };

   /**
    * Return true, if the predicate `pred(val, i, j)` is true for at least one entry,
    * false otherwise.
    */
   Matrix.prototype.any = function any(pred) {
      var i, j;
      for (i = 1; i <= this.nrow; i += 1) {
         for (j = 1; j <= this.ncol; j += 1) {
            if (pred(this.get(i, j), i, j)) { return true; }
         }
      }
      return false;
   };

   /** Return true, if the predicate `pred(val, i, j)` is true for all entries, false otherwise. */
   Matrix.prototype.all = function all(pred) {
      var i, j;
      for (i = 1; i <= this.nrow; i += 1) {
         for (j = 1; j <= this.ncol; j += 1) {
            if (!pred(this.get(i, j), i, j)) { return false; }
         }
      }
      return true;
   };

   /** Return the transpose of the matrix, preserving any appropriate structure. */
   Matrix.prototype.transpose = function transpose() {
      return new Matrix(function(i, j) {
         return this.get(j, i);
      }.bind(this), { nrow: this.ncol, ncol: this.nrow });
   };

   /**
    * Return a lower-triangular matrix created by the lower triangle of `this`.
    */
   Matrix.prototype.lower = function lower() {
      return new Matrix.LowerTriM(this);
   };
   /**
    * Return a upper-triangular matrix created by the upper triangle of `this`.
    */
   Matrix.prototype.upper = function upper() {
      return new Matrix.UpperTriM(this);
   };

   Matrix.prototype.isSymmetric = function isSymmetric() {
      return this.equals(this.transpose());
   };

   Matrix.prototype.isLower = function isLower() {
      return this.equals(this.lower());
   };

   Matrix.prototype.isUpper = function isUpper() {
      return this.equals(this.upper());
   };

   /** Test if `this` pointwise equals `m2`, within a given pointwise `tolerance`
    * (defaults to `Vector.tolerance`). */
   Matrix.prototype.equals = function equals(m2, tolerance) {
      var i;
      if (!Matrix.sameDims(this, m2)) { return false; }
      for (i = 1; i <= this.nrow; i += 1) {
         if (!this.rowView(i).equals(m2.rowView(i), tolerance)) {
            return false;
         }
      }
      return true;
   };

   /** Return whether the matrix `A` has the same dimensions as the matrix `B`. */
   Matrix.sameDims = function sameDims(A, B) {
      return A.nrow === B.nrow && A.ncol === B.ncol;
   };

   /** Throw error if `A`, `B` don't have same dimensions. */
   Matrix.ensureSameDims = function ensureSameDims(A, B) {
      if (!Matrix.sameDims(A, B)) {
         throw new Error('Expected matrices of same dimensions.');
      }
   };

   /**
    * Return whether `A` and `B` have compatible dimensions for
    * forming the product `A * B`.  If `A` and; `B` are not both matrices, then
    * one of them is a matrix and the other is a vector.
    */
   Matrix.compatibleDims = function compatibleDims(A, B) {
      if (A instanceof Matrix.Vector) { return A.length === B.nrow; }
      if (B instanceof Matrix.Vector) { return A.ncol === B.length; }
      return A.ncol === B.nrow;
   };

   /**
    * Return whether the (i, j) pair is within the matrix's bounds. Matrices with extra
    * extra structure do further checks via `Matrix.prototype.validate`.
    */
   Matrix.prototype.validIndices = function validIndices(i, j) {
      return i >= 1 && i <= this.nrow && j >= 1 && j <= this.ncol;
   };

   return Matrix;
});

}(typeof define === 'function' && define.amd ? define : function(factory) {
   'use strict';
   module.exports = factory(require);
}));
