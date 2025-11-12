# 카페24 리뷰 기능 향상 앱

카페24 쇼핑몰의 기본 리뷰 시스템에 **네이버 스마트스토어 스타일의 고급 기능**을 추가하는 프로젝트입니다.

## ✨ 프로젝트 구성

이 프로젝트는 두 가지 주요 컴포넌트로 구성됩니다:

### 1. 백엔드 API 서버 (Node.js + Express)
카페24 API와 연동하여 리뷰 데이터를 처리하는 서버

### 2. 프론트엔드 위젯 (JavaScript + CSS)
카페24 쇼핑몰 상품 페이지에 삽입하여 기본 리뷰 시스템을 향상시키는 스크립트

## 🎯 주요 기능

### 추가되는 네이버 스타일 기능

#### 📊 리뷰 통계 섹션
- **평균 별점** - 큰 숫자로 한눈에 확인
- **총 리뷰 수** - 전체 리뷰 개수 표시
- **별점 분포 차트** - 5점/4점/3점/2점/1점 비율을 막대 그래프로 시각화
- **포토 리뷰 수** - 사진이 있는 리뷰 개수
- **평균 만족도** - 백분율로 표시

#### 🔄 정렬 기능
- 최신순
- 평점 높은순
- 평점 낮은순
- 도움순

#### 🎨 필터 기능
- 전체 리뷰
- 포토 리뷰만
- 5점 리뷰만
- 4점 리뷰만
- 3점 이하 리뷰만

#### 🖼️ 포토 리뷰 갤러리
- 포토 리뷰 썸네일 모아보기
- 클릭하면 해당 리뷰로 자동 스크롤
- 최대 8개 미리보기 + 전체보기 버튼

### 백엔드 기능

- 🔐 **OAuth 2.0 인증**: 안전한 카페24 API 연동
- 🔄 **자동 토큰 갱신**: 토큰 만료 시 자동 갱신
- ⚡ **Rate Limiting 처리**: 429 에러 자동 재시도
- 💾 **메모리 캐싱**: 빠른 응답을 위한 리뷰 캐시 (Vercel 서버리스 환경 최적화)
- 📈 **리뷰 통계 계산**: 별점 분포, 평균 등 실시간 계산

## 💻 기술 스택

### 백엔드
- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Storage**: In-memory (Map) - Vercel 서버리스 환경 최적화
- **HTTP Client**: Axios
- **Environment**: dotenv

### 프론트엔드
- **Vanilla JavaScript** - 프레임워크 없이 순수 JavaScript
- **CSS3** - 네이버 스타일 반응형 디자인
- **DOM Manipulation** - 카페24 기본 HTML과 통합

## 설치 및 실행

### 1. 사전 준비

- Node.js 14 이상 설치
- 카페24 개발자센터 계정
- 카페24 앱 생성 (Client ID, Secret 발급)

### 2. 프로젝트 설치

```bash
cd cafe24-review-app
npm install
```

### 3. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다:

```bash
CAFE24_MALL_ID=webd02
CAFE24_CLIENT_ID=yUybC9QuHxTpvJ0D5ecewL
CAFE24_CLIENT_SECRET=DLTChlVQEtisJEWWBR7KsgC
CAFE24_REDIRECT_URI=http://localhost:3000/auth/callback
CAFE24_API_VERSION=2025-06-01
PORT=3000
```

### 4. 카페24 개발자센터 설정

**중요!** 카페24 개발자센터에서 Redirect URI를 설정해야 합니다:

