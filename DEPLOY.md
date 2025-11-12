# Vercel 배포 가이드

## 1단계: GitHub 저장소 생성

1. **GitHub 웹사이트 접속**
   - https://github.com 접속
   - 구글 계정으로 로그인

2. **새 저장소 생성**
   - 우측 상단 `+` 버튼 클릭 → `New repository` 선택
   - Repository name: `cafe24-review-app` (또는 원하는 이름)
   - Description: `카페24 리뷰 앱 - 네이버 스마트스토어 스타일`
   - **Public** 또는 **Private** 선택
   - ⚠️ **"Initialize this repository with" 옵션은 모두 체크 해제!**
   - `Create repository` 버튼 클릭

3. **저장소 URL 복사**
   - 생성 후 표시되는 URL 복사
   - 예: `https://github.com/YOUR_USERNAME/cafe24-review-app.git`

## 2단계: 로컬 코드를 GitHub에 푸시

터미널에서 다음 명령어 실행:

```bash
cd cafe24-review-app

# GitHub 저장소 연결 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/cafe24-review-app.git

# 코드 푸시
git branch -M main
git push -u origin main
```

## 3단계: Vercel 배포

### 3-1. Vercel 계정 생성/로그인

1. https://vercel.com 접속
2. **"Continue with GitHub"** 클릭 (구글 계정 연결된 GitHub 사용)
3. GitHub 계정 승인

### 3-2. 프로젝트 배포

1. **"Add New" > "Project"** 클릭
2. **GitHub 저장소 목록**에서 `cafe24-review-app` 선택
3. **"Import"** 클릭

### 3-3. 환경 변수 설정 (중요!)

**Environment Variables** 섹션에서 다음 값들을 입력:

| Name | Value |
|------|-------|
| `CAFE24_MALL_ID` | `webd02` |
| `CAFE24_CLIENT_ID` | `yUybC9QuHxTpvJ0D5ecewL` |
| `CAFE24_CLIENT_SECRET` | `DLTChlVQEtisJEWWBR7KsgC` |
| `CAFE24_REDIRECT_URI` | `https://YOUR_APP_NAME.vercel.app/auth/callback` ⚠️ |
| `CAFE24_API_VERSION` | `2025-06-01` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

⚠️ **중요**: `CAFE24_REDIRECT_URI`는 배포 후 실제 Vercel URL로 업데이트해야 합니다!

### 3-4. 배포 시작

1. **"Deploy"** 버튼 클릭
2. 배포 진행 상황 확인 (약 1-2분 소요)
3. 배포 완료 후 **"Visit"** 버튼으로 URL 확인

## 4단계: Vercel URL 확인 및 환경 변수 업데이트

### 4-1. 배포된 URL 확인

배포 완료 후 Vercel에서 제공하는 URL:
```
https://cafe24-review-app-xxx.vercel.app
```

### 4-2. Redirect URI 업데이트

1. **Vercel 대시보드** → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. `CAFE24_REDIRECT_URI` 값을 실제 URL로 변경:
   ```
   https://cafe24-review-app-xxx.vercel.app/auth/callback
   ```
4. **Save** 클릭
5. **Deployments** 탭으로 이동
6. 최신 배포 옆 **⋯** 메뉴 → **Redeploy** 클릭 (환경 변수 적용)

## 5단계: 카페24 개발자센터 설정

### 5-1. Redirect URI 변경

1. [카페24 개발자센터](https://developers.cafe24.com/) 로그인
2. **Apps** → **개발정보**
3. **Redirect URI** 섹션 찾기
4. 기존 값 삭제하고 Vercel URL 입력:
   ```
   https://cafe24-review-app-xxx.vercel.app/auth/callback
   ```
5. **저장** 버튼 클릭

### 5-2. (선택) 로컬 개발용 URI 추가

로컬에서도 테스트하려면 두 개 모두 등록:
```
https://cafe24-review-app-xxx.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

## 6단계: 테스트

1. Vercel URL 접속: `https://cafe24-review-app-xxx.vercel.app`
2. **"인증 시작"** 버튼 클릭
3. 카페24 로그인 및 권한 승인
4. 자동 리다이렉트 → 토큰 저장 완료
5. **"API 테스트"** 버튼으로 연동 확인
6. **"리뷰 조회"** 버튼으로 리뷰 데이터 확인

## 🎉 완료!

이제 카페24 리뷰 앱이 **HTTPS**로 배포되어 정상 작동합니다!

## 주의사항

### SQLite 데이터베이스 제한

⚠️ **Vercel은 서버리스 환경**이므로 SQLite 파일이 배포마다 초기화됩니다.

**해결 방법 (선택):**

1. **토큰 초기화 방식 (현재)**
   - 매번 `/auth/start`로 재인증
   - 간단한 테스트용

2. **외부 데이터베이스 사용 (프로덕션)**
   - PostgreSQL (Vercel Postgres, Supabase)
   - MongoDB (MongoDB Atlas)
   - Redis (Upstash)

프로덕션 환경에서는 외부 데이터베이스 사용을 권장합니다.

## 문제 해결

### 배포 실패

**에러**: `Module not found: better-sqlite3`
**해결**: Vercel은 네이티브 모듈을 지원하지 않을 수 있습니다.
→ 외부 데이터베이스로 전환 필요

### 인증 실패

**에러**: `redirect_uri_mismatch`
**해결**:
1. Vercel 환경 변수의 `CAFE24_REDIRECT_URI` 확인
2. 카페24 개발자센터의 Redirect URI 확인
3. 두 값이 **정확히 일치**하는지 확인

### 환경 변수 적용 안 됨

**해결**:
1. Settings → Environment Variables 수정 후
2. Deployments → 최신 배포 → Redeploy 실행

## 추가 기능

### 자동 배포 설정

GitHub에 코드 푸시하면 Vercel이 자동으로 배포합니다:

```bash
# 코드 수정 후
git add .
git commit -m "기능 추가"
git push

# Vercel이 자동으로 감지하고 배포 시작!
```

### 커스텀 도메인 연결

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Domains**
3. 본인 도메인 추가 및 DNS 설정

---

**문서 작성일**: 2025-11-12
