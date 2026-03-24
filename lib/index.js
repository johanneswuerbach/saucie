var connect = require('./connect');
var disconnect = require('./disconnect');
var parseArgv = require('./parse-argv');
var launch = require('./launch');

var main = function (options, callback) {
  var p = launch(options).catch(function (err) {
    console.log('Bail out! ' + err);
    throw err;
  });
  if (typeof callback === 'function') {
    p.then(function(result) { callback(null, result); }, callback);
  }
  return p;
};

module.exports = main;
module.exports.launch = main;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.parseArgv = parseArgv;

process.on("unhandledRejection", function(e, promise) {
  console.error(e);
});
