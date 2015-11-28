var Bluebird = require('bluebird');
var request = require("request");

var requestAsync = Bluebird.promisify(request);

module.exports = function (sessionID, auth, data) {
  var url = ["/v1/", auth.username, "/jobs/", sessionID].join("");

  return requestAsync({
    method: "PUT",
    uri: ["https://", auth.username, ":", auth.accessKey, "@saucelabs.com/rest", url].join(""),
    json: true,
    body: data
  }).then(function (response) {
    return response.body;
  });
};
