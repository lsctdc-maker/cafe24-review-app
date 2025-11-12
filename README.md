# 카페24 리뷰 앱

네이버 스마트스토어 스타일의 고급 리뷰 기능을 제공하는 카페24 앱입니다.

## 주요 기능

- ⭐ **다양한 정렬 옵션**: 최신순, 별점 높은순, 별점 낮은순, 인기순, 도움순
- 📊 **리뷰 통계**: 평균 별점, 별점 분포, 포토 리뷰 개수
- 🖼️ **포토 리뷰 필터링**: 이미지가 있는 리뷰만 표시
- 💾 **캐싱 시스템**: 빠른 응답을 위한 리뷰 캐시
- 🔐 **OAuth 2.0 인증**: 안전한 카페24 API 연동
- 🔄 **자동 토큰 갱신**: 토큰 만료 시 자동 갱신
- ⚡ **Rate Limiting 처리**: 429 에러 자동 재시도

## 기술 스택

- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **HTTP Client**: Axios
- **Environment**: dotenv

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

## 프로젝트 구조

```
cafe24-review-app/
├── src/
│   ├── config/
│   │   └── cafe24.js           # 카페24 설정
│   ├── models/
│   │   └── database.js         # 데이터베이스 모델
│   ├── services/
│   │   ├── cafe24Client.js     # 카페24 API 클라이언트
│   │   ├── tokenManager.js     # 토큰 관리
│   │   └── reviewService.js    # 리뷰 로직
│   ├── routes/
│   │   ├── auth.js             # 인증 라우트
│   │   └── api.js              # API 라우트
│   └── index.js                # 메인 서버 파일
├── public/
│   └── index.html              # 테스트 웹 페이지
├── data/
│   └── app.db                  # SQLite 데이터베이스
├── .env                        # 환경 변수 (Git 제외)
├── .gitignore
├── package.json
└── README.md
```

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

## 문제 해결

### 인증 실패

**문제**: "Invalid redirect_uri" 에러
**해결**: 카페24 개발자센터에서 Redirect URI가 정확히 등록되었는지 확인

### 토큰 만료

**문제**: "Token expired" 에러
**해결**: `/auth/start`에서 다시 인증 또는 자동 갱신 대기

### API 호출 실패

**문제**: 429 Too Many Requests
**해결**: Rate Limiting이 적용되었으므로 자동으로 재시도됩니다 (30초 대기)

## 라이선스

MIT

## 문의

카페24 개발자센터: https://developers.cafe24.com/
