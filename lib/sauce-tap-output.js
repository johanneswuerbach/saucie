'use strict';
var intercept = require("intercept-stdout");
var tapping = false;

// http://testanything.org/tap-specification.html

function prefixLines(prefix, lines) {
  return prefix + lines.replace(/((?:\r\n|\n|\r).)/g, function(match, p1) {
    return p1 + prefix;
  });
}

exports.interceptOutput = function() {
  intercept(function(txt) {
    if (tapping) {
      return txt;
    }

    return prefixLines('## ', txt);
  });
};

exports.putPlanError = function(err) {
  tapping = true;

  console.error(
    '1..0 # Skipped: '
    + err.message + '\n'
    + prefixLines('#', err.stack)
  );

  tapping = false;
};

exports.putPlan = function(resultScript) {
  tapping = true;

  console.log('%d..%d', 1, resultScript.totalCount);

  var passes = 0;
  var failures = 0;
  resultScript.specs.forEach(function (spec, index) {
    passes += spec.passedCount;
    failures += spec.failedCount;

    console.log('%s %d %s',
      spec.passed ? 'ok' : 'not ok',
      index + 1,
      spec.description.replace(/#/g, '')
    );
  });

  console.log('# tests %d', passes + failures);
  console.log('# pass %d', passes);
  console.log('# fail %d', failures);
  tapping = false;
};