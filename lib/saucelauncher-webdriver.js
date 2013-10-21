var async           = require('async'),
    launcher        = require('sauce-connect-launcher'),
    config          = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js');
    loadJsReporter  = require('./sauce-js-testing-reporter.js');

async.waterfall([
  function(callback) {
    loadJsReporter(callback);
  },
  function(jsReporter, callback) {
    launcher(config.launcherOptions, function(err, sauceConnectProcess) {
      callback(err, jsReporter, sauceConnectProcess);
    });
  },
  function(jsReporter, sauceConnectProcess, callback){
    console.log("Started Sauce Connect Process");
    integrationTest( "http://localhost:8080", jsReporter, function(err) {
      callback(err, sauceConnectProcess);
    });
  },
  function(sauceConnectProcess, callback) {
    sauceConnectProcess.close(function (err) {
      console.log("Closed Sauce Connect process");
      callback(err, 'done');
    });
  }
], function (err, result) {
  console.log(result);
});
