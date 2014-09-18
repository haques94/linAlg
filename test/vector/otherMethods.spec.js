var Vector = require('../../linAlg/vector');
var expect = require('chai').expect;
var delta = 1e-5;

describe('Other methods', function() {
   var v1 = new Vector([4, -2, 1]);
   var v2 = new Vector({ 6: -2, 2: 4, 5: 1 }, 10);
   var v3 = new Vector(function(x) { return x*x; }, 4);   
   it('diff', function() {
      expect(v1.diff().toArray()).to.deep.equal([-6, 3]);
      expect(v2.diff().toArray())
         .to.deep.equal([4, -4, 0, 1, -3, 2, 0, 0, 0]);
      expect(v3.diff().toArray()).to.deep.equal([3, 5, 7]);
      expect(new Vector([1]).diff().length).to.equal(0);
      expect(new Vector([]).diff().length).to.equal(-1); // WOAH!
   });
   it('cumulative', function() {
      expect(v1.cumulative(function(a, b) { return a + b * b; }, 1).toArray())
         .to.deep.equal([17, 21, 22]);
      expect(v1.cumSum().toArray()).to.deep.equal([4, 2, 3]);
      expect(v1.cumMax().toArray()).to.deep.equal([4, 4, 4]);
      expect(v1.cumMin().toArray()).to.deep.equal([4, -2, -2]);
      expect(v2.cumSum().toArray()).to.deep.equal([0, 4, 4, 4, 5, 3, 3, 3, 3, 3]);
      expect(v2.cumMax().toArray()).to.deep.equal([0, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
      expect(v2.cumMin().toArray()).to.deep.equal([0, 0, 0, 0, 0, -2, -2, -2, -2, -2]);
   });
   it('equals', function() {
      expect(v1.equals(v1)).to.be.ok;
      expect(v2.equals(v2)).to.be.ok;
      expect(v1.equals(v2)).to.not.be.ok;
      expect(v1.equals(v3)).to.not.be.ok;
      expect(v3.equals(v2)).to.not.be.ok;
      var v4 = new Vector([4.0002, -2, 1]);
      expect(v4.equals(v1)).to.not.be.ok;
      expect(v4.equals(v1, 1e-3)).to.be.ok;
      var v5 = new Vector([4, 2.5, 3, NaN]);
      expect(v5.equals(v5)).to.not.be.ok; 
   });
});