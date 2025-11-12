const axios = require('axios');
const config = require('../config/cafe24');
const db = require('../models/database');

class TokenManager {
  async getValidToken() {
    const token = db.getToken();

    if (!token) {
      throw new Error('No token found. Please authenticate first at /auth/start');
    }

    // 만료 30분 전에 갱신
    const expiresAt = new Date(token.expires_at);
    const now = new Date();
    const thirtyMinutes = 30 * 60 * 1000;

    if (expiresAt - now < thirtyMinutes) {
      console.log('Token expiring soon. Refreshing...');
      return await this.refreshToken();
    }

    return token;
  }

  async saveToken(tokenData) {
    db.saveToken(tokenData);
    console.log('Token saved successfully');
    return tokenData;
  }

  async refreshToken() {
    const token = db.getToken();

    if (!token || !token.refresh_token) {
      throw new Error('No refresh token found');
    }

    try {
      // Basic Authentication 헤더 생성
      const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

      const response = await axios.post(
        `${config.oauthUrl()}/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: token.refresh_token
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      console.log('✅ Token refreshed successfully');
      db.updateToken(response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to refresh token:', error.response?.data || error.message);
      throw new Error('Token refresh failed. Please re-authenticate at /auth/start');
    }
  }

  async exchangeCodeForToken(code) {
    try {
      // Debug: 환경 변수 확인
      console.log('🔍 Token exchange debug:');
      console.log('  - Client ID:', config.clientId);
      console.log('  - Client Secret:', config.clientSecret ? `${config.clientSecret.substring(0, 5)}...` : 'undefined');
      console.log('  - Redirect URI:', config.redirectUri);
      console.log('  - OAuth URL:', config.oauthUrl());

      // Basic Authentication 헤더 생성
      const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      console.log('  - Auth header:', `Basic ${credentials.substring(0, 20)}...`);

      const response = await axios.post(
        `${config.oauthUrl()}/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: config.redirectUri
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      console.log('✅ Token exchange successful');
      await this.saveToken(response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      throw new Error('Code exchange failed: ' + (error.response?.data?.error_description || error.message));
    }
  }
}

module.exports = new TokenManager();
