var util = require('util');
var fs = require('fs');

var readdirAsync = util.promisify(fs.readdir);
var readFileAsync = util.promisify(fs.readFile);

var folderAdapter = __dirname + '/js-testing-reporter-adapter/';

module.exports = function() {
  return readdirAsync(folderAdapter).then(function(files) {
    return Promise.all(files.map(function(file) {
      return readFileAsync(folderAdapter + file, 'utf8');
    }));
  }).then(function (reporters) {
    return "(function(undefined) {" + reporters.join('\n') + " return JSTestingReporterSL(); })()";
  });
};
