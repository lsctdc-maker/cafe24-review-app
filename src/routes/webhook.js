const express = require('express');
const router = express.Router();
const database = require('../models/database');

/**
 * 앱 설치 웹훅
 * POST /webhook/install
 *
 * 카페24 앱스토어에서 앱이 설치될 때 호출됨
 * ScriptTags API를 통해 자동으로 스크립트 삽입
 */
router.post('/install', async (req, res) => {
  try {
    const { mall_id, app_id, shop_no } = req.body;

    console.log('📦 앱 설치 웹훅 수신:', { mall_id, app_id, shop_no });

    // 기본 설정 생성
    const defaultSettings = {
      enableWidget: true,
      showStatistics: true,
      showPhotoGallery: true,
      mainColor: '#667eea',
      photoGalleryCount: 8,
      installed_at: new Date().toISOString()
    };

    database.setSetting(`settings:${mall_id}`, defaultSettings);

    // ✅ ScriptTags API를 통한 자동 스크립트 삽입
    const cafe24Client = require('../services/cafe24Client');
    const scriptBaseUrl = process.env.SCRIPT_BASE_URL || 'https://cafe24reviewapp.vercel.app';

    try {
      // JavaScript 파일 삽입
      const jsScriptData = {
        src: `${scriptBaseUrl}/review-enhancer.js`,
        display_location: ['PRODUCT_DETAIL'],  // 상품 상세 페이지
        exclude_path: [],
        skin_no: []
      };

      const jsResult = await cafe24Client.createScriptTag(jsScriptData);
      console.log('✅ JavaScript 스크립트 삽입 성공:', jsResult.scripttag.script_no);

      // CSS 파일 삽입
      const cssScriptData = {
        src: `${scriptBaseUrl}/review-enhancer.css`,
        display_location: ['PRODUCT_DETAIL'],
        exclude_path: [],
        skin_no: []
      };

      const cssResult = await cafe24Client.createScriptTag(cssScriptData);
      console.log('✅ CSS 스크립트 삽입 성공:', cssResult.scripttag.script_no);

      // script_no 저장 (제거 시 필요)
      defaultSettings.script_nos = {
        js: jsResult.scripttag.script_no,
        css: cssResult.scripttag.script_no
      };
      database.setSetting(`settings:${mall_id}`, defaultSettings);

      console.log('✅ 앱 설치 완료 (자동 설치 성공):', mall_id);

      res.json({
        success: true,
        message: '앱이 성공적으로 설치되었습니다. 상품 상세 페이지에서 확인하세요.',
        mall_id,
        auto_installation: true,
        script_nos: defaultSettings.script_nos
      });

    } catch (scriptError) {
      console.error('❌ ScriptTag 삽입 실패 (상세 정보):', {
        message: scriptError.message,
        stack: scriptError.stack,
        response: scriptError.response?.data,
        status: scriptError.response?.status,
        statusText: scriptError.response?.statusText,
        mall_id,
        note: '카페24 개발자센터에서 mall.write_scripttag 권한이 승인되었는지 확인 필요'
      });

      // ScriptTag 실패해도 설정은 저장되었으므로 성공으로 처리
      res.json({
        success: true,
        message: '앱이 설치되었으나 스크립트 자동 삽입에 실패했습니다. 관리자 페이지를 확인하세요.',
        mall_id,
        auto_installation: false,
        error: scriptError.message,
        debug: {
          cafe24_response: scriptError.response?.data,
          status_code: scriptError.response?.status
        }
      });
    }

  } catch (error) {
    console.error('❌ 앱 설치 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 앱 제거 웹훅
 * POST /webhook/uninstall
 *
 * 카페24 앱스토어에서 앱이 제거될 때 호출됨
 * ScriptTags API를 통해 자동으로 스크립트 삭제
 */
router.post('/uninstall', async (req, res) => {
  try {
    const { mall_id, app_id, shop_no } = req.body;

    console.log('🗑️ 앱 제거 웹훅 수신:', { mall_id, app_id, shop_no });

    // 설정에서 script_no 가져오기
    const settings = database.getSetting(`settings:${mall_id}`);

    if (settings && settings.script_nos) {
      const cafe24Client = require('../services/cafe24Client');

      try {
        // JavaScript 스크립트 삭제
        if (settings.script_nos.js) {
          await cafe24Client.deleteScriptTag(settings.script_nos.js);
          console.log('✅ JavaScript 스크립트 삭제 성공:', settings.script_nos.js);
        }

        // CSS 스크립트 삭제
        if (settings.script_nos.css) {
          await cafe24Client.deleteScriptTag(settings.script_nos.css);
          console.log('✅ CSS 스크립트 삭제 성공:', settings.script_nos.css);
        }
      } catch (scriptError) {
        console.error('⚠️ ScriptTag 삭제 실패 (설정은 삭제됨):', scriptError);
      }
    }

    // 설정 삭제
    database.setSetting(`settings:${mall_id}`, null);

    console.log('✅ 앱 제거 완료 (스크립트 자동 삭제):', mall_id);

    res.json({
      success: true,
      message: '앱이 성공적으로 제거되었습니다.',
      mall_id
    });

  } catch (error) {
    console.error('❌ 앱 제거 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 앱 업데이트 웹훅
 * POST /webhook/update
 *
 * 앱 버전이 업데이트될 때 호출됨 (선택사항)
 */
router.post('/update', async (req, res) => {
  try {
    const { mall_id, app_id, shop_no, version } = req.body;

    console.log('🔄 앱 업데이트 웹훅 수신:', { mall_id, app_id, shop_no, version });

    // 기존 설정 유지하면서 업데이트 정보만 추가
    const existingSettings = database.getSetting(`settings:${mall_id}`);

    if (existingSettings) {
      database.setSetting(`settings:${mall_id}`, {
        ...existingSettings,
        updated_at: new Date().toISOString(),
        version
      });
    }

    res.json({
      success: true,
      message: '앱이 성공적으로 업데이트되었습니다.',
      mall_id
    });

  } catch (error) {
    console.error('❌ 앱 업데이트 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
