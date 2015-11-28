var Bluebird = require('bluebird');
var launcher = require('sauce-connect-launcher');

var launcherAsync = Bluebird.promisify(launcher);

module.exports = function (config) {
  if (!config.connect) {
    return Bluebird.resolve();
  }

  return launcherAsync(config.launcherOptions()).then(function (sauceConnectProcess) {
    console.log("# Started Sauce Connect tunnel");
    return sauceConnectProcess;
  }).disposer(function(sauceConnectProcess) {
    var closeAsync = Bluebird.promisify(sauceConnectProcess.close);
    return closeAsync().then(function () {
      console.log("# Closed Sauce Connect tunnel");
    });
  });
};
