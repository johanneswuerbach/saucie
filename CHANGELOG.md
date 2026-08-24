# Changelog

## 4.0.2

- Default `tunnelIdentifier` to `$GITHUB_RUN_ID`, falling back to `'saucie'` when unset
- Add opt-in `connect()` options for CI hook usage: `detached`, `waitForApiReady`, `pidfile`, `apiReadyMaxRetries`, and `apiReadyInterval`
- Poll Sauce Labs REST API for tunnel `is_ready` when `waitForApiReady` is enabled
- Write Sauce Connect pid to `pidfile` after local and API readiness checks pass
- Preserve the Sauce Connect binary path through the tunnel cleanup step before spawn
- Harden `disconnect()`: fix probe interval cleanup, handle missing/stale pid files, remove pid file on success
