window.jasmine && (JSTestingReporterSL = (function(undefined) {

  return function() {
    return {
      failedCount: jasmine.currentEnv_.currentRunner_.results().failedCount
    };
  }

})());
