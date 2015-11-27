var connect = require('./connect');
var disconnect = require('./disconnect');
var launch = require('./launch');

var main = function (options, callback) {
  return launch(options).asCallback(callback);
};

module.exports = main;
module.exports.launch = main;
module.exports.connect = connect;
module.exports.disconnect = disconnect;
