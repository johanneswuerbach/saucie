var RSVP    = require("rsvp"),
    request = require("request"),
    config  = require('./sauce-conf.js');

module.exports = function (sessionID, data) {
  var auth     = config.auth(),
      url  = ["/v1/", auth.username, "/jobs/", sessionID].join("");

  return new RSVP.Promise(function (resolve, reject) {
    request({
      method: "PUT",
      uri: ["https://", auth.username, ":", auth.accessKey, "@saucelabs.com/rest", url].join(""),
      json: true,
      body: data
    }, function (err, response) {
      if (err) {
        return reject(err);
      }

      resolve(response.body);
    });
  });
};
