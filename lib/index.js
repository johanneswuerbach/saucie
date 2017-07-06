var connect = require('./connect');
var disconnect = require('./disconnect');
var parseArgv = require('./parse-argv');
var launch = require('./launch');

var main = function (options, callback) {
  return launch(options).catch(function (err) {
    console.log('Bail out! ' + err);
    throw err;
  }).asCallback(callback);
};

module.exports = main;
module.exports.launch = main;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.parseArgv = parseArgv;

// emitted by bluebird
process.on("unhandledRejection", function(e, promise) {
  console.error(e);
});
