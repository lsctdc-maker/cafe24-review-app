// Vercel 환경에서는 process.env에 직접 주입됨
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = {
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

// 환경 변수 검증 (개발 환경에서만)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Config loaded:');
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - MALL_ID:', config.mallId || 'MISSING');
  console.log('  - CLIENT_ID:', config.clientId || 'MISSING');
  console.log('  - CLIENT_SECRET:', config.clientSecret ? `${config.clientSecret.substring(0, 5)}...` : 'MISSING');
  console.log('  - REDIRECT_URI:', config.redirectUri || 'MISSING');
}

module.exports = config;
