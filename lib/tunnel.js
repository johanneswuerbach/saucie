var util = require('util');
var connect = require('./connect');

module.exports = function (config) {
  if (!config.connect) {
    return Promise.resolve({ value: null, dispose: function() { return Promise.resolve(); } });
  }

  return connect(config.launcherOptions()).then(function (sauceConnectProcess) {
    console.log("# Started Sauce Connect tunnel");
    return {
      value: sauceConnectProcess,
      dispose: function() {
        return util.promisify(sauceConnectProcess.close.bind(sauceConnectProcess))().then(function() {
          console.log("# Closed Sauce Connect tunnel");
        });
      }
    };
  });
};
