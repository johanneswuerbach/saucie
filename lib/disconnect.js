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
    }, 1000);
  });
}

module.exports = function disconnect(pidFile) {
  return readFileAsync(pidFile).then(function (content) {
    return parseInt(content, 10);
  }).then(function (pid) {
    return new Bluebird.Promise(function(resolve, reject) {
      var watcher = fs.watch(pidFile, function () {
        fs.stat(pidFile, function(err) {
          if (!err) {
            return;
          }
          watcher.close();

          if (err.code === 'ENOENT') {
            return resolve();
          } else {
            return reject(err);
          }
        });
      });

      watcher.once('error', function (err) {
        watcher.close();
        return reject(err);
      });

      process.kill(pid, 'SIGTERM');
    }).then(function () {
      return ensureProcessIsGone(pid);
    });
  });
};
