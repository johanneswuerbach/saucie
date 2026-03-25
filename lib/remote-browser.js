/**
 * JavaScript tests integration with Sauce
 * https://saucelabs.com/docs/javascript-unit-tests-integration
 */

var SL_WD_BASE = 'https://ondemand.us-west-1.saucelabs.com/wd/hub';
var SL_API_HOST = 'api.us-west-1.saucelabs.com';

function slRequest(method, path, authHeader, body) {
  var opts = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authHeader
    }
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  return fetch(SL_WD_BASE + path, opts).then(function(res) {
    if (res.status === 204) { return {}; }
    return res.json().then(function(data) {
      if (data && data.value && data.value.error) {
        throw new Error('[' + method + ' ' + path + '] ' + (data.value.message || data.value.error));
      }
      return data;
    });
  });
}

function toW3CCaps(desired) {
  var sauceOptions = {
    name:       desired.name,
    tags:       desired.tags,
    public:     desired.public,
    tunnelName: desired.tunnelIdentifier
  };
  if (desired.build)       { sauceOptions.build = desired.build; }
  if (desired.maxDuration) { sauceOptions.maxDuration = desired.maxDuration; }

  var caps = { browserName: desired.browserName };
  if (desired.version)           { caps.browserVersion = desired.version; }
  // platformName may be set directly (Appium) or via legacy platform (Selenium)
  if (desired.platformName)      { caps.platformName = desired.platformName; }
  else if (desired.platform)     { caps.platformName = desired.platform; }
  if (desired.platformVersion)   { caps['appium:platformVersion'] = desired.platformVersion; }
  if (desired.deviceName)        { caps['appium:deviceName'] = desired.deviceName; }
  if (desired.deviceOrientation) { caps['appium:deviceOrientation'] = desired.deviceOrientation; }
  caps['sauce:options'] = sauceOptions;
  return caps;
}

module.exports = function(desired, auth, url) {
  var authHeader = 'Basic ' + Buffer.from(auth.username + ':' + auth.accessKey).toString('base64');
  var caps = toW3CCaps(desired);

  return slRequest('POST', '/session', authHeader, {
    capabilities: { alwaysMatch: caps }
  }).then(function(data) {
    if (!data.value || data.value.error) {
      var msg = (data.value && data.value.message) ? data.value.message : JSON.stringify(data);
      throw new Error('[init(' + JSON.stringify(caps) + ')] ' + msg);
    }

    var sessionId = data.value.sessionId;
    console.log('# Created remote browser.');

    var heartbeatInterval = setInterval(function() {
      fetch(SL_WD_BASE + '/session/' + sessionId + '/url', {
        method: 'GET',
        headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
      }).catch(function() {});
    }, 60000);

    return slRequest('POST', '/session/' + sessionId + '/url', authHeader, { url: url })
      .then(function() {
        return {
          value: {
            sessionID: sessionId,
            eval: function(script, callback) {
              slRequest('POST', '/session/' + sessionId + '/execute/sync', authHeader, {
                script: 'return (' + script + ')',
                args: []
              }).then(function(resp) {
                callback(null, resp.value !== undefined ? resp.value : null);
              }).catch(callback);
            }
          },
          dispose: function() {
            clearInterval(heartbeatInterval);
            return slRequest('DELETE', '/session/' + sessionId, authHeader).then(function() {
              console.log('# Closed remote browser.');
            });
          }
        };
      }).catch(function(err) {
        // Navigate failed — clean up the session so it doesn't count against the concurrent limit
        clearInterval(heartbeatInterval);
        return slRequest('DELETE', '/session/' + sessionId, authHeader).then(
          function() { throw err; },
          function() { throw err; }
        );
      });
  });
};
