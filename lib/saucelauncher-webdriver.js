var async           = require('async'),
    launcher        = require('sauce-connect-launcher'),
    config          = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js');
    loadJsReporter  = require('./sauce-js-testing-reporter.js');

module.exports = function(options, callback) {
  var argv               = config.set(options),
      auth               = config.auth(),
      integrationTestURL = argv.host + ':' + argv.port;

  if (!auth.username || !auth.accessKey) {
    var msg = "Please, provide the username and the access key for SauceLabs. Use the option --help for more information.";
    if (!callback) console.error(msg);
    else callback( new Error(msg), {} );
    return;
  }

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
      integrationTest( integrationTestURL, jsReporter, function(err, result) {
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
