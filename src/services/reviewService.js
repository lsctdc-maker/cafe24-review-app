const cafe24Client = require('./cafe24Client');
const db = require('../models/database');

class ReviewService {
  constructor() {
    this.reviewBoardNo = null;
  }

  /**
   * 리뷰 게시판 번호 찾기
   */
  async getReviewBoardNo() {
    if (this.reviewBoardNo) {
      return this.reviewBoardNo;
    }

    // 설정에서 먼저 확인
    const savedBoardNo = db.getSetting('review_board_no');
    if (savedBoardNo) {
      this.reviewBoardNo = parseInt(savedBoardNo);
      return this.reviewBoardNo;
    }

    // API에서 찾기
    const boards = await cafe24Client.getBoards();
    const reviewBoard = boards.boards.find(b => b.board_type === 'review');

    if (!reviewBoard) {
      throw new Error('Review board not found. Please check your mall settings.');
    }

    this.reviewBoardNo = reviewBoard.board_no;
    db.setSetting('review_board_no', this.reviewBoardNo.toString());

    console.log(`✅ Review board found: ${this.reviewBoardNo}`);
    return this.reviewBoardNo;
  }

  /**
   * 상품 리뷰 조회 (정렬 및 필터링 포함)
   */
  async getProductReviews(productNo, options = {}) {
    const {
      sortBy = 'latest',  // latest, rating_high, rating_low, popular, helpful
      limit = parseInt(process.env.REVIEWS_PER_PAGE || '20'),
      offset = 0,
      photoOnly = false
    } = options;

    // 캐시 확인
    const cacheKey = `${productNo}_${sortBy}_${photoOnly}`;
    const cached = db.getCachedReviews(cacheKey);
    if (cached) {
      console.log('📦 Using cached reviews');
      return this.paginateReviews(cached, limit, offset);
    }

    const boardNo = await this.getReviewBoardNo();

    // API 호출 (최대한 많이 가져와서 정렬)
    const response = await cafe24Client.getReviews(boardNo, {
      product_no: productNo,
      limit: 100,
      offset: 0
    });

    let reviews = response.articles || [];

    // 이미지만 필터링
    if (photoOnly) {
      reviews = reviews.filter(r => r.images && r.images.length > 0);
    }

    // 정렬
    reviews = this.sortReviews(reviews, sortBy);

    // 통계 계산
    const stats = this.calculateStats(reviews);

    const result = {
      reviews,
      stats,
      total: reviews.length
    };

    // 캐시 저장
    db.cacheReviews(cacheKey, result);

    return this.paginateReviews(result, limit, offset);
  }

  /**
   * 페이지네이션 적용
   */
  paginateReviews(result, limit, offset) {
    const paginatedReviews = result.reviews.slice(offset, offset + limit);

    return {
      reviews: paginatedReviews,
      stats: result.stats,
      total: result.total,
      page: {
        limit,
        offset,
        hasMore: offset + limit < result.total
      }
    };
  }

  /**
   * 리뷰 정렬
   */
  sortReviews(reviews, sortBy) {
    switch (sortBy) {
      case 'latest':
        // 최신순
        return reviews.sort((a, b) =>
          new Date(b.created_date) - new Date(a.created_date)
        );

      case 'rating_high':
        // 별점 높은순
        return reviews.sort((a, b) => {
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          // 별점이 같으면 최신순
          return new Date(b.created_date) - new Date(a.created_date);
        });

      case 'rating_low':
        // 별점 낮은순
        return reviews.sort((a, b) => {
          if (a.rating !== b.rating) {
            return a.rating - b.rating;
          }
          // 별점이 같으면 최신순
          return new Date(b.created_date) - new Date(a.created_date);
        });

      case 'popular':
        // 인기순 (조회수)
        return reviews.sort((a, b) => {
          if (b.hit !== a.hit) {
            return b.hit - a.hit;
          }
          return new Date(b.created_date) - new Date(a.created_date);
        });

      case 'helpful':
        // 도움순 (댓글 많은순)
        return reviews.sort((a, b) => {
          if (b.reply_count !== a.reply_count) {
            return b.reply_count - a.reply_count;
          }
          return new Date(b.created_date) - new Date(a.created_date);
        });

      default:
        return reviews;
    }
  }

  /**
   * 리뷰 통계 계산
   */
  calculateStats(reviews) {
    const total = reviews.length;

    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        photoReviewCount: 0,
        percentage: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    // 평균 별점
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = (sum / total).toFixed(1);

    // 별점 분포
    const distribution = reviews.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    // 별점 비율 (%)
    const percentage = {};
    for (let i = 1; i <= 5; i++) {
      percentage[i] = ((distribution[i] / total) * 100).toFixed(1);
    }

    // 포토 리뷰 개수
    const photoReviewCount = reviews.filter(r =>
      r.images && r.images.length > 0
    ).length;

    return {
      average: parseFloat(average),
      total,
      distribution,
      percentage,
      photoReviewCount
    };
  }

  /**
   * 전체 리뷰 조회 (상품 번호 없이)
   */
  async getAllReviews(options = {}) {
    const {
      sortBy = 'latest',
      limit = parseInt(process.env.REVIEWS_PER_PAGE || '20'),
      offset = 0
    } = options;

    const boardNo = await this.getReviewBoardNo();

    const response = await cafe24Client.getReviews(boardNo, {
      limit,
      offset
    });

    let reviews = response.articles || [];
    reviews = this.sortReviews(reviews, sortBy);

    return {
      reviews,
      total: reviews.length,
      page: {
        limit,
        offset
      }
    };
  }

  /**
   * 리뷰 상세 조회
   */
  async getReview(articleNo) {
    const boardNo = await this.getReviewBoardNo();
    return cafe24Client.getReview(boardNo, articleNo);
  }

  /**
   * 리뷰 생성
   */
  async createReview(reviewData) {
    const boardNo = await this.getReviewBoardNo();
    return cafe24Client.createReview(boardNo, reviewData);
  }

  /**
   * 리뷰 수정
   */
  async updateReview(articleNo, reviewData) {
    const boardNo = await this.getReviewBoardNo();
    return cafe24Client.updateReview(boardNo, articleNo, reviewData);
  }

  /**
   * 리뷰 삭제
   */
  async deleteReview(articleNo) {
    const boardNo = await this.getReviewBoardNo();
    return cafe24Client.deleteReview(boardNo, articleNo);
  }
}

module.exports = new ReviewService();
