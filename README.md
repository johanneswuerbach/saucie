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
    * *It will take a while at the first time. This will only happen once to download the Sauce Connect binary*

Sauce Connect tunnel options
----------------------------

`saucie.connect(opts)` starts Sauce Connect and waits for local readiness at `http://localhost:<readinessPort>/readyz` (default port `8032`).

The tunnel name defaults to `$GITHUB_RUN_ID`, or `'saucie'` when that variable is unset. The CLI accepts the same default via `--tunnel-identifier` / `-t`.

For short-lived parent processes (for example Testem `on_start` hooks), pass:

- **`detached: true`** — spawn Sauce Connect detached with `stdio: 'ignore'` and `unref()` after all readiness checks pass so the tunnel survives hook exit
- **`waitForApiReady: true`** — also poll the [Sauce Labs tunnels API](https://docs.saucelabs.com/secure-connections/sauce-connect-5/guides/readiness-checks/) until the tunnel with matching `tunnelIdentifier` has `is_ready: true`
- **`pidfile: 'sc_client.pid'`** — write the Sauce Connect process id after both readiness checks pass; use with `saucie.disconnect(pidfile)` in an `on_exit` hook

Optional tuning: `apiReadyMaxRetries` (default `120`) and `apiReadyInterval` (default `1000` ms).

Example:

```js
var saucie = require('saucie');

saucie.connect({
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  logger: console.log,
  pidfile: 'sc_client.pid',
  detached: true,
  waitForApiReady: true,
}).then(function () {
  process.exit(0);
});
```

Disconnect
----------

`saucie.disconnect(pidfile)` reads the pid written by `connect({ pidfile })`, sends `SIGTERM`, waits for the process to exit, and removes the pid file. Missing or stale pid files are ignored so teardown does not fail after tests complete.
