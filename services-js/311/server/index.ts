/* eslint no-console: 0 */

// We use require in here so we can be deliberate about load order.
require('dotenv').config();

const Rollbar = require('rollbar');
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: process.env.ROLLBAR_ENVIRONMENT || process.env.NODE_ENV,
  },
});

require('./server')
  .default({ rollbar })
  .catch(err => {
    rollbar.error(err, e => {
      if (e) {
        console.error('Error sending exception to Rollbar', e);
      } else {
        console.info(`Error logged to Rollbar`);
      }
    });

    console.error('Error starting server');
    console.error(err);
  });
