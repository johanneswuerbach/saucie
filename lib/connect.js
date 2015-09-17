var RSVP = require('rsvp');
var sauceConnectLauncher = require('sauce-connect-launcher');
var sauceConnectLauncherPromise = RSVP.denodeify(sauceConnectLauncher);

module.exports = function connect(opts) {
  return sauceConnectLauncherPromise(opts).then(function(sauceConnectProcess) {
    sauceConnectProcess.kill = function NOOP() {};
  });
};
