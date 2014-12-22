#!/usr/bin/env node

var launcher  = require('./saucelauncher-webdriver.js');

if (!module.parent) launcher();
else throw new Error('Not implemented yet!');
