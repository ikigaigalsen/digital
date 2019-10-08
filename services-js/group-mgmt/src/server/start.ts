/* eslint no-console: 0 */

// import fs = require('fs');

// Entrypoint for our server. Uses require so we can control import order
// and set up error reporting before getting the main server.js file going.

require('dotenv').config();

const start = require('../group-mgmt').default;
console.log('start.server');

const shell = require('shelljs');
shell.exec('top');

// console.log('process: ', process);

start().catch(err => {
  console.error('Error starting server', err);
  process.exit(-1);
});
