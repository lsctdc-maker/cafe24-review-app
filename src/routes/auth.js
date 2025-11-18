const express = require('express');
const router = express.Router();
const config = require('../config/cafe24');
const tokenManager = require('../services/tokenManager');

/**
 * OAuth 인증 시작
 * GET /auth/start
 */
router.get('/start', (req, res) => {
  // CSRF 방지용 state 생성
  const state = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

  // 실제로는 세션에 저장해야 하지만, 간단한 테스트를 위해 생략
  // req.session.oauthState = state;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    // 공식 문서 기준: ScriptTags API는 Store(상점) 카테고리에 속함
    // 필요 권한: mall.read_store, mall.write_store
    // 참고: cafe24-Developers/Scope별 사용동의.html + ScriptTags API 문서
    scope: 'mall.read_product mall.write_product mall.read_application mall.write_application mall.read_store mall.write_store',
    state: state
  });

  const authUrl = `${config.baseUrl()}/oauth/authorize?${params}`;

  console.log('🔐 Starting OAuth flow...');
  console.log('Redirect to:', authUrl);

  res.redirect(authUrl);
});

/**
 * OAuth 콜백
 * GET /auth/callback
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send(`
      <h1>❌ 인증 실패</h1>
      <p>인증 코드가 없습니다.</p>
      <a href="/">홈으로 돌아가기</a>
    `);
  }

  // State 검증 (실제로는 세션과 비교)
  // if (state !== req.session?.oauthState) {
  //   return res.status(400).send('Invalid state');
  // }

  try {
    console.log('💫 Exchanging code for token...');
    const token = await tokenManager.exchangeCodeForToken(code);

    res.send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>인증 완료</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          h1 { color: #4CAF50; margin-bottom: 20px; }
          .success-icon { font-size: 64px; text-align: center; margin-bottom: 20px; }
          .info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-item { margin: 10px 0; font-size: 14px; word-break: break-all; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; margin-top: 5px; }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
            transition: background 0.3s;
          }
          .button:hover { background: #5568d3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>카페24 인증 완료!</h1>
          <p>앱이 성공적으로 연동되었습니다.</p>

          <div class="info">
            <div class="info-item">
              <div class="info-label">Mall ID</div>
              <div class="info-value">${token.mall_id}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Access Token (앞 20자)</div>
              <div class="info-value">${token.access_token.substring(0, 20)}...</div>
            </div>
            <div class="info-item">
              <div class="info-label">만료 시간</div>
              <div class="info-value">${new Date(token.expires_at).toLocaleString('ko-KR')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">권한 (Scopes)</div>
              <div class="info-value">${token.scopes.join(', ')}</div>
            </div>
          </div>

          <a href="/" class="button">메인으로 이동</a>
          <a href="/api/test" class="button" style="background: #4CAF50;">API 테스트</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Auth error:', error);

    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>인증 실패</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f5f5f5;
          }
          .error-container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            max-width: 500px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          h1 { color: #f44336; }
          .error-message {
            background: #ffebee;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            color: #c62828;
          }
          a {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>❌ 인증 실패</h1>
          <div class="error-message">
            <strong>에러:</strong><br>
            ${error.message}
          </div>
          <p>다시 시도해주세요.</p>
          <a href="/auth/start">다시 인증하기</a>
          <a href="/">홈으로</a>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * 토큰 상태 확인
 * GET /auth/status
 */
router.get('/status', async (req, res) => {
  try {
    const token = await tokenManager.getValidToken();

    res.json({
      authenticated: true,
      mall_id: token.mall_id,
      expires_at: token.expires_at,
      scopes: token.scopes
    });
  } catch (error) {
    res.json({
      authenticated: false,
      message: error.message
    });
  }
});

module.exports = router;
