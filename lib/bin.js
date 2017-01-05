#!/usr/bin/env node
var argv = require('./parse-argv')(process.argv);

var launcher = require('./index');

launcher(argv).catch(function (err) {
  console.error(err);
});
