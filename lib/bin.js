#!/usr/bin/env node

var launcher  = require('./saucelauncher-webdriver.js');

launcher({}, function (err) {
  if (err) {
    console.error(err);
  }
});
