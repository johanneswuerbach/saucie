var util = require('util');
var net = require('net');

var remoteBrowser = require('./remote-browser');
var loadJsReporter = require('./js-testing-reporter');
var Config = require('./config');
var updateJobStatus = require('./update-job-status');
var getTestResults = require('./get-test-results');
var tunnel = require('./tunnel');

// Chrome on Sauce Labs VMs bypasses the SC proxy for loopback addresses (localhost/127.0.0.1).
// To work around this, we detect the local machine's outbound IP and substitute it into the URL.
// Chrome routes non-loopback IPs through the SC proxy, which tunnels back to the local server.
function resolveLocalhostUrl(url) {
  if (!/localhost|127\.0\.0\.1/.test(url)) {
    return Promise.resolve(url);
  }
  return new Promise(function(resolve) {
    var socket = net.createConnection({ host: '8.8.8.8', port: 53 });
    socket.setTimeout(2000);
    socket.once('connect', function() {
      var ip = socket.localAddress;
      socket.destroy();
      var resolved = url.replace(/localhost|127\.0\.0\.1/, ip);
      console.log('# Resolved localhost to ' + ip + ' for SC tunnel routing');
      resolve(resolved);
    });
    socket.once('error', function() { resolve(url); });
    socket.once('timeout', function() { socket.destroy(); resolve(url); });
  });
}

function withDisposer(resourcePromise, fn) {
  return resourcePromise.then(function(resource) {
    return Promise.resolve(fn(resource.value)).then(
      function(result) { return resource.dispose().then(function() { return result; }); },
      function(err) { return resource.dispose().then(function() { throw err; }); }
    );
  });
}

function launch(options) {
  options = options || {};

  var config = new Config(options);
  var auth = config.auth();
  var desired = config.desired();
  var integrationTestURL = config.url;
  var timeout = config.timeout;

  if (!auth.username || !auth.accessKey) {
    var msg = "Please, provide the username and the access key for SauceLabs. Use the option --help for more information.";
    return Promise.reject(new Error(msg));
  }

  var closed = false;
  'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function(evt) {
    process.on(evt, function() {
      closed = true;
    });
  });

  return resolveLocalhostUrl(integrationTestURL).then(function(resolvedUrl) {
    integrationTestURL = resolvedUrl;
  }).then(function() {
    return loadJsReporter();
  }).then(function (jsReporter) {
    return withDisposer(tunnel(config), function () {
      return withDisposer(remoteBrowser(desired, auth, integrationTestURL), function (browser) {
        console.log("# Tests started.");

        return new Promise(function (resolve) {
          if (closed || !config.attach) {
            return resolve();
          }

          console.log("# Waiting for termination.");
          process.stdin.resume();
          'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function(evt) {
            process.once(evt, function() {
              process.stdin.pause();
              console.log("Received: " + evt);
              resolve();
            });
          });
        }).then(function () {
          var evalAsync = util.promisify(browser.eval.bind(browser));

          return getTestResults(evalAsync, timeout, jsReporter);
        }).then(function (obj) {
          var data = obj.resultScript || {};
          data.passed = data.passed || data.failedCount === 0;

          var url = "https://saucelabs.com/jobs/" + browser.sessionID;

          if (data.passed) {
            console.log("ok 1 - " + url);
          }
          else {
            console.log("not ok - " + url);
          }

          console.log("# Updating sauce job status");
          var auth = config.auth();
          return updateJobStatus(browser.sessionID, auth, data).then(function (body) {
            obj.body = body;

            return obj;
          });
        });
      });
    });
  });
}

module.exports = launch;
