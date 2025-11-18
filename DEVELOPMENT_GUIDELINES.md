# 개발 지침 (Claude용 작업 규칙)

이 문서는 Claude가 cafe24-review-app 프로젝트를 작업할 때 따라야 할 규칙입니다.

## 📋 .md 가이드 문서 수정 규칙

⚠️ **중요**: 사용자 대상 가이드 문서는 사용자가 "최종" 확정을 요청할 때까지 수정하지 않습니다.

### 규칙
- 코드 수정 시 .md 파일 자동 업데이트 **금지**
- 사용자가 최종 확정 요청 시 모든 변경사항 **한 번에 반영**
- 최신 수정 내역을 반영한 **통합 문서**로 작성

### 해당 파일 목록
- `README.md`
- `CAFE24_SCRIPTTAG_GUIDE.md`
- `VERCEL_DEPLOY_GUIDE.md`
- 기타 모든 사용자 대상 가이드 문서

### 예외
- `DEVELOPMENT_GUIDELINES.md` (이 파일)은 개발 중 필요 시 수정 가능

---

## 🔍 cafe24-Developers 공식 문서 우선

### 원칙
1. **추측/추정 절대 금지**
2. **공식 문서에서 확인한 내용만 사용**
3. **불확실하면 문서 재확인**
4. 가이드 작성 시 공식 문서 출처 명시

### cafe24-Developers 폴더 구조
```
cafe24-Developers/
├── 개발가이드/
│   ├── OAuth 2.0/
│   │   └── Scope별 사용동의.html  (전체 OAuth scope 목록)
│   ├── 화면 및 디자인 구성/
│   │   └── 화면 스크립트 적용.html  (ScriptTags API 가이드)
│   ├── WebHook 설정/
│   │   └── WebHook 안내.html
│   └── API 사용/
│       └── Admin API 호출.html
```

---

## 🔑 OAuth Scope (최신 확정)

### ScriptTags API 필수 권한
```
mall.read_store   - ScriptTags 조회
mall.write_store  - ScriptTags 생성/수정/삭제
```

**중요**: ScriptTags API는 **Store(상점)** 카테고리에 속함
- ❌ `mall.write_scripttag` - 존재하지 않음
- ❌ `mall.write_design` - 디자인/테마 권한 (ScriptTags와 무관)
- ✅ `mall.write_store` - 상점 설정 권한 (**올바른 권한**)

### 전체 필수 Scope 목록
```
mall.read_product        - 상품 조회
mall.write_product       - 상품 수정
mall.read_application    - 앱 설치 정보 조회
mall.write_application   - 앱 설치 정보 수정
mall.read_store          - 상점 설정 조회 (ScriptTags 포함)
mall.write_store         - 상점 설정 수정 (ScriptTags 포함)
```

### 참고 - 전체 Scope 카테고리 (17개)
1. 상품분류 (Category)
2. 상품 (Product)
3. 판매분류 (Collection)
4. 공급사 (Supply)
5. 개인화정보 (Personal)
6. 주문 (Order)
7. 게시판 (Community)
8. 회원 (Customer)
9. 알림 (Notification)
10. **상점 (Store)** ← ScriptTags 여기!
11. 프로모션 (Promotion)
12. 디자인 (Design)
13. 앱 (Application)
14. 매출통계 (SalesReport)
15. 개인정보 (Privacy)
16. 적립금 (Mileage)
17. 배송 (Shipping)

---

## 📡 ScriptTags API 정보

### API 엔드포인트
```
POST   /api/v2/admin/scripttags       - ScriptTag 생성
GET    /api/v2/admin/scripttags       - ScriptTag 목록 조회
GET    /api/v2/admin/scripttags/{id}  - ScriptTag 상세 조회
PUT    /api/v2/admin/scripttags/{id}  - ScriptTag 수정
DELETE /api/v2/admin/scripttags/{id}  - ScriptTag 삭제
```

### 필수 헤더
```
Authorization: Bearer {access_token}
X-Cafe24-Api-Version: 2025-06-01
Content-Type: application/json
```

### 출처
- 공식 문서: https://developers.cafe24.com/docs/ko/api/admin/#scripttags
- 로컬 문서: cafe24-Developers/개발가이드/화면 및 디자인 구성/화면 스크립트 적용.html

---

## 🚀 개발 원칙

### 1. 에러 발생 시
- 공식 문서 재확인
- Vercel 로그 확인
- 브라우저 콘솔 로그 확인
- 추측하지 말고 실제 에러 메시지 분석

### 2. 새로운 기능 추가 시
- cafe24-Developers 폴더에서 관련 문서 검색
- 공식 API 문서 확인
- 예제 코드 기반으로 구현

### 3. 코드 수정 시
- 변경 사항 명확히 주석 작성
- 커밋 메시지에 상세한 변경 이유 기재
- 관련 문서 출처 명시

---

## 📝 커밋 메시지 규칙

```
<type>: <subject>

<body>

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `refactor`: 리팩토링
- `test`: 테스트 추가
- `chore`: 빌드/설정 변경

---

## ⚠️ 주의사항

### 절대 하지 말 것
1. 공식 문서 확인 없이 OAuth scope 추가/변경
2. 사용자 확인 없이 가이드 문서(.md) 수정
3. 추측으로 API 엔드포인트 작성
4. .env 파일을 git에 커밋

### 반드시 할 것
1. 모든 변경사항 테스트
2. 에러 발생 시 상세 로그 확인
3. 공식 문서 기반 개발
4. 사용자에게 명확한 피드백 제공

---

**마지막 업데이트**: 2025-01-17
**현재 프로젝트**: cafe24-review-app (카페24 리뷰 기능 향상 앱)
