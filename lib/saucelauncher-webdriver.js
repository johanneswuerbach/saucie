#!/usr/bin/env node

var async           = require('async'),
    launcher        = require('sauce-connect-launcher'),
    config          = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js');
    loadJsReporter  = require('./sauce-js-testing-reporter.js'),
    argv            = config.argv,
    integrationTestURL = argv.host + ':' + argv.port;

async.waterfall([
  function(callback) {
    loadJsReporter(callback);
  },
  function(jsReporter, callback) {
    if (!argv.connect) callback(null, jsReporter, null);
    else launcher(config.launcherOptions, function(err, sauceConnectProcess) {
      console.log("Started Sauce Connect Process");
      callback(err, jsReporter, sauceConnectProcess);
    });
  },
  function(jsReporter, sauceConnectProcess, callback){
    console.log("Starting run all tests against Sauce Labs");
    integrationTest( integrationTestURL, jsReporter, function(err) {
      callback(err, sauceConnectProcess);
    });
  },
  function(sauceConnectProcess, callback) {
    if (!sauceConnectProcess) callback(null, 'done');
    else sauceConnectProcess.close(function (err) {
      console.log("Closed Sauce Connect process");
      callback(err, 'done');
    });
  }
], function (err, result) {
  err && console.error(err);
  console.log(result);
});
