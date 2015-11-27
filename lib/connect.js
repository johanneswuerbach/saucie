var Bluebird = require('bluebird');
var sauceConnectLauncher = require('sauce-connect-launcher');
var sauceConnectLauncherAsync = Bluebird.promisify(sauceConnectLauncher);

module.exports = function connect(opts) {
  return sauceConnectLauncherAsync(opts).then(function(sauceConnectProcess) {
    sauceConnectProcess.kill = function NOOP() {};
  });
};
