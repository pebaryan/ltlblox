const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 30000,
    requestTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    chromeWebSecurity: false
  },
  component: {
    devServer: {
      builder: '@angular/build:karma',
      options: {
        watch: false,
        singleRun: true
      }
    }
  }
});
