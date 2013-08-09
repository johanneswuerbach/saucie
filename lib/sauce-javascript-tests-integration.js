/**
 * JavaScript tests integration with Sauce
 * https://saucelabs.com/docs/javascript-unit-tests-integration
 */
var updateJobStatus = require('./sauce-update-job-status.js'),
    async   = require('async');

module.exports = function(desired, config, script_for_sauce_data_schemas, callback) {
  var localhost = config.localhost,
      browser   = config.browser;

  async.waterfall([
    function(callback) {
      browser.init(desired, function(err){
        callback(err);
      });
    },

    function(callback) {
      browser.get(localhost, function(err){
        callback(err);
      });
    },

    function(callback) {
      updateJobStatus(config, script_for_sauce_data_schemas, callback);
    },

    function(result, callback) {
      browser.quit(function(err){
        callback(err);
      });
    }

  ], function(err) {
    err && console.error('Caught exception: ' + err.stack);
    callback && callback(err, desired);
  });
};
