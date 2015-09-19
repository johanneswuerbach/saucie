#!/usr/bin/env node
var optimist = require('optimist');

var argv = require('./argv');

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

var launcher  = require('./saucelauncher-webdriver.js');

launcher({}, function (err) {
  if (err) {
    console.error(err);
  }
});
