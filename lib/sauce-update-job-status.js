var async   = require('async'),
    config  = require('./sauce-conf.js'),
    api     = require('./sauce-rest-api-update-job-status.js');

    waitUntilResultsAreAvailable = function(js_script, timeout, start, callback) {
      var now = new Date();
      start = start || now;

      if (timeout && now - start > timeout * 1000) {
        callback( new Error("Timeout: Element not there") );
      } else {
        browser.eval(js_script, function(err, jsValue) {
          if (jsValue !== null) callback(null, {resultScript: jsValue});
          else waitUntilResultsAreAvailable(js_script, timeout, start, callback);
        });
      }
    };

module.exports = function(script_for_sauce_data_schemas, timeout, callback) {
  browser = config.browser();
  auth    = config.auth();

  async.waterfall([

    function(callback) {
      waitUntilResultsAreAvailable(script_for_sauce_data_schemas, timeout, null, callback);
    },

    function(obj, callback) {
      var data = resultScript = obj.resultScript || {};
      data.passed = resultScript.passed || resultScript.failedCount === 0;

      var url = "https://saucelabs.com/jobs/" + browser.sessionID;

      if (data.passed) console.log("ok 1 - " + url);
      else console.log("not ok - " + url);

      api(data)
      .then( function(body) {
        obj.body = body;
        console.warn("Check out test results at https://saucelabs.com/jobs/" + browser.sessionID + "\n");
        callback(null, obj);
      }, function(err) {
        callback(err, obj);
      });

    }
  ], function(err, result) {
    callback(err, result);
  });
};
