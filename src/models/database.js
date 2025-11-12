const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 데이터 디렉토리 생성
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'app.db');
const db = new Database(dbPath);

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    refresh_token_expires_at TEXT NOT NULL,
    mall_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS review_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_no INTEGER NOT NULL,
    review_data TEXT NOT NULL,
    cached_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_no)
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = {
  // 토큰 관리
  getToken() {
    const stmt = db.prepare('SELECT * FROM tokens ORDER BY id DESC LIMIT 1');
    return stmt.get();
  },

  saveToken(tokenData) {
    const stmt = db.prepare(`
      INSERT INTO tokens (access_token, refresh_token, expires_at, refresh_token_expires_at, mall_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_at,
      tokenData.refresh_token_expires_at || '',
      tokenData.mall_id
    );
  },

  updateToken(tokenData) {
    const stmt = db.prepare(`
      UPDATE tokens
      SET access_token = ?,
          refresh_token = ?,
          expires_at = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM tokens ORDER BY id DESC LIMIT 1)
    `);

    stmt.run(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_at
    );
  },

  // 리뷰 캐시
  getCachedReviews(productNo) {
    const stmt = db.prepare('SELECT review_data, cached_at FROM review_cache WHERE product_no = ?');
    const result = stmt.get(productNo);

    if (!result) {
      return null;
    }

    // 캐시 유효 시간 확인 (기본 5분)
    const cacheTime = new Date(result.cached_at);
    const now = new Date();
    const ttl = parseInt(process.env.REVIEW_CACHE_TTL || '300') * 1000;

    if (now - cacheTime > ttl) {
      return null; // 캐시 만료
    }

    return JSON.parse(result.review_data);
  },

  cacheReviews(productNo, reviewData) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO review_cache (product_no, review_data, cached_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(productNo, JSON.stringify(reviewData));
  },

  // 설정
  getSetting(key) {
    const stmt = db.prepare('SELECT value FROM app_settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  },

  setSetting(key, value) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(key, value);
  },

  // 데이터베이스 닫기
  close() {
    db.close();
  }
};
