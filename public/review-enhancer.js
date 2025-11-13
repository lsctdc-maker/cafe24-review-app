/**
 * 카페24 리뷰 기능 향상 스크립트
 * 기본 리뷰 시스템에 네이버 스마트스토어 스타일 기능 추가
 */

(function() {
  'use strict';

  const CAFE24_REVIEW_ENHANCER = {
    config: {
      apiBaseUrl: 'https://cafe24reviewapp.vercel.app/api',
      productNo: null,
      mallId: 'webd02'
    },

    reviews: [],
    currentSort: 'latest',
    currentFilter: 'all',

    /**
     * 초기화
     */
    init() {
      console.log('🚀 Cafe24 Review Enhancer 초기화');

      // 상품 번호 추출
      this.config.productNo = this.getProductNo();

      if (!this.config.productNo) {
        console.error('상품 번호를 찾을 수 없습니다');
        return;
      }

      // 리뷰 데이터 로드
      this.loadReviews();
    },

    /**
     * 상품 번호 추출
     */
    getProductNo() {
      // 카페24는 보통 URL에 product_no 파라미터가 있음
      const urlParams = new URLSearchParams(window.location.search);
      let productNo = urlParams.get('product_no');

      if (!productNo) {
        // 페이지 HTML에서 상품 번호 찾기
        const productNoElement = document.querySelector('[data-product-no]');
        if (productNoElement) {
          productNo = productNoElement.dataset.productNo;
        }
      }

      return productNo;
    },

    /**
     * 리뷰 데이터 로드
     */
    async loadReviews() {
      try {
        const response = await fetch(
          `${this.config.apiBaseUrl}/products/${this.config.productNo}/reviews?sort=${this.currentSort}`
        );

        if (!response.ok) {
          throw new Error('리뷰 데이터 로드 실패');
        }

        const data = await response.json();
        this.reviews = data.reviews || [];

        this.render();
      } catch (error) {
        console.error('리뷰 로드 에러:', error);
        // 실패 시 카페24 기본 리뷰만 표시
      }
    },

    /**
     * UI 렌더링
     */
    render() {
      // 리뷰 섹션 찾기
      const reviewSection = this.findReviewSection();

      if (!reviewSection) {
        console.error('리뷰 섹션을 찾을 수 없습니다');
        return;
      }

      // 통계 섹션 추가
      this.insertStatisticsSection(reviewSection);

      // 정렬/필터 컨트롤 추가
      this.insertControlsSection(reviewSection);

      // 포토 리뷰 갤러리 추가
      this.insertPhotoGallery(reviewSection);
    },

    /**
     * 카페24 리뷰 섹션 찾기
     */
    findReviewSection() {
      // 카페24 표준 리뷰 섹션 선택자들
      const selectors = [
        '.xans-product-review',
        '#prdReview',
        '.board-review',
        '[class*="review"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element;
        }
      }

      return null;
    },

    /**
     * 통계 섹션 삽입
     */
    insertStatisticsSection(reviewSection) {
      const stats = this.calculateStatistics();

      const statsHTML = `
        <div class="review-enhancer-statistics">
          <div class="stats-overview">
            <div class="overall-rating">
              <div class="rating-number">${stats.averageRating.toFixed(1)}</div>
              <div class="rating-stars">${this.renderStars(stats.averageRating)}</div>
              <div class="total-reviews">총 ${stats.totalReviews}개 리뷰</div>
            </div>

            <div class="rating-distribution">
              <div class="distribution-title">별점 분포</div>
              ${this.renderDistribution(stats.distribution)}
            </div>
          </div>

          <div class="stats-highlights">
            <div class="highlight-item">
              <span class="highlight-label">포토 리뷰</span>
              <span class="highlight-value">${stats.photoReviews}개</span>
            </div>
            <div class="highlight-item">
              <span class="highlight-label">평균 만족도</span>
              <span class="highlight-value">${(stats.averageRating / 5 * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      `;

      const statsElement = document.createElement('div');
      statsElement.innerHTML = statsHTML;
      reviewSection.insertBefore(statsElement.firstElementChild, reviewSection.firstChild);
    },

    /**
     * 정렬/필터 컨트롤 삽입
     */
    insertControlsSection(reviewSection) {
      const controlsHTML = `
        <div class="review-enhancer-controls">
          <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">전체</button>
            <button class="filter-btn" data-filter="photo">포토리뷰</button>
            <button class="filter-btn" data-filter="5star">5점</button>
            <button class="filter-btn" data-filter="4star">4점</button>
            <button class="filter-btn" data-filter="3star">3점 이하</button>
          </div>

          <div class="sort-dropdown">
            <select id="reviewSort" class="sort-select">
              <option value="latest">최신순</option>
              <option value="rating_high">평점 높은순</option>
              <option value="rating_low">평점 낮은순</option>
              <option value="helpful">도움순</option>
            </select>
          </div>
        </div>
      `;

      const statsSection = reviewSection.querySelector('.review-enhancer-statistics');
      const controlsElement = document.createElement('div');
      controlsElement.innerHTML = controlsHTML;

      if (statsSection) {
        statsSection.after(controlsElement.firstElementChild);
      } else {
        reviewSection.insertBefore(controlsElement.firstElementChild, reviewSection.firstChild);
      }

      // 이벤트 리스너 등록
      this.attachControlListeners();
    },

    /**
     * 포토 리뷰 갤러리 삽입
     */
    insertPhotoGallery(reviewSection) {
      const photoReviews = this.reviews.filter(review => review.has_photo);

      if (photoReviews.length === 0) {
        return;
      }

      const galleryHTML = `
        <div class="review-enhancer-photo-gallery">
          <div class="gallery-title">포토 리뷰 ${photoReviews.length}건</div>
          <div class="gallery-grid">
            ${photoReviews.slice(0, 8).map((review, index) => `
              <div class="gallery-item" data-review-id="${review.board_no}">
                <img src="${review.photo_url || '/placeholder.jpg'}" alt="리뷰 사진">
                <div class="gallery-overlay">
                  <div class="review-rating">${this.renderStars(review.rating)}</div>
                </div>
              </div>
            `).join('')}
          </div>
          ${photoReviews.length > 8 ? `<button class="view-more-photos">포토 리뷰 전체보기</button>` : ''}
        </div>
      `;

      const controlsSection = reviewSection.querySelector('.review-enhancer-controls');
      const galleryElement = document.createElement('div');
      galleryElement.innerHTML = galleryHTML;

      if (controlsSection) {
        controlsSection.after(galleryElement.firstElementChild);
      }

      // 갤러리 클릭 이벤트
      this.attachGalleryListeners();
    },

    /**
     * 통계 계산
     */
    calculateStatistics() {
      const totalReviews = this.reviews.length;

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          photoReviews: 0
        };
      }

      const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      const distribution = this.reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {});

      const photoReviews = this.reviews.filter(review => review.has_photo).length;

      return {
        averageRating,
        totalReviews,
        distribution,
        photoReviews
      };
    },

    /**
     * 별점 분포 렌더링
     */
    renderDistribution(distribution) {
      const totalReviews = Object.values(distribution).reduce((a, b) => a + b, 0);

      return [5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const percentage = totalReviews > 0 ? (count / totalReviews * 100).toFixed(0) : 0;

        return `
          <div class="distribution-bar">
            <span class="star-label">${star}점</span>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="bar-percentage">${percentage}%</span>
            <span class="bar-count">(${count})</span>
          </div>
        `;
      }).join('');
    },

    /**
     * 별점 렌더링
     */
    renderStars(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

      let starsHTML = '';

      for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span class="star star-full">★</span>';
      }

      if (hasHalfStar) {
        starsHTML += '<span class="star star-half">★</span>';
      }

      for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span class="star star-empty">☆</span>';
      }

      return starsHTML;
    },

    /**
     * 컨트롤 이벤트 리스너
     */
    attachControlListeners() {
      // 필터 버튼
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');

          this.currentFilter = e.target.dataset.filter;
          this.applyFilterAndSort();
        });
      });

      // 정렬 드롭다운
      const sortSelect = document.getElementById('reviewSort');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          this.currentSort = e.target.value;
          this.applyFilterAndSort();
        });
      }
    },

    /**
     * 갤러리 이벤트 리스너
     */
    attachGalleryListeners() {
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
          const reviewId = item.dataset.reviewId;
          this.scrollToReview(reviewId);
        });
      });
    },

    /**
     * 필터/정렬 적용
     */
    applyFilterAndSort() {
      let filteredReviews = [...this.reviews];

      // 필터 적용
      if (this.currentFilter === 'photo') {
        filteredReviews = filteredReviews.filter(r => r.has_photo);
      } else if (this.currentFilter === '5star') {
        filteredReviews = filteredReviews.filter(r => r.rating === 5);
      } else if (this.currentFilter === '4star') {
        filteredReviews = filteredReviews.filter(r => r.rating === 4);
      } else if (this.currentFilter === '3star') {
        filteredReviews = filteredReviews.filter(r => r.rating <= 3);
      }

      // 정렬 적용
      filteredReviews.sort((a, b) => {
        switch (this.currentSort) {
          case 'rating_high':
            return b.rating - a.rating;
          case 'rating_low':
            return a.rating - b.rating;
          case 'helpful':
            return (b.helpful_count || 0) - (a.helpful_count || 0);
          case 'latest':
          default:
            return new Date(b.created_date) - new Date(a.created_date);
        }
      });

      // 카페24 기본 리뷰 목록 필터링 (DOM 조작)
      this.filterReviewList(filteredReviews);
    },

    /**
     * 리뷰 목록 필터링 (DOM 조작)
     */
    filterReviewList(filteredReviews) {
      const reviewItems = document.querySelectorAll('.xans-product-review tbody tr, .board-review .review-item');

      reviewItems.forEach(item => {
        item.style.display = 'none';
      });

      filteredReviews.forEach(review => {
        const reviewElement = document.querySelector(`[data-review-id="${review.board_no}"]`);
        if (reviewElement) {
          reviewElement.style.display = '';
        }
      });
    },

    /**
     * 특정 리뷰로 스크롤
     */
    scrollToReview(reviewId) {
      const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);

      if (reviewElement) {
        reviewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        reviewElement.classList.add('highlight-review');

        setTimeout(() => {
          reviewElement.classList.remove('highlight-review');
        }, 2000);
      }
    }
  };

  // 페이지 로드 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CAFE24_REVIEW_ENHANCER.init());
  } else {
    CAFE24_REVIEW_ENHANCER.init();
  }

  // 전역 객체로 노출 (디버깅용)
  window.CAFE24_REVIEW_ENHANCER = CAFE24_REVIEW_ENHANCER;
})();
