var Q       = require("q"),
    request = require("request"),
    config  = require('./sauce-conf.js');

module.exports = function (data) {
  var browser  = config.browser(),
      auth     = config.auth();
      deferred = Q.defer(),
      url  = ["/v1/", auth.username, "/jobs/", browser.sessionID].join("");

  request({
    method: "PUT",
    uri: ["https://", auth.username, ":", auth.accessKey, "@saucelabs.com/rest", url].join(""),
    json: true,
    body: data
  }, function (err, response, body) {
    if (err) deferred.reject( new Error(err) );
    else deferred.resolve(response.body);
  });
  return deferred.promise;
};
