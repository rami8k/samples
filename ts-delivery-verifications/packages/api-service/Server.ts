import { createApp } from './App'
let app = createApp()

const dev = process.env.ENV !== 'production';
if (dev) {
  require('dotenv').config();
}
console.log('dev', dev)
if(dev) {
  const port = parseInt(process.env.PORT, 10) || 3000;
  app.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
} else {
  module.exports = app
}