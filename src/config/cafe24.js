require('dotenv').config();

module.exports = {
  mallId: process.env.CAFE24_MALL_ID,
  clientId: process.env.CAFE24_CLIENT_ID,
  clientSecret: process.env.CAFE24_CLIENT_SECRET,
  redirectUri: process.env.CAFE24_REDIRECT_URI,
  apiVersion: process.env.CAFE24_API_VERSION || '2025-06-01',

  baseUrl() {
    return `https://${this.mallId}.cafe24api.com/api/v2`;
  },

  adminApiUrl() {
    return `${this.baseUrl()}/admin`;
  },

  oauthUrl() {
    return `${this.baseUrl()}/oauth`;
  }
};
