window.QUnit && (JSTestingReporterSL = (function(undefined) {
  return function() {
    var result;
    if (typeof window.global_test_results !== 'undefined') {
      result = {
        'passed': !!(global_test_results && global_test_results.failed === 0),
        'custom-data': {'qunit': global_test_results}
      }
    }
    else {
      var stats = QUnit.config.stats;
      result = {
        'passed': stats.bad === 0,
        'custom-data': {
          'qunit': {
            failed: stats.bad,
            passed: stats.all - stats.bad,
            total: stats.all
          }
        }
      }
    }
    return result;
  }
})());
