const { defineConfig } = require('cypress')


module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  watchForFileChanges: false,
  video: false,
  viewportWidth: 1280,
  viewportHeight: 720,
  env: {
    "hars_folders": "cypress/hars"
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
