const express = require('express');
const router = express.Router();
const cafe24Client = require('../services/cafe24Client');
const reviewService = require('../services/reviewService');

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

module.exports = router;
