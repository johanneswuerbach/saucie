var util = require('util');
var request = require('@cypress/request');

var requestAsync = util.promisify(request);

module.exports = function (sessionID, auth, data) {
  var url = ["/rest/v1/", auth.username, "/jobs/", sessionID].join("");

  return requestAsync({
    method: "PUT",
    uri: ["https://", auth.username, ":", auth.accessKey, "@api.us-west-1.saucelabs.com", url].join(""),
    json: true,
    body: data
  }).then(function (response) {
    return response.body;
  });
};
