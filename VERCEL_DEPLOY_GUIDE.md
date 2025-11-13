# Vercel 배포 가이드

카페24 리뷰 기능 향상 앱을 Vercel에 배포하는 방법을 안내합니다.

## 📋 배포 전 체크리스트

### 1. 카페24 개발자센터 설정 확인

카페24 개발자센터에서 다음 정보를 확인하세요:

```
Client ID: yUybC9QuHxTpvJ0D5ecewL
Client Secret: DLTChlVQEtisJEWWBR7KgC
Mall ID: webd02
```

### 2. 필수 파일 확인

```bash
cafe24-review-app/
├── src/
├── public/
├── package.json
├── vercel.json  ← Vercel 설정 파일
└── .env  ← 환경 변수 (참고용, Vercel 대시보드에서 설정)
```

## 🚀 Vercel 배포 단계

### Step 1: Vercel 계정 생성 및 프로젝트 연결

1. [Vercel 웹사이트](https://vercel.com) 접속
2. GitHub, GitLab, 또는 Bitbucket으로 로그인
3. "New Project" 클릭
4. GitHub 저장소 선택: `cafe24-review-app`

### Step 2: 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 **모두** 추가하세요:

#### 필수 환경 변수

```bash
# 카페24 앱 설정
CAFE24_MALL_ID=webd02
CAFE24_CLIENT_ID=yUybC9QuHxTpvJ0D5ecewL
CAFE24_CLIENT_SECRET=DLTChlVQEtisJEWWBR7KgC
CAFE24_REDIRECT_URI=https://cafe24reviewapp.vercel.app/auth/callback
CAFE24_API_VERSION=2025-06-01

# 스크립트 자동 삽입 URL
SCRIPT_BASE_URL=https://cafe24reviewapp.vercel.app

# 세션 설정
SESSION_SECRET=cafe24-review-app-secret-key-12345

# 리뷰 앱 설정
REVIEW_CACHE_TTL=300
REVIEWS_PER_PAGE=20

# 서버 환경 (Vercel이 자동 설정)
NODE_ENV=production
```

#### 환경 변수 설정 방법

1. Vercel 프로젝트 대시보드 → Settings → Environment Variables
2. 위의 변수들을 하나씩 추가
3. Environment: `Production`, `Preview`, `Development` 모두 체크
4. Save

### Step 3: 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 및 배포 진행 (약 1~2분 소요)
3. 배포 완료 후 URL 확인: `https://cafe24reviewapp.vercel.app`

### Step 4: 배포 확인

다음 URL들이 정상 작동하는지 확인하세요:

```bash
# 메인 페이지
https://cafe24reviewapp.vercel.app/

# 관리자 페이지
https://cafe24reviewapp.vercel.app/admin.html

# 정적 파일
https://cafe24reviewapp.vercel.app/review-enhancer.js
https://cafe24reviewapp.vercel.app/review-enhancer.css

# API 엔드포인트
https://cafe24reviewapp.vercel.app/health
https://cafe24reviewapp.vercel.app/auth/status
```

## 🔧 카페24 개발자센터 추가 설정

배포 완료 후, 카페24 개발자센터에서 다음 설정을 업데이트해야 합니다.

### 1. Redirect URI 추가

**위치**: 카페24 개발자센터 → Apps → 개발정보 → Redirect URI

**추가할 URL**:
```
https://cafe24reviewapp.vercel.app/auth/callback
```

### 2. 웹훅 URL 등록

**위치**: 카페24 개발자센터 → Apps → 앱 설정 → 웹훅

**등록할 웹훅**:

| 이벤트 | URL |
|--------|-----|
| 앱 설치 | `https://cafe24reviewapp.vercel.app/webhook/install` |
| 앱 제거 | `https://cafe24reviewapp.vercel.app/webhook/uninstall` |
| 앱 업데이트 | `https://cafe24reviewapp.vercel.app/webhook/update` |

### 3. 권한 스코프 확인

다음 스코프가 설정되어 있는지 확인하세요:

```
mall.read_application
mall.write_application
mall.read_product
mall.write_product
mall.read_design
mall.write_design
```

**중요**: `mall.read_design`와 `mall.write_design` 권한은 ScriptTags API를 사용하여 스크립트를 자동으로 삽입하는 데 필요합니다. 이 권한이 있어야 앱 설치 시 자동으로 JavaScript/CSS 파일이 쇼핑몰에 삽입됩니다.

**참고**: 과거 문서에 언급된 `mall.write_scripttag`는 카페24 공식 문서에 존재하지 않는 권한입니다. 올바른 권한은 `mall.write_design`입니다.

### 4. 관리자 페이지 URL 등록

**위치**: 카페24 개발자센터 → Apps → 앱 설정 → 관리자 페이지 URL

**등록할 URL**:
```
https://cafe24reviewapp.vercel.app/admin.html?mall_id={mall_id}
```

## 📱 앱 테스트

### 1. OAuth 인증 테스트

1. `https://cafe24reviewapp.vercel.app/` 접속
2. "카페24 인증 시작" 버튼 클릭
3. 카페24 로그인 및 권한 승인
4. 인증 완료 후 상태 확인

### 2. API 테스트

```bash
# 인증 상태 확인
curl https://cafe24reviewapp.vercel.app/auth/status

# 헬스 체크
curl https://cafe24reviewapp.vercel.app/health

# 설정 조회
curl https://cafe24reviewapp.vercel.app/app/settings/webd02
```

### 3. 관리자 페이지 테스트

1. `https://cafe24reviewapp.vercel.app/admin.html?mall_id=webd02` 접속
2. 설정 변경 후 "저장하기" 클릭
3. 설정이 정상적으로 저장되는지 확인

### 4. 자동 설치 테스트

1. 카페24 개발자센터에서 테스트 앱 설치
2. 웹훅이 `/webhook/install`로 전송되는지 확인
3. ScriptTags API를 통해 스크립트가 자동 삽입되었는지 확인
4. 쇼핑몰의 상품 상세 페이지에서 위젯이 자동으로 표시되는지 확인
5. F12 개발자 도구 → Elements 탭에서 `<script src="https://cafe24reviewapp.vercel.app/review-enhancer.js">` 태그 확인

자세한 ScriptTags API 사용법은 [CAFE24_SCRIPTTAG_GUIDE.md](./CAFE24_SCRIPTTAG_GUIDE.md)를 참고하세요.

## 🔄 업데이트 및 재배포

### 자동 배포

GitHub에 푸시하면 Vercel이 자동으로 배포합니다:

```bash
git add .
git commit -m "Update features"
git push origin main
```

### 수동 배포

1. Vercel 대시보드 → Deployments
2. "Redeploy" 버튼 클릭

## 🐛 문제 해결

### 1. 500 Internal Server Error

**원인**: 환경 변수 누락

**해결**:
- Vercel 대시보드에서 모든 환경 변수가 설정되어 있는지 확인
- 특히 `CAFE24_CLIENT_SECRET` 확인

### 2. CORS 에러

**원인**: 카페24 도메인이 허용되지 않음

**해결**:
- `src/index.js`의 CORS 설정 확인
- `/\.cafe24\.com$/` 정규식이 포함되어 있는지 확인

### 3. OAuth 인증 실패

**원인**: Redirect URI 불일치

**해결**:
- 카페24 개발자센터의 Redirect URI가 정확한지 확인
- `https://cafe24reviewapp.vercel.app/auth/callback` (http가 아닌 https)

### 4. 위젯이 상품 페이지에 표시되지 않음

**원인**: ScriptTags API 호출 실패 또는 권한 부족

**해결**:
- `mall.read_design`와 `mall.write_design` 권한이 카페24 개발자센터에 설정되어 있는지 확인
- Vercel 로그에서 ScriptTag 생성 에러 확인
- 브라우저 개발자 도구 Console 탭에서 스크립트 로딩 에러 확인
- F12 → Network 탭에서 `review-enhancer.js` 파일이 로드되는지 확인

## 📊 로그 확인

### Vercel 로그 보기

1. Vercel 대시보드 → 프로젝트 선택
2. "Logs" 탭 클릭
3. 실시간 로그 확인

### 로그 필터링

```bash
# 에러만 보기
Filter: error

# 특정 경로만 보기
Filter: /api/reviews
```

## 🔐 보안 권장사항

### 1. 환경 변수 관리

- `.env` 파일을 절대 GitHub에 커밋하지 마세요
- `.gitignore`에 `.env` 추가 확인

### 2. Client Secret 보호

- Vercel 환경 변수로만 관리
- 코드에 하드코딩 금지

### 3. CORS 설정

- 필요한 도메인만 허용
- `*` (모든 도메인 허용)은 사용하지 마세요

## 📈 성능 최적화

### 1. 캐시 활용

- 리뷰 데이터는 5분 캐시 (REVIEW_CACHE_TTL=300)
- 자주 변경되지 않는 데이터는 캐시 TTL 증가 고려

### 2. API 호출 최소화

- 필요한 데이터만 요청
- Pagination 적극 활용

### 3. Vercel Edge Network

- Vercel은 자동으로 전 세계 엣지 네트워크에 배포
- 정적 파일은 CDN에 자동 캐시

## 🎯 다음 단계

배포 완료 후:

1. ✅ 카페24 앱스토어에 앱 등록 신청
2. ✅ 테스트 쇼핑몰에서 앱 설치 테스트
3. ✅ **ScriptTags API를 통한 자동 설치 확인** ([CAFE24_SCRIPTTAG_GUIDE.md](./CAFE24_SCRIPTTAG_GUIDE.md) 참고)
4. ✅ 실제 쇼핑몰에 적용
5. ✅ 사용자 피드백 수집

**중요**: 이 앱은 ScriptTags API를 사용하여 스크립트를 자동으로 삽입합니다. 사용자가 "설치하기" 버튼을 클릭하면 자동으로 상품 상세 페이지에 위젯이 나타납니다.

## 📞 지원

문제가 발생하면:

- **GitHub Issues**: https://github.com/lsctdc-maker/cafe24-review-app/issues
- **카페24 개발자센터**: https://developers.cafe24.com/
- **Vercel 문서**: https://vercel.com/docs

---

**배포 URL**: https://cafe24reviewapp.vercel.app
**최종 업데이트**: 2025-11-12
