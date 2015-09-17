var async           = require('async'),
    launcher        = require('sauce-connect-launcher'),
    config          = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js'),
    updateJobStatus = require('./sauce-update-job-status.js'),
    loadJsReporter  = require('./sauce-js-testing-reporter.js');

var webdriver = require('wd');
var RSVP = require('rsvp');
var connect = require('./connect');
var disconnect = require('./disconnect');

function launch(options, callback) {
  options = options || {};

  var argv               = config.set(options),
      auth               = config.auth(),
      integrationTestURL = argv.url;

  if (!auth.username || !auth.accessKey) {
    var msg = "Please, provide the username and the access key for SauceLabs. Use the option --help for more information.";
    if (!callback) {
      console.error(msg);
    }
    else {
      callback(new Error(msg));
    }
    return;
  }

  var browser = webdriver.remote("ondemand.saucelabs.com", 80, auth.username, auth.accessKey);

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

  var sauceConnect;

  function closeConnect(callback) {
    if (!sauceConnect) {
      return callback(null);
    }

    sauceConnect.close(function (err) {
      console.log("Closed Sauce Connect process");
      callback(err);
    });
  }

  async.waterfall([
    function(callback) {
      loadJsReporter(callback);
    },
    function(jsReporter, callback) {
      if (!argv.connect) {
        return callback(null, jsReporter);
      }

      launcher(config.launcherOptions(), function(err, sauceConnectProcess) {
        console.log("Started Sauce Connect Process");
        sauceConnect = sauceConnectProcess;
        callback(err, jsReporter);
      });
    },
    function(jsReporter, callback){
      console.log("Starting run all tests against Sauce Labs");
      integrationTest(browser, integrationTestURL, function(err) {
        heartbeat();
        callback(err, jsReporter);
      });
    },
    function(jsReporter, callback) {
      if (argv.attach && !closed) {
        console.log("Waiting for termination.");
        process.stdin.resume();
        'SIGINT SIGTERM SIGHUP'.split(' ').forEach(function(evt) {
          process.once(evt, function() {
            process.stdin.pause();
            console.log("Received: " + evt);
            callback(null, jsReporter);
          });
        });
      }
      else {
        callback(null, jsReporter);
      }
    },
    function(jsReporter, callback) {
      console.log("Updating job status");
      updateJobStatus(browser, jsReporter, argv.timeout, function(err, result) {
        callback(err, result);
      });
    }
  ], function (err, result) {
    if (err) {
      console.error(err);
    }

    clearTimeout(pendingHeartBeat);
    browser.quit(function(quitErr) {
      console.log("Closed browser.");
      if (quitErr) {
        console.error(quitErr);
      }

      closeConnect(function (closeErr) {
        if (closeErr) {
          console.error(closeErr);
        }

        if (callback) {
          callback(err || quitErr || closeErr, result);
        }
      });
    });
  });
}

var promiseLaunch = RSVP.denodeify(launch);

module.exports = promiseLaunch;
module.exports.launch = promiseLaunch;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
