// 메모리 기반 저장소 (Vercel 서버리스 환경용)
// 주의: 서버 재시작 시 모든 데이터가 초기화됩니다.

const storage = {
  token: null,
  reviewCache: new Map(),
  settings: new Map()
};

module.exports = {
  // 토큰 관리
  getToken() {
    return storage.token;
  },

  saveToken(tokenData) {
    storage.token = {
      ...tokenData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    console.log('✅ Token saved to memory');
  },

  updateToken(tokenData) {
    if (storage.token) {
      storage.token = {
        ...storage.token,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        updated_at: new Date().toISOString()
      };
      console.log('✅ Token updated in memory');
    }
  },

  // 리뷰 캐시
  getCachedReviews(productNo) {
    const cached = storage.reviewCache.get(productNo);

    if (!cached) {
      return null;
    }

    // 캐시 유효 시간 확인 (기본 5분)
    const cacheTime = new Date(cached.cached_at);
    const now = new Date();
    const ttl = parseInt(process.env.REVIEW_CACHE_TTL || '300') * 1000;

    if (now - cacheTime > ttl) {
      storage.reviewCache.delete(productNo);
      return null; // 캐시 만료
    }

    return cached.review_data;
  },

  cacheReviews(productNo, reviewData) {
    storage.reviewCache.set(productNo, {
      review_data: reviewData,
      cached_at: new Date().toISOString()
    });
  },

  // 설정
  getSetting(key) {
    return storage.settings.get(key) || null;
  },

  setSetting(key, value) {
    storage.settings.set(key, value);
  },

  // 데이터베이스 닫기 (메모리 저장소에서는 불필요)
  close() {
    // No-op for memory storage
  }
};
