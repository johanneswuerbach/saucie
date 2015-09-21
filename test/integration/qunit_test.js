var chai = require('chai');

chai.use(require('dirty-chai'));
var expect = require('chai').expect;

var launcher = require('../../lib/saucelauncher-webdriver');
var connect = launcher.connect;
var disconnect = launcher.disconnect;
var serveQUnit = require('../utils').serveQUnit;

describe('QUnit - Integration', function() {
  this.timeout(120000);

  var url;

  beforeEach(function (done) {
    serveQUnit(function(port) {
      url = 'http://localhost:' + port;
      done();
    });
  });

  it('runs qunit tests and reports the result', function(done) {
    launcher({url: url}, function(err, result) {
      if (err) {
        return done(err);
      }

      expect(result).to.have.deep.property('body.passed', true, 'Marked tests as passed');
      expect(result).to.have.deep.property('body.custom-data.qunit');

      var qunitResult = result.body['custom-data'].qunit;
      expect(qunitResult.failed).to.eq(0);
      expect(qunitResult.passed).to.eq(4);
      expect(qunitResult.total).to.eq(4);
      done();
    });
  });

  it('works when controlling the tunnel manually', function() {
    var pidFile = 'sc.pid';
    return connect({
      pidfile: pidFile,
      logger: console.log,
      verbose: true,
      tunnelIdentifier: 'Manual-' + process.env.TRAVIS_JOB_NUMBER
    }).then(function () {
      return launcher({
        url: url,
        connect: false,
        tunnelIdentifierSL: 'Manual-' + process.env.TRAVIS_JOB_NUMBER
      });
    }).then(function (result) {
      expect(result).to.have.deep.property('body.passed', true, 'Marked tests as passed');
      expect(result).to.have.deep.property('body.custom-data.qunit');

      return disconnect(pidFile);
    });
  });

  it('fails when specifing a small timeout', function(done) {
    launcher({url: url, timeout: 1}, function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.eq('Timeout: Element not there');
      done();
    });
  });
});
