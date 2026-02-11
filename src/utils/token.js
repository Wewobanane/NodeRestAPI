const crypto = require('crypto');

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const getTokenExpiry = (hours = 24) => {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

module.exports = {
  generateToken,
  getTokenExpiry
};
