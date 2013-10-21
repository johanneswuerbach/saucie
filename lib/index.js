var launcher  = require('saucelauncher-webdriver.js');

if (!module.parent) {

  launcher();

} else {

  throw new Error('Not implemented yet!');
  /*module.exports = {
    updateJobStatus: updateJobStatus,
    launcher: launcher
  };*/

}
