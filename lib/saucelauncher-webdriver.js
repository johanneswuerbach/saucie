var async           = require('async'),
    launcher        = require('sauce-connect-launcher'),
    Config          = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js'),
    updateJobStatus = require('./sauce-update-job-status.js'),
    loadJsReporter  = require('./sauce-js-testing-reporter.js');

var RSVP = require('rsvp');
var connect = require('./connect');
var disconnect = require('./disconnect');

function launch(options, callback) {
  options = options || {};

  var config = new Config(options);
  var auth = config.auth();
  var integrationTestURL = config.url;

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

  var sauceConnect, browser, pendingHeartBeat;

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

  function closeConnect(callback) {
    if (!sauceConnect) {
      return callback(null);
    }

    sauceConnect.close(function (err) {
      console.log("Closed Sauce Connect process");
      callback(err);
    });
  }

  function quitBrowser(callback) {
    if (!browser) {
      return callback(null);
    }

    browser.quit(function (err) {
      console.log("Closed browser.");
      callback(err);
    });
  }

  async.waterfall([
    function(callback) {
      loadJsReporter(callback);
    },
    function(jsReporter, callback) {
      if (!config.connect) {
        return callback(null, jsReporter);
      }

      launcher(config.launcherOptions(), function(err, sauceConnectProcess) {
        if (err) {
          return callback(err);
        }
        console.log("Started Sauce Connect Process");
        sauceConnect = sauceConnectProcess;
        callback(err, jsReporter);
      });
    },
    function(jsReporter, callback){
      console.log("Starting run all tests against Sauce Labs");
      integrationTest(config, integrationTestURL, function(err, startedBrowser) {
        if (err) {
          return callback(err);
        }

        browser = startedBrowser;

        heartbeat();
        callback(err, jsReporter);
      });
    },
    function(jsReporter, callback) {
      if (config.attach && !closed) {
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
      updateJobStatus(browser, config, jsReporter, function(err, result) {
        callback(err, result);
      });
    }
  ], function (err, result) {
    if (err) {
      console.error(err);
    }

    clearTimeout(pendingHeartBeat);

    quitBrowser(function(quitErr) {
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
