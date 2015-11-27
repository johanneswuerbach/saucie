var fs = require('fs');
var Bluebird = require('bluebird');

module.exports = function disconnect(pidFile) {
  return new Bluebird.Promise(function(resolve, reject) {
    fs.readFile(pidFile, function(err, content) {
      if (err) {
        return reject(err);
      }

      var watcher = fs.watch(pidFile, function () {
        fs.stat(pidFile, function(err) {
          if (err && err.code === 'ENOENT') {
            watcher.close();
            return resolve();
          } else if (err) {
            return reject(err);
          }
        });
      });

      watcher.once('error', function (err) {
        watcher.close();
        return reject(err);
      });

      process.kill(parseInt(content, 10), 'SIGINT');
    });
  });
};
