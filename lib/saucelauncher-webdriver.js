var async           = require('async'),
    launcher        = require('sauce-connect-launcher'),
    config          = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js'),
    updateJobStatus = require('./sauce-update-job-status.js'),
    loadJsReporter  = require('./sauce-js-testing-reporter.js');

module.exports = function(options, callback) {
  var argv               = config.set(options),
      auth               = config.auth(),
      integrationTestURL = argv.url;

  if (!auth.username || !auth.accessKey) {
    var msg = "Please, provide the username and the access key for SauceLabs. Use the option --help for more information.";
    if (!callback) console.error(msg);
    else callback( new Error(msg), {} );
    return;
  }

  var browser = config.browser();

  var pendingHeartBeat;
  var heartbeat = function() {
    pendingHeartBeat = setTimeout(function() {
      browser.title();
      heartbeat();
    }, 60000);
  };

  var closed = false;
  'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function(evt) {
    process.on(evt, function() {
      closed = true;
    });
  });

  async.waterfall([
    function(callback) {
      loadJsReporter(callback);
    },
    function(jsReporter, callback) {
      if (!argv.connect) callback(null, jsReporter, null);
      else launcher(config.launcherOptions(), function(err, sauceConnectProcess) {
        console.log("Started Sauce Connect Process");
        callback(err, jsReporter, sauceConnectProcess);
      });
    },
    function(jsReporter, sauceConnectProcess, callback){
      console.log("Starting run all tests against Sauce Labs");
      integrationTest( integrationTestURL, function(err) {
        heartbeat();
        callback(err, jsReporter, sauceConnectProcess);
      });
    },
    function(jsReporter, sauceConnectProcess, callback) {
      if (argv.attach && !closed) {
        console.log("Waiting for termination.");
        process.stdin.resume();
        'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function(evt) {
          process.once(evt, function() {
            process.stdin.pause();
            console.log("Received: " + evt);
            callback(null, jsReporter, sauceConnectProcess);
          });
        });
      }
      else {
        callback(null, jsReporter, sauceConnectProcess);
      }
    },
    function(jsReporter, sauceConnectProcess, callback) {
      console.log("Updating job status");
      updateJobStatus(jsReporter, argv.timeout, function(err, result) {
        callback(err, sauceConnectProcess, result);
      });
    },
    function(sauceConnectProcess, result, callback) {
      clearTimeout(pendingHeartBeat);
      browser.quit(function(err) {
        console.log("Closed browser.");
        callback(err, sauceConnectProcess, result);
      });
    },
    function(sauceConnectProcess, result, callback) {
      if (!sauceConnectProcess) callback(null, result);
      else sauceConnectProcess.close(function (err) {
        console.log("Closed Sauce Connect process");
        callback(err, result);
      });
    }
  ], function (err, result) {
    err && console.error(err);
    callback && callback( err, result );
  });

};
