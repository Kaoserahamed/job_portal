const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`Job Portal API running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

module.exports = server;
