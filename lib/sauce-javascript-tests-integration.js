/**
 * JavaScript tests integration with Sauce
 * https://saucelabs.com/docs/javascript-unit-tests-integration
 */
var async = require('async');
var webdriver = require('wd');

module.exports = function(config, browser, callback) {
  var desired = config.desired();
  var url = config.url;

  async.waterfall([
    function(callback) {
      var auth = config.auth();
      var browser = webdriver.remote("ondemand.saucelabs.com", 80, auth.username, auth.accessKey);
      browser.init(desired, function(err) {
        callback(err, browser);
      });
    },

    function(browser, callback) {
      browser.get(url, function(err){
        callback(err, browser);
      });
    }

  ], function(err, browser) {
    if (err) {
      console.error('Caught exception: ' + err.stack);
    }

    if (callback) {
      callback(err, browser);
    }
  });
};
