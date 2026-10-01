// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const fs = require('fs');
const path = require('path');

// Ubuntu installs Firefox as a snap, which cannot read the system /tmp where Karma creates the browser profile,
// so Karma uses a temp folder inside the project instead (ignored by git)
const tempDir = path.join(__dirname, 'tmp', 'karma');
fs.mkdirSync(tempDir, { recursive: true });
process.env.TMPDIR = tempDir;

// the snap's "firefox" command is a wrapper Karma cannot stop cleanly after the tests, so the real browser
// binary inside the snap is used when it exists; set FIREFOX_BIN yourself to use another Firefox
const snapFirefox = '/snap/firefox/current/usr/lib/firefox/firefox';
if (!process.env.FIREFOX_BIN && fs.existsSync(snapFirefox)) {
  process.env.FIREFOX_BIN = snapFirefox;
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-firefox-launcher'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      },
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: path.join(__dirname, './coverage/frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    // runs Firefox without opening a window, use --browsers=Firefox to watch the tests run
    browsers: ['FirefoxHeadless'],
    restartOnFileChange: true
  });
};
