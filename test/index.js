var should = require('chai').should();
var PEG = require("../grammar.js");

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

describe('translation', function() {
  it('translates a = 4, b = 5+a, c = 2*a', function() { // change this test!
    var r = PEG.parse('a = 4, b = 5+a, c = 2*a');
    r.should.match(/a\s*=\s*4,\s*b\s*=\s*5[+]a,\s*c\s*=\s*2[*]a/); 
  });
});

