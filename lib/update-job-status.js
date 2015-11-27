var Bluebird = require('bluebird');
var request = require("request");

var requestAsync = Bluebird.promisify(request);

var postJobStatusUpdate = function (sessionID, config, data) {
  var auth = config.auth();
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

var waitUntilResultsAreAvailable = function(evalAsync, jsScript, timeout, start) {
  var now = new Date();
  start = start || now;

  if (timeout && now - start > timeout * 1000) {
    return Bluebird.reject(new Error("Timeout: Element not there"));
  }

  return evalAsync(jsScript).then(function (jsValue) {
    if (jsValue !== null) {
      return Bluebird.resolve({resultScript: jsValue});
    }

    return waitUntilResultsAreAvailable(evalAsync, jsScript, timeout, start);
  });
};

module.exports = function(browser, config, script_for_sauce_data_schemas) {
  var evalAsync = Bluebird.promisify(browser.eval, { context: browser });

  return waitUntilResultsAreAvailable(evalAsync, script_for_sauce_data_schemas, config.timeout, null).then(function (obj) {
    var resultScript = obj.resultScript || {};
    var data = resultScript;
    data.passed = resultScript.passed || resultScript.failedCount === 0;

    var url = "https://saucelabs.com/jobs/" + browser.sessionID;

    if (data.passed) {
      console.log("ok 1 - " + url);
    }
    else {
      console.log("not ok - " + url);
    }

    return postJobStatusUpdate(browser.sessionID, config, data).then(function(body) {
      obj.body = body;

      return obj;
    });
  });
};
