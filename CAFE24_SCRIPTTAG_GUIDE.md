# 카페24 ScriptTags API 가이드

카페24 앱에서 스크립트를 자동으로 쇼핑몰에 삽입하는 공식 방법입니다.

## 📚 공식 문서

- **API 문서**: https://developers.cafe24.com/docs/ko/api/admin/#scripttags
- **개발 가이드**: 카페24 Developers → 개발가이드 → 화면 및 디자인 구성 → 화면 스크립트 적용

## ✅ ScriptTags API란?

카페24가 공식 제공하는 API로, **앱 설치 시 자동으로 JavaScript/CSS를 쇼핑몰에 삽입**할 수 있습니다.

### 주요 특징

1. **자동 스크립트 삽입**: 앱 설치 시 웹훅에서 API 호출하여 자동 삽입
2. **화면별 선택 가능**: 특정 페이지(상품 상세, 메인 등)에만 삽입 가능
3. **안전한 로딩**: 쇼핑몰 기본 스크립트 로딩 후 실행되어 장애 방지
4. **중앙 관리**: 카페24가 스크립트 버전 관리 및 캐싱 처리

## 🔑 필수 권한

OAuth Scope에 다음 권한이 **반드시** 필요합니다:

```
mall.read_design
mall.write_design
```

**중요**: ScriptTags API는 디자인/화면 관련 API이므로 `mall.write_design` 권한이 필요합니다.
`mall.write_scripttag`라는 권한은 카페24 공식 문서에 존재하지 않습니다.

## 📡 API 엔드포인트

### 1. ScriptTag 생성 (앱 설치 시)

**엔드포인트**: `POST /api/v2/admin/scripttags`

**요청 예시**:

```bash
curl -X POST \
  'https://{mall_id}.cafe24api.com/api/v2/admin/scripttags' \
  -H 'Authorization: Bearer {access_token}' \
  -H 'X-Cafe24-Api-Version: 2025-06-01' \
  -H 'Content-Type: application/json' \
  -d '{
    "shop_no": 1,
    "request": {
      "src": "https://your-app-domain.com/widget.js",
      "display_location": ["PRODUCT_DETAIL", "MAIN"],
      "exclude_path": [],
      "skin_no": []
    }
  }'
```

**파라미터**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `src` | string | O | 스크립트 URL (HTTPS 필수) |
| `display_location` | array | O | 표시 위치 (아래 참고) |
| `exclude_path` | array | X | 제외할 경로 |
| `skin_no` | array | X | 특정 스킨에만 적용 |
| `integrity` | string | X | SRI 해시 (보안 강화) |

**display_location 옵션**:

```javascript
[
  "MAIN",              // 메인 페이지
  "PRODUCT_LIST",      // 상품 목록
  "PRODUCT_DETAIL",    // 상품 상세
  "CART",              // 장바구니
  "ORDER",             // 주문서
  "ORDER_COMPLETE",    // 주문 완료
  "MYSHOP",            // 마이쇼핑
  "BOARD_LIST",        // 게시판 목록
  "BOARD_VIEW",        // 게시판 상세
  "ALL"                // 전체 페이지
]
```

**응답 예시**:

```json
{
  "scripttag": {
    "shop_no": 1,
    "script_no": 123,
    "src": "https://your-app-domain.com/widget.js",
    "display_location": ["PRODUCT_DETAIL", "MAIN"],
    "exclude_path": [],
    "skin_no": [],
    "created_date": "2025-01-15T10:30:00+09:00"
  }
}
```

### 2. ScriptTag 목록 조회

**엔드포인트**: `GET /api/v2/admin/scripttags`

```bash
curl -X GET \
  'https://{mall_id}.cafe24api.com/api/v2/admin/scripttags' \
  -H 'Authorization: Bearer {access_token}' \
  -H 'X-Cafe24-Api-Version: 2025-06-01'
```

### 3. ScriptTag 삭제 (앱 제거 시)

**엔드포인트**: `DELETE /api/v2/admin/scripttags/{script_no}`

```bash
curl -X DELETE \
  'https://{mall_id}.cafe24api.com/api/v2/admin/scripttags/123' \
  -H 'Authorization: Bearer {access_token}' \
  -H 'X-Cafe24-Api-Version: 2025-06-01'
```

