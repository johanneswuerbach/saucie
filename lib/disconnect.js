var fs = require('fs');
var Bluebird = require('bluebird');

var readFileAsync = Bluebird.promisify(fs.readFile);

function ensureProcessIsGone(pid) {
  return new Bluebird.Promise(function (resolve, reject) {
    var probeInterval = setInterval(function () {
      try {
        process.kill(pid, 0);
      } catch (err) {
        clearTimeout(probeInterval);

        if (err.code === 'ESRCH') {
          resolve();
        } else {
          reject(err);
        }
      }
    }, 250);
  });
}

module.exports = function disconnect(pidFile) {
  return readFileAsync(pidFile).then(function (content) {
    return parseInt(content, 10);
  }).then(function (pid) {
    var p = ensureProcessIsGone(pid);

    process.kill(pid, 'SIGTERM');
    return p;
  });
};
