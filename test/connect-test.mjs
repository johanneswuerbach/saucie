import { expect } from 'chai';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';

var require = createRequire(import.meta.url);
var connect = require('../lib/connect.js');

function mockHttpsResponse(body, statusCode) {
  return function(options, callback) {
    var res = new EventEmitter();
    res.statusCode = statusCode || 200;
    process.nextTick(function() {
      callback(res);
      if (statusCode && statusCode !== 200) {
        res.emit('end');
        return;
      }
      res.emit('data', JSON.stringify(body));
      res.emit('end');
    });
    var req = new EventEmitter();
    req.destroy = function() {};
    return req;
  };
}

describe('connect.prepareScBinary()', function() {
  it('preserves the SC binary path through tunnel cleanup', function() {
    return connect.prepareScBinary({ logger: function() {} }, {
      ensureScBinaryAsync: function() {
        return Promise.resolve('/tmp/sc');
      },
      stopExistingTunnelsAsync: function() {
        return Promise.resolve();
      }
    }).then(function(binPath) {
      expect(binPath).to.equal('/tmp/sc');
    });
  });
});

describe('connect.waitForApiReadiness()', function() {
  this.timeout(5000);

  it('resolves when a matching tunnel is ready', function(done) {
    var calls = 0;
    var fakeHttps = {
      get: function(options, callback) {
        calls++;
        var body = calls === 1
          ? [{ tunnel_identifier: 'my-tunnel', is_ready: false }]
          : [{ tunnel_identifier: 'my-tunnel', is_ready: true }];
        return mockHttpsResponse(body)(options, callback);
      }
    };

    connect.waitForApiReadiness({
      username: 'user',
      accessKey: 'key',
      tunnelIdentifier: 'my-tunnel'
    }, 5, 10, function(err) {
      expect(err).to.equal(null);
      expect(calls).to.equal(2);
      done();
    }, { https: fakeHttps });
  });

  it('rejects when credentials are missing', function(done) {
    connect.waitForApiReadiness({
      tunnelIdentifier: 'my-tunnel'
    }, 5, 10, function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.match(/SAUCE_USERNAME and SAUCE_ACCESS_KEY/);
      done();
    });
  });

  it('rejects immediately on authentication failure', function(done) {
    var fakeHttps = {
      get: mockHttpsResponse(null, 401)
    };

    connect.waitForApiReadiness({
      username: 'user',
      accessKey: 'bad-key',
      tunnelIdentifier: 'my-tunnel'
    }, 5, 10, function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.match(/authentication failed \(HTTP 401\)/);
      done();
    }, { https: fakeHttps });
  });

  it('rejects after max retries', function(done) {
    var fakeHttps = {
      get: mockHttpsResponse([{ tunnel_identifier: 'my-tunnel', is_ready: false }])
    };

    connect.waitForApiReadiness({
      username: 'user',
      accessKey: 'key',
      tunnelIdentifier: 'my-tunnel'
    }, 3, 10, function(err) {
      expect(err).to.be.instanceof(Error);
      expect(err.message).to.match(/API readiness timed out/);
      expect(err.message).to.match(/my-tunnel/);
      done();
    }, { https: fakeHttps });
  });
});
