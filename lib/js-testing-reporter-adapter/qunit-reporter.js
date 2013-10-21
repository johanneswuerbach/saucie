window.QUnit && (JSTestingReporterSL = (function(undefined) {
  var stats = QUnit.config.stats;

  return function() {
    return {
      'passed': stats.bad === 0,
      'custom-data': {'qunit': stats}
    };
  }

})());
