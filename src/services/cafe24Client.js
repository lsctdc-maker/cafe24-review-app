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

  // ==================== ScriptTags 관련 ====================
  /**
   * ScriptTag 목록 조회
   * GET /api/v2/admin/scripttags
   *
   * @param {Object} params - 조회 파라미터
   * @returns {Promise} ScriptTag 목록
   */
  async getScriptTags(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/scripttags${queryString ? '?' + queryString : ''}`);
  }

  /**
   * ScriptTag 생성
   * POST /api/v2/admin/scripttags
   *
   * @param {Object} scriptData - 스크립트 데이터
   * @param {string} scriptData.src - 스크립트 URL (HTTPS 필수)
   * @param {Array<string>} scriptData.display_location - 표시 위치 배열
   *   가능한 값: MAIN, PRODUCT_LIST, PRODUCT_DETAIL, CART, ORDER, ORDER_COMPLETE,
   *              MYSHOP, BOARD_LIST, BOARD_VIEW, ALL
   * @param {Array<string>} scriptData.exclude_path - 제외할 경로 (선택)
   * @param {Array<number>} scriptData.skin_no - 스킨 번호 (선택)
   * @param {string} scriptData.integrity - SRI 해시 (선택)
   * @returns {Promise} 생성된 ScriptTag 정보
   *
   * @example
   * const scriptData = {
   *   src: 'https://your-app.com/widget.js',
   *   display_location: ['PRODUCT_DETAIL', 'MAIN'],
   *   exclude_path: [],
   *   skin_no: []
   * };
   * const result = await cafe24Client.createScriptTag(scriptData);
   */
  async createScriptTag(scriptData) {
    return this.request('/scripttags', 'POST', {
      shop_no: 1,  // 기본 쇼핑몰 번호
      request: scriptData
    });
  }

  /**
   * ScriptTag 수정
   * PUT /api/v2/admin/scripttags/{script_no}
   *
   * @param {number} scriptNo - 스크립트 번호
   * @param {Object} scriptData - 수정할 스크립트 데이터
   * @returns {Promise} 수정된 ScriptTag 정보
   */
  async updateScriptTag(scriptNo, scriptData) {
    return this.request(`/scripttags/${scriptNo}`, 'PUT', {
      shop_no: 1,
      request: scriptData
    });
  }

  /**
   * ScriptTag 삭제
   * DELETE /api/v2/admin/scripttags/{script_no}
   *
   * @param {number} scriptNo - 삭제할 스크립트 번호
   * @returns {Promise} 삭제 결과
   */
  async deleteScriptTag(scriptNo) {
    return this.request(`/scripttags/${scriptNo}`, 'DELETE');
  }
}

module.exports = new Cafe24Client();
