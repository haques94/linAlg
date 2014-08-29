var Vector = require('../../linAlg/vector');
var DenseV = Vector.DenseV;
var expect = require('chai').expect;

describe('Dense vectors', function() {
   it('have a constructor Vector.DenseV and are Vector\'s', function() {
      expect(DenseV).to.exist;
      var v1 = new DenseV([4,6,7]);
      expect(v1).to.be.instanceof(DenseV);
      expect(v1).to.be.instanceof(Vector);
   });
   it('are formed when the Vector constructor is fed an array', function() {
      expect(new Vector([4,6,7])).to.be.instanceof(DenseV);
   });
   it('are 1-indexed', function() {
      var v1 = new Vector([4,6,7]);
      expect(v1).to.respondTo('get');
      expect(v1.get(0)).to.equal(0);
      expect(v1.get(1)).to.equal(4);
      expect(v1.get(2)).to.equal(6);
      expect(v1.get(3)).to.equal(7);
      expect(v1.get(10)).to.equal(0);
   });
})