var launcher  = require('sauce-connect-launcher'),
    clone     = require('clone'),
    config    = require('./sauce-conf.js'),
    integrationTest = require('./sauce-javascript-tests-integration.js'),
    argv      = config.argv,
    desired   = config.desired,
    localhost = argv.localhostSL || "http://localhost:8080",
    connect   = argv.connect || connect.connect,
    reporters = {
      jasmine: "{failedCount: jasmine.currentEnv_.currentRunner_.results().failedCount}",
      qunit:   "{failedCount: QUnit.config.stats.bad}",
      mocha:   "",
      yui:     ""
    },

    browserFromArgument = argv.browserNameSL && argv.platformSL && [{
      "browserName": argv.browserNameSL,
      "version"    : argv.versionSL,
      "platform"   : argv.platformSL
    }],

    browserDefault = [{
      browserName: 'chrome',
      version: '',
      platform: 'Linux'
    }],

    browsers = browserFromArgument || confid.browsers || browserDefault,
    queue = async.queue(function(task, callback){
      var desired = clone(config.desired);
      desired.browserName = task.browserName;
      desired.version = task.version;
      desired.platform = task.platform;
      integrationTest(desired, localhost, jsTestReporter, callback);
    }, parallelLimit);

async.waterfall([

  function(callback){
    if (connect) launcher(config.launcher, callback);
    else callback();
  },

  function(sauceConnectProcess, callback){
    queue.drain = function() {
      if (!!sauceConnectProcess) sauceConnectProcess.close(callback);
      else callback();
    };
    queue.push(browsers, function(err, desired) {
      console.log( desired.browserName + " done" );
    });
  }

],function(err) {
  err && console.error('Caught exception: ' + err.stack);
  console.log("The end");
});
