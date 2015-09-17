/**
 * JavaScript tests integration with Sauce
 * https://saucelabs.com/docs/javascript-unit-tests-integration
 */
var config  = require('./sauce-conf.js'),
    async   = require('async');

module.exports = function(browser, localhost_url, callback) {
  var desired = config.desired();

  async.waterfall([
    function(callback) {
      browser.init(desired, function(err){
        callback(err);
      });
    },

    function(callback) {
      browser.get(localhost_url, function(err){
        callback(err);
      });
    }

  ], function(err) {
    if (err) {
      console.error('Caught exception: ' + err.stack);
    }

    if (callback) {
      callback(err);
    }
  });
};