## 🚀 구현 예제

### cafe24Client.js

```javascript
class Cafe24Client {
  // ... 기존 코드 ...

  /**
   * ScriptTag 생성
   * @param {Object} scriptData
   * @param {string} scriptData.src - 스크립트 URL
   * @param {Array<string>} scriptData.display_location - 표시 위치
   * @param {Array<string>} scriptData.exclude_path - 제외 경로
   * @param {Array<number>} scriptData.skin_no - 스킨 번호
   * @param {string} scriptData.integrity - SRI 해시
   */
  async createScriptTag(scriptData) {
    return this.request('/scripttags', 'POST', {
      shop_no: 1,
      request: scriptData
    });
  }

  /**
   * ScriptTag 목록 조회
   */
  async getScriptTags() {
    return this.request('/scripttags');
  }

  /**
   * ScriptTag 삭제
   * @param {number} scriptNo - 스크립트 번호
   */
  async deleteScriptTag(scriptNo) {
    return this.request(`/scripttags/${scriptNo}`, 'DELETE');
  }
}
```

### webhook.js (앱 설치)

```javascript
router.post('/install', async (req, res) => {
  try {
    const { mall_id, app_id, shop_no } = req.body;

    console.log('📦 앱 설치 웹훅 수신:', { mall_id, app_id, shop_no });

    // 1. 기본 설정 생성
    const defaultSettings = {
      enableWidget: true,
      showStatistics: true,
      showPhotoGallery: true,
      mainColor: '#667eea',
      photoGalleryCount: 8,
      installed_at: new Date().toISOString()
    };

    database.setSetting(`settings:${mall_id}`, defaultSettings);

    // 2. ✅ ScriptTags API 호출하여 자동 스크립트 삽입
    const cafe24Client = require('../services/cafe24Client');

    const scriptData = {
      src: `${process.env.SCRIPT_BASE_URL}/review-enhancer.js?mall_id=${mall_id}`,
      display_location: ['PRODUCT_DETAIL'],  // 상품 상세 페이지에만 삽입
      exclude_path: [],
      skin_no: []
    };

    // CSS는 별도로 삽입 (선택사항)
    const cssScriptData = {
      src: `${process.env.SCRIPT_BASE_URL}/review-enhancer.css`,
      display_location: ['PRODUCT_DETAIL'],
      exclude_path: [],
      skin_no: []
    };

    const jsResult = await cafe24Client.createScriptTag(scriptData);
    const cssResult = await cafe24Client.createScriptTag(cssScriptData);

    // 3. script_no 저장 (제거 시 필요)
    defaultSettings.script_nos = {
      js: jsResult.scripttag.script_no,
      css: cssResult.scripttag.script_no
    };
    database.setSetting(`settings:${mall_id}`, defaultSettings);

    console.log('✅ 앱 설치 완료 (자동 설치 성공):', mall_id);

    res.json({
      success: true,
      message: '앱이 성공적으로 설치되었습니다.',
      mall_id,
      auto_installation: true
    });

  } catch (error) {
    console.error('❌ 앱 설치 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### webhook.js (앱 제거)

```javascript
router.post('/uninstall', async (req, res) => {
  try {
    const { mall_id, app_id, shop_no } = req.body;

    console.log('🗑️ 앱 제거 웹훅 수신:', { mall_id, app_id, shop_no });

    // 1. 설정에서 script_no 가져오기
    const settings = database.getSetting(`settings:${mall_id}`);

    if (settings && settings.script_nos) {
      const cafe24Client = require('../services/cafe24Client');

      // 2. 스크립트 삭제
      if (settings.script_nos.js) {
        await cafe24Client.deleteScriptTag(settings.script_nos.js);
      }
      if (settings.script_nos.css) {
        await cafe24Client.deleteScriptTag(settings.script_nos.css);
      }
    }

    // 3. 설정 삭제
    database.setSetting(`settings:${mall_id}`, null);

    console.log('✅ 앱 제거 완료 (스크립트 자동 삭제):', mall_id);

    res.json({
      success: true,
      message: '앱이 성공적으로 제거되었습니다.',
      mall_id
    });

  } catch (error) {
    console.error('❌ 앱 제거 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## ⚠️ 카페24 정책 및 주의사항

### ❌ 절대 금지 사항

1. **앱 스크립트 직접 삽입**
   - 관리자 계정으로 디자인관리에 직접 삽입 금지
   - 반드시 ScriptTags API 사용

2. **스크립트 내 외부 스크립트 호출**
   - 연쇄 장애 방지를 위해 외부 스크립트 로딩 금지
   - 모든 코드는 단일 파일에 번들링

3. **쇼핑몰관리자 설정을 통한 삽입**
   - 상세페이지 설명, 게시판, SEO 설정 등에 삽입 금지

4. **스크립트 오버라이트**
   - 쇼핑몰 기본 동작 변수나 함수 강제 변경 금지

### ✅ 권장 사항

1. **HTTPS 필수**: 스크립트 URL은 반드시 HTTPS
2. **CDN 사용**: 빠른 로딩을 위해 CDN 사용 권장
3. **SRI 해시**: 보안 강화를 위해 integrity 값 설정
4. **에러 핸들링**: 스크립트 내부에서 에러 발생 시 쇼핑몰에 영향 없도록 try-catch 사용
5. **성능 최적화**: 불필요한 API 호출 최소화, 캐싱 활용

## 🔍 스크립트 로딩 순서

```
1. 쇼핑몰 기본 HTML 로딩
2. 쇼핑몰 기본 JavaScript 로딩
3. ✅ 앱 스크립트 로딩 (ScriptTags API로 삽입된 것)
4. 사용자 정의 스크립트 로딩
```

**중요**: 앱 스크립트는 **쇼핑몰 기본 스크립트 로딩 후** 실행되므로, DOM이 준비된 상태에서 안전하게 동작합니다.

## 🧪 테스트 방법

### 1. 개발 환경에서 테스트

```javascript
// 로컬 테스트용 스크립트
const testScriptTag = {
  src: 'https://localhost:3000/review-enhancer.js',
  display_location: ['PRODUCT_DETAIL'],
  exclude_path: [],
  skin_no: []
};

// API 호출 테스트
const result = await cafe24Client.createScriptTag(testScriptTag);
console.log('ScriptTag 생성 결과:', result);
```

### 2. 쇼핑몰 화면에서 확인

F12 개발자 도구 → Elements 탭에서 다음과 같은 코드 확인:

```html
<script>
CAFE24.APPSCRIPT_ASSIGN_DATA = CAFE24.APPSCRIPT_ASSIGN_DATA || [
  {
    'src': 'https://your-app-domain.com/review-enhancer.js?vs=20250115120000.1&client_id=...'
  }
];
</script>
```

### 3. 스크립트 로딩 확인

Console 탭에서 로그 확인:

```javascript
console.log('리뷰 앱 스크립트 로드됨');
```

## 📚 추가 리소스

- [카페24 API 문서](https://developers.cafe24.com/docs/ko/api/admin/)
- [카페24 개발자센터](https://developers.cafe24.com/)
- [ScriptTags API 레퍼런스](https://developers.cafe24.com/docs/ko/api/admin/#scripttags)

## 🆘 문제 해결

### Q: ScriptTag 생성이 실패합니다

**A**: 다음을 확인하세요:
1. OAuth scope에 `mall.write_scripttag` 권한이 있는지
2. 스크립트 URL이 HTTPS인지
3. 액세스 토큰이 유효한지
4. API 버전이 올바른지 (2025-06-01 이상 권장)

### Q: 스크립트가 쇼핑몰에 표시되지 않습니다

**A**: 다음을 확인하세요:
1. `display_location`이 현재 페이지에 맞는지
2. 브라우저 캐시를 삭제하고 새로고침
3. F12 개발자 도구에서 스크립트가 로드되었는지 확인
4. Console에서 JavaScript 에러가 없는지 확인

### Q: 앱 제거 후에도 스크립트가 남아있습니다

**A**: 앱 제거 웹훅에서 `deleteScriptTag()` API를 호출했는지 확인하세요.

---

**최종 업데이트**: 2025-01-15
**카페24 API 버전**: 2025-06-01
