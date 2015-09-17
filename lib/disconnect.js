var fs = require('fs');
var RSVP = require('rsvp');

module.exports = function disconnect(pidFile) {
  return new RSVP.Promise(function(resolve, reject) {
    fs.readFile(pidFile, function(err, content) {
      if (err) {
        return reject(err);
      }


      var killWait = setInterval(function () {
        try {
          process.kill(parseInt(content, 10), 'SIGINT');
        } catch (e) {
          clearInterval(killWait);
          resolve();
        }
      }, 200);
    });
  });
};
