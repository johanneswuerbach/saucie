var chai = require('chai');
var Bluebird = require('bluebird');

chai.use(require('dirty-chai'));
var expect = require('chai').expect;

var launcher = require('../../lib/index');
var connect = launcher.connect;
var disconnect = launcher.disconnect;
var serveQUnit = require('../utils').serveQUnit;

var PORT = 7000;
var url = 'http://localhost:' + PORT;

describe('QUnit - Integration', function() {
  this.timeout(300000);
  this.retries(2);

  var server;

  beforeEach(function (done) {
    serveQUnit(PORT, function(err, _server) {
      if (err) {
        return done(err);
      }

      server = _server;
      done();
    });
  });

  afterEach(function (done) {
    server.close(done);
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

  it('supports desktop browsers (selenium)', function(done) {
    launcher({
      url: url,
      platform: 'Windows',
      platformVersion: '10'
    }, function(err, result) {
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

  it('supports mobile browsers (appium)', function(done) {
    launcher({
      url: url,
      browser: 'Browser',
      deviceName: 'Android Emulator',
      deviceOrientation: 'portrait',
      platform: 'Android',
      platformVersion: '5.1'
    }, function(err, result) {
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

    return Bluebird.using(function () {
      return connect({
        pidfile: pidFile,
        logger: console.log,
        verbose: true,
        tunnelIdentifier: 'Manual-' + process.env.TRAVIS_JOB_NUMBER
      }).disposer(function() {
        return disconnect(pidFile);
      });
    }(), function () {
      return launcher({
        url: url,
        connect: false,
        tunnelIdentifier: 'Manual-' + process.env.TRAVIS_JOB_NUMBER
      }).then(function (result) {
        expect(result).to.have.deep.property('body.passed', true, 'Marked tests as passed');
        expect(result).to.have.deep.property('body.custom-data.qunit');
      });
    });
  });

  it('fails when specifing a small timeout', function() {
    return launcher({ url: url, timeout: 1 }).catch(function (err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.eq('Timeout: Element not there');
    });
  });
});
