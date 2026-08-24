var fs = require('fs');
var util = require('util');

var readFileAsync = util.promisify(fs.readFile);
var unlinkAsync = util.promisify(fs.unlink);

function ensureProcessIsGone(pid) {
  return new Promise(function (resolve, reject) {
    var probeInterval = setInterval(function () {
      try {
        process.kill(pid, 0);
      } catch (err) {
        clearInterval(probeInterval);

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
    var pid = parseInt(content, 10);
    if (!pid) {
      throw new Error('Invalid pid in ' + pidFile);
    }

    var done = ensureProcessIsGone(pid);
    try {
      process.kill(pid, 'SIGTERM');
    } catch (err) {
      if (err.code !== 'ESRCH') {
        throw err;
      }
    }
    return done;
  }).then(function() {
    return unlinkAsync(pidFile).catch(function() {});
  }).catch(function(err) {
    if (err.code === 'ENOENT') {
      return;
    }
    console.error('# Sauce Connect disconnect:', err.message);
  });
};
