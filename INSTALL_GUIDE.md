# 카페24 리뷰 기능 향상 설치 가이드

카페24 쇼핑몰의 기본 리뷰 시스템에 네이버 스마트스토어 스타일 고급 기능을 추가하는 가이드입니다.

## 목차
1. [기능 소개](#기능-소개)
2. [설치 방법](#설치-방법)
3. [커스터마이징](#커스터마이징)
4. [문제 해결](#문제-해결)

---

## 기능 소개

### 추가되는 기능

#### 1. 리뷰 통계 섹션
- **평균 별점** - 큰 숫자로 한눈에 확인
- **총 리뷰 수** - 전체 리뷰 개수 표시
- **별점 분포 차트** - 5점/4점/3점/2점/1점 비율을 막대 그래프로 시각화
- **포토 리뷰 수** - 사진이 있는 리뷰 개수 표시
- **평균 만족도** - 백분율로 표시

#### 2. 정렬 기능
- 최신순
- 평점 높은순
- 평점 낮은순
- 도움순

#### 3. 필터 기능
- 전체 리뷰
- 포토 리뷰만
- 5점 리뷰만
- 4점 리뷰만
- 3점 이하 리뷰만

#### 4. 포토 리뷰 갤러리
- 포토 리뷰 썸네일 모아보기
- 클릭하면 해당 리뷰로 자동 스크롤
- 최대 8개 미리보기 + 전체보기 버튼

---

## 설치 방법

### 준비물
- 카페24 쇼핑몰 관리자 계정
- FTP 접속 정보 (또는 파일 관리 권한)

### 1단계: 파일 업로드

#### 옵션 A: 카페24 관리자에서 직접 업로드 (권장)

1. **카페24 관리자 로그인**
   - https://your-mall-id.cafe24.com/admin 접속

2. **디자인 관리 → 파일 관리**로 이동

3. **스킨 폴더 이동**
   - `/web/` 폴더로 이동

4. **파일 업로드**
   - `review-enhancer.js` 파일 업로드
   - `review-enhancer.css` 파일 업로드

#### 옵션 B: FTP로 업로드

```
/web/review-enhancer.js
/web/review-enhancer.css
```

### 2단계: 스마트디자인 편집

1. **스마트디자인 관리**
   - 카페24 관리자 → **디자인 관리** → **스마트디자인 편집**

2. **상품 상세 페이지 편집**
   - 좌측 메뉴에서 **상품** → **상품 상세**  선택

3. **HTML 편집 모드**
   - 우측 상단 **HTML 편집** 버튼 클릭

4. **CSS 삽입**

   `</head>` 태그 바로 위에 다음 코드 추가:

   ```html
   <!-- 카페24 리뷰 기능 향상 CSS -->
   <link rel="stylesheet" href="/web/review-enhancer.css">
   ```

5. **JavaScript 삽입**

   `</body>` 태그 바로 위에 다음 코드 추가:

   ```html
   <!-- 카페24 리뷰 기능 향상 스크립트 -->
   <script src="/web/review-enhancer.js"></script>
   ```

### 3단계: 저장 및 적용

1. **저장** 버튼 클릭
2. **PC 쇼핑몰** 및 **모바일 쇼핑몰**에 각각 적용
3. 상품 상세 페이지에서 확인

---

## 상세 설치 예시

### 전체 코드 예시

상품 상세 페이지 HTML의 최종 구조:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>상품 상세</title>

    <!-- 기존 CSS들 -->
    <link rel="stylesheet" href="...">

    <!-- ✅ 카페24 리뷰 기능 향상 CSS 추가 -->
    <link rel="stylesheet" href="/web/review-enhancer.css">
</head>
<body>

    <!-- 상품 정보 -->
    <div class="product-detail">
        ...
    </div>

    <!-- 리뷰 섹션 (카페24 기본) -->
    <div class="xans-product-review">
        <!-- 기존 카페24 리뷰 HTML -->
        ...
    </div>

    <!-- 기존 JavaScript들 -->
    <script src="..."></script>

    <!-- ✅ 카페24 리뷰 기능 향상 스크립트 추가 -->
    <script src="/web/review-enhancer.js"></script>
</body>
</html>
```

---

## 커스터마이징

### API 서버 URL 변경

`review-enhancer.js` 파일에서 API 주소를 변경할 수 있습니다:

```javascript
const CAFE24_REVIEW_ENHANCER = {
  config: {
    apiBaseUrl: 'https://your-custom-api.com/api', // ← 여기 수정
    productNo: null,
    mallId: 'your-mall-id' // ← Mall ID도 수정
  },
  ...
}
```

### 색상 변경

`review-enhancer.css` 파일에서 메인 색상을 변경할 수 있습니다:

```css
/* 메인 그라데이션 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* ↓ 원하는 색상으로 변경 */
background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);

/* 강조 색상 */
color: #667eea;
/* ↓ 원하는 색상으로 변경 */
color: #ff6b6b;
```

### 포토 갤러리 개수 변경

`review-enhancer.js` 파일에서 갤러리에 표시할 사진 개수를 변경할 수 있습니다:

```javascript
${photoReviews.slice(0, 8).map((review, index) => `
// ↑ 8을 원하는 숫자로 변경 (예: 12)
```

---

## 문제 해결

### Q1: 리뷰 통계가 표시되지 않아요

**원인:** API 서버 연결 실패 또는 리뷰 데이터 로드 실패

**해결:**
1. 브라우저 개발자 도구 (F12) → Console 탭 확인
2. 에러 메시지 확인
3. API 서버 URL이 올바른지 확인
4. 네트워크 탭에서 API 요청이 성공했는지 확인

```javascript
// 콘솔에서 확인
console.log(window.CAFE24_REVIEW_ENHANCER);
```

### Q2: 디자인이 깨져요

**원인:** CSS 파일 로드 실패 또는 다른 CSS와 충돌

**해결:**
1. CSS 파일 경로가 올바른지 확인
2. 브라우저 개발자 도구 → Network 탭에서 CSS 파일이 로드되는지 확인
3. 다른 CSS와 충돌하는 경우, CSS 선택자 우선순위 조정

### Q3: 상품 번호를 찾을 수 없다고 나와요

**원인:** 카페24 상품 상세 페이지 구조가 다름

**해결:**
`review-enhancer.js` 파일의 `getProductNo()` 함수 수정:

```javascript
getProductNo() {
  // 방법 1: URL 파라미터에서 추출
  const urlParams = new URLSearchParams(window.location.search);
  let productNo = urlParams.get('product_no');

  // 방법 2: 페이지 HTML에서 추출
  if (!productNo) {
    // 카페24 스킨에 따라 선택자가 다를 수 있음
    const productNoElement = document.querySelector('[data-product-no]');
    if (productNoElement) {
      productNo = productNoElement.dataset.productNo;
    }
  }

  // 방법 3: JavaScript 전역 변수에서 추출
  if (!productNo && typeof product_no !== 'undefined') {
    productNo = product_no;
  }

  return productNo;
}
```

### Q4: 필터/정렬이 작동하지 않아요

**원인:** 카페24 리뷰 HTML 구조가 표준과 다름

**해결:**
1. 브라우저 개발자 도구에서 리뷰 HTML 구조 확인
2. `review-enhancer.js` 파일의 선택자 수정:

```javascript
findReviewSection() {
  // 본인 쇼핑몰의 리뷰 섹션 클래스명으로 변경
  const selectors = [
    '.xans-product-review',     // 기본
    '#prdReview',               // 기본
    '.board-review',            // 일부 스킨
    '.your-custom-review-class' // ← 본인 스킨의 클래스 추가
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}
```

### Q5: 모바일에서 디자인이 이상해요

**원인:** 반응형 CSS 미적용 또는 모바일 스킨 구조가 다름

**해결:**
1. 모바일 쇼핑몰 스마트디자인에도 동일하게 CSS/JS 추가
2. `review-enhancer.css`의 미디어 쿼리 확인
3. 필요시 모바일 전용 CSS 추가

---

## 고급 설정

### 리뷰 데이터 소스 변경

기본적으로 외부 API 서버에서 데이터를 가져오지만, 카페24 기본 리뷰만 사용하도록 변경 가능:

```javascript
// review-enhancer.js 수정
async loadReviews() {
  try {
    // 옵션 1: 외부 API 사용 (기본)
    const response = await fetch(`${this.config.apiBaseUrl}/products/${this.config.productNo}/reviews`);
    const data = await response.json();
    this.reviews = data.reviews || [];

    // 옵션 2: 카페24 DOM에서 직접 파싱
    // this.reviews = this.parseReviewsFromDOM();

    this.render();
  } catch (error) {
    console.error('리뷰 로드 에러:', error);
    // 실패 시 DOM에서 파싱 시도
    this.reviews = this.parseReviewsFromDOM();
    this.render();
  }
}

// DOM에서 리뷰 파싱하는 함수 추가
parseReviewsFromDOM() {
  const reviewElements = document.querySelectorAll('.xans-product-review tbody tr');
  const reviews = [];

  reviewElements.forEach((element, index) => {
    // 카페24 HTML 구조에 맞게 파싱
    const rating = element.querySelector('.rating')?.textContent || '0';
    const content = element.querySelector('.content')?.textContent || '';
    const author = element.querySelector('.author')?.textContent || '';
    const date = element.querySelector('.date')?.textContent || '';
    const hasPhoto = element.querySelector('img') !== null;

    reviews.push({
      board_no: index + 1,
      rating: parseInt(rating),
      content,
      author,
      created_date: date,
      has_photo: hasPhoto,
      photo_url: hasPhoto ? element.querySelector('img').src : null
    });
  });

  return reviews;
}
```

---

## 지원 및 문의

- **GitHub**: https://github.com/lsctdc-maker/cafe24-review-app
- **문서**: [CAFE24_DEV_GUIDE.md](./CAFE24_DEV_GUIDE.md)
- **API 문서**: [CAFE24_API_REFERENCE.md](./CAFE24_API_REFERENCE.md)

---

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

**업데이트**: 2025-11-12
