var libraryName = "Saucie";

module.exports = {
  browser: 'chrome',
  version: '',
  platform: '',
  platformVersion: '',
  deviceName: '',
  deviceOrientation: '',
  tunnelIdentifier: process.env.GITHUB_RUN_ID,
  build: process.env.GITHUB_RUN_NUMBER,
  tags: [libraryName, "test"],
  sessionName: libraryName + " tests",
  url: 'http://localhost:8080',
  visibility: "public",
  connect: true,
  connectRetries: 2,
  downloadRetries: 2,
  region: 'us-west',
  readinessPort: 8032,
  attach: false,
};
