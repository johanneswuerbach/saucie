var Bluebird = require('bluebird');

var remoteBrowser = require('./remote-browser');
var loadJsReporter = require('./js-testing-reporter');
var Config = require('./config');
var updateJobStatus = require('./update-job-status');
var tunnel = require('./tunnel');

function launch(options) {
  options = options || {};

  var config = new Config(options);
  var auth = config.auth();
  var integrationTestURL = config.url;

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
      console.log("Starting run all tests against Sauce Labs");

      return Bluebird.using(remoteBrowser(config, integrationTestURL), function (browser) {
        return new Bluebird.Promise(function (resolve) {
          if (closed || !config.attach) {
            return resolve();
          }

          console.log("Waiting for termination.");
          process.stdin.resume();
          'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function(evt) {
            process.once(evt, function() {
              process.stdin.pause();
              console.log("Received: " + evt);
              resolve();
            });
          });
        }).then(function () {
          console.log("Updating job status");
          return updateJobStatus(browser, config, jsReporter);
        });
      });
    });
  });
}

module.exports = launch;
