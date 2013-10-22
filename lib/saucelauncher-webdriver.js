#!/usr/bin/env node

var async           = require('async'),
    launcher        = require('sauce-connect-launcher'),
    config          = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js');
    loadJsReporter  = require('./sauce-js-testing-reporter.js'),
    integrationTestURL = config.argv.host + ':' + config.argv.port;

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
    integrationTest( integrationTestURL, jsReporter, function(err) {
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
