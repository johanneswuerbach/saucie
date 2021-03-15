saucie [![Build Status](https://github.com/johanneswuerbach/saucie/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/johanneswuerbach/saucie/actions/workflows/ci.yml?query=branch%3Amaster) [![npm version](https://badge.fury.io/js/saucie.svg)](http://badge.fury.io/js/saucie)
==========================

This library allows you to integrate your javascript test results into a [Sauce jobs results page](https://saucelabs.com/docs/javascript-unit-tests-integration).

It's available for running QUnit, Jasmine and Mocha tests through various browsers hosted on SauceLabs.


Instructions
------------

1. Get a [SauceLabs](https://saucelabs.com/) account.
2. Make sure Sauce credentials are set in env:
    * **SAUCE_USERNAME** - your SauceLabs username
    * **SAUCE_ACCESS_KEY** - your SauceLabs API/Access key.
3. Run `testem ci --port 8080` to run it on all the listed browsers - see `testem launchers` for the full list.
    * *It will take a while at the first time. This will only happen once to download the jar of Sauce Connect*
