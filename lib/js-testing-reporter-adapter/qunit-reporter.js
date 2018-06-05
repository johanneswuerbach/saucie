window.QUnit && (JSTestingReporterSL = (function(undefined) {
  return function() {
    function testDetails() {
      var stats = QUnit.config.stats;
      if (window.global_test_results) {
        return window.global_test_results;
      }
      else {
        return {
          failed: stats.bad,
          passed: stats.all - stats.bad,
          total: stats.all
        };
      }
    }
    var result;
    if (QUnit.config.queue.length > 0) {
      return null;
    }
    if (typeof window.global_test_results !== 'undefined' && window.global_test_results !== null) {
      passed = Boolean(window.global_test_results && window.global_test_results.failed === 0);
    }
    else {
      passed = QUnit.config.stats.bad === 0;
    }
    return {
      passed: passed,
      'custom-data': { qunit: testDetails() }
    };
  };
})());
