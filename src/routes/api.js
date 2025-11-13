const express = require('express');
const router = express.Router();
const cafe24Client = require('../services/cafe24Client');
const reviewService = require('../services/reviewService');
const database = require('../models/database');

/**
 * API 테스트 (간단한 상품 조회)
 * GET /api/test
 */
router.get('/test', async (req, res) => {
  try {
    const products = await cafe24Client.getProducts({ limit: 5 });

    res.json({
      success: true,
      message: 'API 연동 성공!',
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.response?.data || error.toString()
    });
  }
});

/**
 * 상품 목록 조회
 * GET /api/products
 */
router.get('/products', async (req, res) => {
  try {
    const { limit = 10, offset = 0, display, selling } = req.query;

    const params = { limit, offset };
    if (display) params.display = display;
    if (selling) params.selling = selling;

    const products = await cafe24Client.getProducts(params);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 상품 상세 조회
 * GET /api/products/:productNo
 */
router.get('/products/:productNo', async (req, res) => {
  try {
    const { productNo } = req.params;
    const product = await cafe24Client.getProduct(productNo);

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 상품 리뷰 조회 (정렬 및 필터링 포함)
 * GET /api/products/:productNo/reviews
 */
router.get('/products/:productNo/reviews', async (req, res) => {
  try {
    const { productNo } = req.params;
    const {
      sortBy = 'latest',
      limit = 20,
      offset = 0,
      photoOnly = false
    } = req.query;

    const result = await reviewService.getProductReviews(productNo, {
      sortBy,
      limit: parseInt(limit),
      offset: parseInt(offset),
      photoOnly: photoOnly === 'true'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 전체 리뷰 조회
 * GET /api/reviews
 */
router.get('/reviews', async (req, res) => {
  try {
    const {
      sortBy = 'latest',
      limit = 20,
      offset = 0
    } = req.query;

    const result = await reviewService.getAllReviews({
      sortBy,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 리뷰 상세 조회
 * GET /api/reviews/:articleNo
 */
router.get('/reviews/:articleNo', async (req, res) => {
  try {
    const { articleNo } = req.params;
    const review = await reviewService.getReview(articleNo);

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 리뷰 생성
 * POST /api/reviews
 */
router.post('/reviews', async (req, res) => {
  try {
    const reviewData = req.body;
    const result = await reviewService.createReview(reviewData);

    res.status(201).json({
      success: true,
      message: '리뷰가 생성되었습니다.',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 리뷰 수정
 * PUT /api/reviews/:articleNo
 */
router.put('/reviews/:articleNo', async (req, res) => {
  try {
    const { articleNo } = req.params;
    const reviewData = req.body;
    const result = await reviewService.updateReview(articleNo, reviewData);

    res.json({
      success: true,
      message: '리뷰가 수정되었습니다.',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 리뷰 삭제
 * DELETE /api/reviews/:articleNo
 */
router.delete('/reviews/:articleNo', async (req, res) => {
  try {
    const { articleNo } = req.params;
    await reviewService.deleteReview(articleNo);

    res.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 게시판 목록 조회
 * GET /api/boards
 */
router.get('/boards', async (req, res) => {
  try {
    const boards = await cafe24Client.getBoards();

    res.json({
      success: true,
      data: boards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 쇼핑몰 설정 조회
 * GET /app/settings/:mallId
 */
router.get('/app/settings/:mallId', async (req, res) => {
  try {
    const { mallId } = req.params;

    // 설정 조회 (없으면 기본값 반환)
    const settings = database.getSetting(`settings:${mallId}`) || {
      enableWidget: true,
      showStatistics: true,
      showPhotoGallery: true,
      mainColor: '#667eea',
      photoGalleryCount: 8
    };

    res.json(settings);
  } catch (error) {
    console.error('설정 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * 쇼핑몰 설정 저장
 * POST /app/settings/:mallId
 */
router.post('/app/settings/:mallId', async (req, res) => {
  try {
    const { mallId } = req.params;
    const settings = req.body;

    console.log('📥 설정 저장 요청 수신:', {
      mallId,
      settings,
      headers: req.headers,
      body: req.body
    });

    // 요청 바디 검증
    if (!settings || typeof settings !== 'object') {
      console.error('❌ 잘못된 요청 바디:', settings);
      return res.status(400).json({
        success: false,
        message: '잘못된 요청입니다. 설정 데이터가 필요합니다.',
        received: typeof settings
      });
    }

    // 설정 유효성 검사
    const validatedSettings = {
      enableWidget: settings.enableWidget !== undefined ? settings.enableWidget : true,
      showStatistics: settings.showStatistics !== undefined ? settings.showStatistics : true,
      showPhotoGallery: settings.showPhotoGallery !== undefined ? settings.showPhotoGallery : true,
      mainColor: settings.mainColor || '#667eea',
      photoGalleryCount: parseInt(settings.photoGalleryCount) || 8
    };

    // photoGalleryCount 범위 제한
    if (validatedSettings.photoGalleryCount < 4) {
      validatedSettings.photoGalleryCount = 4;
    }
    if (validatedSettings.photoGalleryCount > 20) {
      validatedSettings.photoGalleryCount = 20;
    }

    // 설정 저장
    database.setSetting(`settings:${mallId}`, validatedSettings);
    console.log('✅ 설정 저장 성공:', { mallId, validatedSettings });

    res.json({
      success: true,
      message: '설정이 저장되었습니다.',
      data: validatedSettings
    });
  } catch (error) {
    console.error('❌ 설정 저장 에러 (상세):', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: `서버 오류: ${error.message}`,
      error: error.name
    });
  }
});

module.exports = router;
