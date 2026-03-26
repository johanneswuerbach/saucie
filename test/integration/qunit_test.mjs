import { expect } from 'chai';
import launcher from '../../lib/index.js';
import { serveQUnit } from '../utils.mjs';

var connect = launcher.connect;

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

      expect(result).to.have.nested.property('body.passed', true, 'Marked tests as passed');
      expect(result).to.have.nested.property('body.custom-data.qunit');

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

      expect(result).to.have.nested.property('body.passed', true, 'Marked tests as passed');
      expect(result).to.have.nested.property('body.custom-data.qunit');

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
      browser: 'Chrome',
      deviceName: 'Android GoogleAPI Emulator',
      deviceOrientation: 'portrait',
      platform: 'Android',
      platformVersion: '12.0'
    }, function(err, result) {
      if (err) {
        return done(err);
      }

      expect(result).to.have.nested.property('body.passed', true, 'Marked tests as passed');
      expect(result).to.have.nested.property('body.custom-data.qunit');

      var qunitResult = result.body['custom-data'].qunit;
      expect(qunitResult.failed).to.eq(0);
      expect(qunitResult.passed).to.eq(4);
      expect(qunitResult.total).to.eq(4);
      done();
    });
  });

  it('works when controlling the tunnel manually', function() {
    var tunnelId = 'Manual-' + (process.env.GITHUB_RUN_ID || 'saucie');
    var tunnel;

    return connect({
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      region: 'us-west',
      logger: console.log,
      tunnelIdentifier: tunnelId
    }).then(function(sc) {
      tunnel = sc;
      return launcher({
        url: url,
        connect: false,
        tunnelIdentifier: tunnelId
      }).then(function (result) {
        expect(result).to.have.nested.property('body.passed', true, 'Marked tests as passed');
        expect(result).to.have.nested.property('body.custom-data.qunit');
      });
    }).then(
      function()    { return new Promise(function(res, rej) { tunnel.close(function(e) { e ? rej(e) : res(); }); }); },
      function(err) { return new Promise(function(res, rej) { tunnel.close(function()  { rej(err); }); }); }
    );
  });

  it('fails when specifing a small timeout', function() {
    return launcher({ url: url, timeout: 1 }).catch(function (err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.eq('Timeout: Element not there');
    });
  });
});
