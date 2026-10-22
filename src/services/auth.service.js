const bcrypt = require('bcryptjs');
const config = require('../config');

async function hashPassword(password) {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};
