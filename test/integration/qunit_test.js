var http = require('http');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var launcher = require('../../lib/saucelauncher-webdriver');
var serveQUnit = require('../utils').serveQUnit;

describe('QUnit - Integration', function() {
  this.timeout(120000);

  it('runs qunit tests and reports the result', function(done) {
    serveQUnit(function(port) {
      launcher({url: 'http://localhost:' + port}, function(err, result) {
        expect(err).to.not.exist();
        expect(result).to.have.deep.property('body.passed', true, 'Marked tests as passed');
        expect(result).to.have.deep.property('body.custom-data.qunit');

        var qunitResult = result.body['custom-data'].qunit;
        expect(qunitResult.failed).to.eq(0);
        expect(qunitResult.passed).to.eq(4);
        expect(qunitResult.total).to.eq(4);
        done();
      });
    });
  });

  it('fails when specifing a small timeout', function(done) {
    serveQUnit(function(port) {
      launcher({url: 'http://localhost:' + port, timeout: 1}, function(err, result) {
        expect(err).to.be.instanceof(Error);
        done();
      });
    });
  });
});
