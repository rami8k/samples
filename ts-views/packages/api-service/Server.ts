let newrelic
if (process.env.NEW_RELIC_APP_NAME) {
  newrelic = require('newrelic')
}

import { createApp } from './App'
let app = createApp()

const dev = process.env.NODE_ENV !== 'production';
if (dev) {
  require('dotenv').config();
}

if(dev) {
  const port = parseInt(process.env.PORT, 10) || 3000;
  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
} else {
  module.exports = app
}