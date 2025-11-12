const axios = require('axios');
const config = require('../config/cafe24');
const tokenManager = require('./tokenManager');

class Cafe24Client {
  async request(endpoint, method = 'GET', data = null, retries = 3) {
    try {
      const token = await tokenManager.getValidToken();

      const requestConfig = {
        method,
        url: `${config.adminApiUrl()}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': config.apiVersion
        }
      };

      if (data) {
        requestConfig.data = data;
      }

      const response = await axios(requestConfig);

      // Rate Limiting 정보 로깅
      if (response.headers['x-api-call-limit']) {
        console.log(`API Call Limit: ${response.headers['x-api-call-limit']}`);
      }

      return response.data;
    } catch (error) {
      // Rate limiting 처리
      if (error.response?.status === 429 && retries > 0) {
        const retryAfter = parseInt(error.response.headers['x-cafe24-call-remain'] || '30');
        console.log(`⚠️ Rate limited. Waiting ${retryAfter} seconds...`);
        await this.sleep(retryAfter * 1000);
        return this.request(endpoint, method, data, retries - 1);
      }

      // 토큰 만료 처리
      if (error.response?.status === 401 && retries > 0) {
        console.log('🔄 Token expired. Refreshing...');
        await tokenManager.refreshToken();
        return this.request(endpoint, method, data, retries - 1);
      }

      // 에러 로깅
      console.error('❌ API Error:', {
        endpoint,
        status: error.response?.status,
        data: error.response?.data
      });

      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== 상품 관련 ====================
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? '?' + queryString : ''}`);
  }

  async getProduct(productNo) {
    return this.request(`/products/${productNo}`);
  }

  // ==================== 게시판 관련 ====================
  async getBoards() {
    return this.request('/boards');
  }

  async getBoard(boardNo) {
    return this.request(`/boards/${boardNo}`);
  }

  // ==================== 리뷰 관련 ====================
  async getReviews(boardNo, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/boards/${boardNo}/articles${queryString ? '?' + queryString : ''}`);
  }

  async getReview(boardNo, articleNo) {
    return this.request(`/boards/${boardNo}/articles/${articleNo}`);
  }

  async createReview(boardNo, reviewData) {
    return this.request(`/boards/${boardNo}/articles`, 'POST', reviewData);
  }

  async updateReview(boardNo, articleNo, reviewData) {
    return this.request(`/boards/${boardNo}/articles/${articleNo}`, 'PUT', reviewData);
  }

  async deleteReview(boardNo, articleNo) {
    return this.request(`/boards/${boardNo}/articles/${articleNo}`, 'DELETE');
  }

  // ==================== 주문 관련 ====================
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders${queryString ? '?' + queryString : ''}`);
  }

  async getOrder(orderId) {
    return this.request(`/orders/${orderId}`);
  }

  // ==================== 회원 관련 ====================
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customers${queryString ? '?' + queryString : ''}`);
  }

  async getCustomer(memberId) {
    return this.request(`/customers/${memberId}`);
  }
}

module.exports = new Cafe24Client();