1. [카페24 개발자센터](https://developers.cafe24.com/) 로그인
2. Apps > 개발정보
3. **Redirect URI 수정**: `http://localhost:3000/auth/callback`
4. 저장

### 5. 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 모드
npm start
```

서버가 시작되면 브라우저에서 접속:
```
http://localhost:3000
```

## 사용 방법

### 1단계: 인증

1. 브라우저에서 `http://localhost:3000` 접속
2. "인증 시작" 버튼 클릭
3. 카페24 로그인 및 권한 승인
4. 자동으로 리다이렉트되어 토큰 저장 완료

### 2단계: API 테스트

1. "API 테스트" 버튼 클릭
2. 상품 목록 조회 확인
3. 정상 작동 확인

### 3단계: 리뷰 조회

1. "전체 리뷰 조회" 버튼 클릭
2. 리뷰 데이터 및 통계 확인

## API 엔드포인트

### 인증

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/auth/start` | 카페24 인증 시작 |
| GET | `/auth/callback` | OAuth 콜백 |
| GET | `/auth/status` | 인증 상태 확인 |

### 상품

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/products` | 상품 목록 조회 |
| GET | `/api/products/:id` | 상품 상세 조회 |

### 리뷰

| 메서드 | 경로 | 설명 | 쿼리 파라미터 |
|--------|------|------|--------------|
| GET | `/api/reviews` | 전체 리뷰 조회 | `sortBy`, `limit`, `offset` |
| GET | `/api/products/:id/reviews` | 상품별 리뷰 조회 | `sortBy`, `limit`, `offset`, `photoOnly` |
| GET | `/api/reviews/:articleNo` | 리뷰 상세 조회 | - |
| POST | `/api/reviews` | 리뷰 생성 | - |
| PUT | `/api/reviews/:articleNo` | 리뷰 수정 | - |
| DELETE | `/api/reviews/:articleNo` | 리뷰 삭제 | - |

### 정렬 옵션 (sortBy)

- `latest`: 최신순 (기본값)
- `rating_high`: 별점 높은순
- `rating_low`: 별점 낮은순
- `popular`: 인기순 (조회수)
- `helpful`: 도움순 (댓글 많은순)

### 예제

```bash
# 상품 123번의 리뷰를 별점 높은순으로 20개 조회 (포토 리뷰만)
GET /api/products/123/reviews?sortBy=rating_high&limit=20&photoOnly=true

# 전체 리뷰를 최신순으로 50개 조회
GET /api/reviews?sortBy=latest&limit=50&offset=0
```

## 📁 프로젝트 구조

```
cafe24-review-app/
├── src/                         # 백엔드 소스
│   ├── config/
│   │   └── cafe24.js           # 카페24 API 설정
│   ├── models/
│   │   └── database.js         # 메모리 기반 저장소
│   ├── services/
│   │   ├── cafe24Client.js     # 카페24 API 클라이언트
│   │   ├── tokenManager.js     # OAuth 토큰 관리
│   │   └── reviewService.js    # 리뷰 비즈니스 로직
│   ├── routes/
│   │   ├── auth.js             # OAuth 인증 라우트
│   │   └── api.js              # API 엔드포인트
│   └── index.js                # Express 서버 진입점
├── public/                      # 프론트엔드 리소스
│   ├── index.html              # 관리자 테스트 페이지
│   ├── review-enhancer.js      # ⭐ 리뷰 기능 향상 위젯 (카페24 삽입용)
│   └── review-enhancer.css     # ⭐ 네이버 스타일 CSS (카페24 삽입용)
├── .env                        # 환경 변수 (로컬)
├── vercel.json                 # Vercel 배포 설정
├── package.json
├── README.md                   # 프로젝트 설명 (본 파일)
├── INSTALL_GUIDE.md            # ⭐ 카페24 쇼핑몰 설치 가이드
├── DEPLOY.md                   # Vercel 배포 가이드
├── CAFE24_DEV_GUIDE.md         # 카페24 API 개발 가이드
└── CAFE24_API_REFERENCE.md     # 카페24 API 레퍼런스
```

### 주요 파일 설명

**카페24 쇼핑몰에 설치할 파일:**
- `public/review-enhancer.js` - 리뷰 기능 향상 JavaScript
- `public/review-enhancer.css` - 네이버 스타일 CSS

**백엔드 API 서버:**
- `src/index.js` - Express 서버
- `src/routes/api.js` - 리뷰 API 엔드포인트

## Vercel 배포

### 1. GitHub 저장소 생성

```bash
cd cafe24-review-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Vercel 배포

1. [Vercel](https://vercel.com) 가입/로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. Environment Variables 설정:
   - `CAFE24_MALL_ID`
   - `CAFE24_CLIENT_ID`
   - `CAFE24_CLIENT_SECRET`
   - `CAFE24_REDIRECT_URI`: `https://your-app.vercel.app/auth/callback`
   - `CAFE24_API_VERSION`
5. Deploy 클릭

### 3. 카페24 개발자센터 Redirect URI 추가

```
https://your-app.vercel.app/auth/callback
```

## 🚀 빠른 시작 가이드

### Step 1: 백엔드 API 서버 배포

1. **Vercel에 배포** (무료)
   - [DEPLOY.md](./DEPLOY.md) 가이드 참고
   - 환경 변수 설정
   - `https://your-app.vercel.app` URL 확보

2. **OAuth 인증 완료**
   - `https://your-app.vercel.app/auth/start` 접속
   - 카페24 로그인 및 권한 승인

### Step 2: 카페24 쇼핑몰에 위젯 설치

1. **파일 다운로드**
   - `public/review-enhancer.js`
   - `public/review-enhancer.css`

2. **카페24 쇼핑몰에 업로드**
   - 카페24 관리자 → 디자인 관리 → 파일 관리
   - `/web/` 폴더에 업로드

3. **스마트디자인에 코드 삽입**
   - [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) 가이드 참고
   - 상품 상세 페이지 HTML 편집
   - CSS, JavaScript 태그 추가

### Step 3: 완료!

상품 상세 페이지에서 네이버 스타일 리뷰 기능 확인

---

## 📚 상세 문서

| 문서 | 설명 |
|------|------|
| [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) | 카페24 쇼핑몰 설치 가이드 (필수) |
| [DEPLOY.md](./DEPLOY.md) | Vercel 배포 가이드 |
| [CAFE24_DEV_GUIDE.md](./CAFE24_DEV_GUIDE.md) | 카페24 API 개발 가이드 |
| [CAFE24_API_REFERENCE.md](./CAFE24_API_REFERENCE.md) | API 레퍼런스 |

---

## 🔧 문제 해결

### 백엔드 관련

**문제**: "Invalid redirect_uri" 에러
**해결**: 카페24 개발자센터에서 Redirect URI가 정확히 등록되었는지 확인

**문제**: "Token expired" 에러
**해결**: `/auth/start`에서 다시 인증 또는 자동 갱신 대기

**문제**: 429 Too Many Requests
**해결**: Rate Limiting이 적용되었으므로 자동으로 재시도됩니다 (30초 대기)

### 프론트엔드 관련

**문제**: 리뷰 통계가 표시되지 않음
**해결**: [INSTALL_GUIDE.md](./INSTALL_GUIDE.md)의 문제 해결 섹션 참고

**문제**: 디자인이 깨짐
**해결**: CSS 파일 경로 확인, 다른 CSS와의 충돌 확인

**문제**: 필터/정렬이 작동하지 않음
**해결**: 카페24 리뷰 HTML 구조 확인, 선택자 수정

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 📞 문의 및 지원

- **GitHub Issues**: [이슈 등록](https://github.com/lsctdc-maker/cafe24-review-app/issues)
- **카페24 개발자센터**: https://developers.cafe24.com/
- **문서**: 프로젝트 내 MD 파일들 참고

---

## 🎉 완성 예시

### Before (카페24 기본 리뷰)
- 단순한 텍스트 리스트
- 별점과 내용만 표시
- 정렬/필터 기능 없음

### After (네이버 스타일 추가)
- 📊 시각적인 통계 차트
- 🔄 다양한 정렬/필터 옵션
- 🖼️ 포토 리뷰 갤러리
- 📱 반응형 디자인

---

**개발자**: webd02
**최종 업데이트**: 2025-11-12
