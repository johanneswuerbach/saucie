/**
 * JavaScript tests integration with Sauce
 * https://saucelabs.com/docs/javascript-unit-tests-integration
 */
var webdriver = require('wd');
var Bluebird = require('bluebird');

module.exports = function(desired, auth, url) {
  var browser = webdriver.remote("ondemand.saucelabs.com", 80, auth.username, auth.accessKey);
  var initAsync = Bluebird.promisify(browser.init, { context: browser });

  var pendingHeartBeat;
  var heartbeat = function() {
    pendingHeartBeat = setTimeout(function() {
      browser.title();
      heartbeat();
    }, 60000);
  };

  return initAsync(desired).then(function () {
    console.log("# Created remote browser.");

    heartbeat();

    var getAsync = Bluebird.promisify(browser.get, { context: browser });

    return getAsync(url).then(function () {
      return browser;
    });
  }).disposer(function() {
    clearTimeout(pendingHeartBeat);

    var quitAsync = Bluebird.promisify(browser.quit, { context: browser });

    return quitAsync().then(function () {
      console.log("# Closed remote browser.");
    });
  });
};
