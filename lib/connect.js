var Bluebird = require('bluebird');
var sauceConnectLauncher = require('sauce-connect-launcher');
var sauceConnectLauncherAsync = Bluebird.promisify(sauceConnectLauncher);

module.exports = function connect(opts) {
  opts = Object.assign({}, opts, {
    detached: true,
    connectRetries: 2,
    downloadRetries: 2
  });

  return sauceConnectLauncherAsync(opts);
};
