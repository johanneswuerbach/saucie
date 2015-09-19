var async   = require('async'),
    api     = require('./sauce-rest-api-update-job-status.js');

var waitUntilResultsAreAvailable = function(browser, js_script, timeout, start, callback) {
  var now = new Date();
  start = start || now;

  if (timeout && now - start > timeout * 1000) {
    callback( new Error("Timeout: Element not there") );
  } else {
    browser.eval(js_script, function(err, jsValue) {
      if (jsValue !== null) {
        return callback(null, {resultScript: jsValue});
      }

      waitUntilResultsAreAvailable(browser, js_script, timeout, start, callback);
    });
  }
};

module.exports = function(browser, config, script_for_sauce_data_schemas, callback) {
  async.waterfall([
    function(callback) {
      waitUntilResultsAreAvailable(browser, script_for_sauce_data_schemas, config.timeout, null, callback);
    },

    function(obj, callback) {
      var resultScript = obj.resultScript || {};
      var data = resultScript;
      data.passed = resultScript.passed || resultScript.failedCount === 0;

      var url = "https://saucelabs.com/jobs/" + browser.sessionID;

      if (data.passed) {
        console.log("ok 1 - " + url);
      }
      else {
        console.log("not ok - " + url);
      }

      api(browser.sessionID, config, data).then(function(body) {
        obj.body = body;
        callback(null, obj);
      }, function(err) {
        callback(err, obj);
      });
    }
  ], function(err, result) {
    callback(err, result);
  });
};
