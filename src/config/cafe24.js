// Vercel 환경에서는 process.env에 직접 주입됨
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// 임시 하드코딩 테스트 (환경 변수 로딩 문제 확인용)
const config = {
  mallId: process.env.CAFE24_MALL_ID || 'webd02',
  clientId: process.env.CAFE24_CLIENT_ID || 'yUybC9QuHxTpvJ0D5ecewL',
  clientSecret: process.env.CAFE24_CLIENT_SECRET || 'DLTChlVQEtisJEWWBR7KsgC',
  redirectUri: process.env.CAFE24_REDIRECT_URI || 'https://cafe24reviewapp.vercel.app/auth/callback',
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

// 환경 변수 검증
console.log('🔧 Config loaded:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - MALL_ID:', config.mallId);
console.log('  - CLIENT_ID:', config.clientId);
console.log('  - CLIENT_SECRET:', config.clientSecret ? `${config.clientSecret.substring(0, 5)}...` : 'MISSING');
console.log('  - REDIRECT_URI:', config.redirectUri);
console.log('  - Using hardcoded fallback:', !process.env.CAFE24_MALL_ID);

module.exports = config;
