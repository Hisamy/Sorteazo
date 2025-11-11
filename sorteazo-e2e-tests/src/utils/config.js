require('dotenv').config();

module.exports = {
  BASE_URL: process.env.WEB_APP_URL || 'http://localhost:5173',
};