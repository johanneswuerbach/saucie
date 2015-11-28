var Bluebird = require('bluebird');

var remoteBrowser = require('./remote-browser');
var loadJsReporter = require('./js-testing-reporter');
var Config = require('./config');
var updateJobStatus = require('./update-job-status');
var getTestResults = require('./get-test-results');
var tunnel = require('./tunnel');

function launch(options) {
  options = options || {};

  var config = new Config(options);
  var auth = config.auth();
  var desired = config.desired();
  var integrationTestURL = config.url;
  var timeout = config.timeout;

  if (!auth.username || !auth.accessKey) {
    var msg = "Please, provide the username and the access key for SauceLabs. Use the option --help for more information.";
    return Bluebird.reject(new Error(msg));
  }

  var closed = false;
  'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function(evt) {
    process.on(evt, function() {
      closed = true;
    });
  });

  return loadJsReporter().then(function (jsReporter) {
    return Bluebird.using(tunnel(config), function () {
      return Bluebird.using(remoteBrowser(desired, auth, integrationTestURL), function (browser) {
        console.log("# Tests started.");

        return new Bluebird.Promise(function (resolve) {
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
          var evalAsync = Bluebird.promisify(browser.eval, { context: browser });

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
