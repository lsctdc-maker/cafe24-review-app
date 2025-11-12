require('dotenv').config();
const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 미들웨어 ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ==================== 라우트 ====================
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// ==================== 메인 페이지 ====================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ==================== 헬스 체크 ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== 404 핸들러 ====================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// ==================== 에러 핸들러 ====================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ==================== 서버 시작 ====================
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 카페24 리뷰 앱 서버 시작!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏪 Mall ID: ${process.env.CAFE24_MALL_ID}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📖 사용 가능한 엔드포인트:');
  console.log(`   ├─ GET  /                      메인 페이지`);
  console.log(`   ├─ GET  /auth/start            카페24 인증 시작`);
  console.log(`   ├─ GET  /auth/callback         OAuth 콜백`);
  console.log(`   ├─ GET  /auth/status           인증 상태 확인`);
  console.log(`   ├─ GET  /api/test              API 테스트`);
  console.log(`   ├─ GET  /api/products          상품 목록`);
  console.log(`   ├─ GET  /api/reviews           전체 리뷰`);
  console.log(`   └─ GET  /api/products/:id/reviews  상품별 리뷰`);
  console.log('');
  console.log('💡 시작하려면 http://localhost:${PORT} 를 브라우저에서 열어주세요!');
  console.log('');
});

// ==================== Graceful Shutdown ====================
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM 신호 받음. 서버 종료 중...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT 신호 받음. 서버 종료 중...');
  process.exit(0);
});
