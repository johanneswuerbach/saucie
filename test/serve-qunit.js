var serveQUnit = require('./utils').serveQUnit;

serveQUnit(function(port) {
  console.log('Visit http://localhost:' + port);
});
