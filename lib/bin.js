#!/usr/bin/env node
var optimist = require('optimist');

var argv = require('./argv');

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

var launcher = require('./index');

launcher({}).catch(function (err) {
  console.error(err);
});
