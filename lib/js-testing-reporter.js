var Bluebird = require('bluebird');
var fs = require('fs');

var readdirAsync = Bluebird.promisify(fs.readdir);
var readFileAsync = Bluebird.promisify(fs.readFile);

var folderAdapter = __dirname + '/js-testing-reporter-adapter/';

module.exports = function() {
  return readdirAsync(folderAdapter).map(function (file) {
    return readFileAsync(folderAdapter + file, 'utf8');
  }).then(function (reporters) {
    return "(function(undefined) {" + reporters.join('\n') + " return JSTestingReporterSL(); })()";
  });
};
