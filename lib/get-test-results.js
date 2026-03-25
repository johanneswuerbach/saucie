var waitUntilResultsAreAvailable = function(evalAsync, jsScript, timeout, start) {
  var now = new Date();
  start = start || now;

  if (timeout && now - start > timeout * 1000) {
    return Promise.reject(new Error("Timeout: Element not there"));
  }

  return evalAsync(jsScript).then(function (jsValue) {
    if (jsValue !== null) {
      return Promise.resolve({resultScript: jsValue});
    }

    return waitUntilResultsAreAvailable(evalAsync, jsScript, timeout, start);
  });
};

module.exports = function(evalAsync, timeout, jsScript) {
  return waitUntilResultsAreAvailable(evalAsync, jsScript, timeout, null);
};
