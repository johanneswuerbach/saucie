var connect = require('./connect');
var disconnect = require('./disconnect');
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
