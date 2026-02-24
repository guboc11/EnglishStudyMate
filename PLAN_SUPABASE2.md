# PLAN_SUPABASE2 — Backend Supabase 캐시 연동

**전제조건:** SUPABASE1 완료 (expressions + stories 테이블 존재)
**후속 플랜:** 없음

---

## 목적

`POST /api/v1/learning/resolve-and-generate` 응답시간을 5~10초 → <500ms로 개선한다.
Supabase DB에 캐시된 번들이 있으면 Gemini 호출 없이 즉시 반환한다.

---

## 수정/신규 파일 목록

| 파일 | 작업 |
|------|------|
| `Product/apps/backend/lib/supabase.js` | 신규 |
| `Product/apps/backend/routes/learning.js` | 수정 |
| `Product/apps/backend/package.json` | 수정 (`@supabase/supabase-js` 추가) |

---

## 환경변수 확인

`Product/apps/backend/.env`에 아래 두 항목이 있어야 한다:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 함수 명세

### `Product/apps/backend/lib/supabase.js` (신규)

```javascript
// Supabase 클라이언트 초기화 + 조회 함수

/**
 * Supabase 클라이언트 싱글턴 생성
 * 환경변수: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function createSupabaseClient()

/**
 * phrase로 expression + story 한 쌍 조회
 * SELECT expressions.*, stories.*
 * FROM expressions
 * JOIN stories ON stories.expression_id = expressions.id
 * WHERE expressions.phrase = $1
 * ORDER BY RANDOM() LIMIT 1
 *
 * @param {string} phrase - 정규화된 표현 (lowercase trim)
 * @returns {Promise<{ expression: ExpressionRow; story: StoryRow } | null>}
 */
async function findExpressionByPhrase(phrase)

/**
 * expressions 테이블 upsert + stories 테이블 insert
 * conflict 시 expressions는 skip, stories는 항상 insert
 *
 * @param {import('../../types/learning').LearningBundle} bundle
 * @returns {Promise<void>}
 */
async function insertExpressionAndStory(bundle)

module.exports = { createSupabaseClient, findExpressionByPhrase, insertExpressionAndStory };
```

#### Row 타입 정의 (JSDoc 참조용)

```javascript
/**
 * @typedef {Object} ExpressionRow
 * @property {string} id
 * @property {string} phrase
 * @property {string} sense_label_ko
 * @property {string} domain
 * @property {Object} meaning
 * @property {Object} selection_meta
 * @property {string} created_at
 */

/**
 * @typedef {Object} StoryRow
 * @property {string} id
 * @property {string} expression_id
 * @property {string} step1_sentence
 * @property {string} step2_story
 * @property {string} step3_story
 * @property {string|null} topic_tag
 * @property {string|null} mood_tag
 * @property {string} created_at
 */
```

---

### `Product/apps/backend/routes/learning.js` (수정)

**수정 대상:** `POST /api/v1/learning/resolve-and-generate` 핸들러

**수정된 처리 흐름:**

```
1. 입력 정규화: normalizedInput = input.toLowerCase().trim()

2. Supabase 조회: result = await findExpressionByPhrase(normalizedInput)
   ├─ 결과 있음:
   │   └─ 로그: "[Supabase hit] {phrase}"
   │   └─ bundle 조립 후 { status: 'ready', expression, bundle } 즉시 반환
   └─ 결과 없음:
       └─ 기존 Gemini 생성 플로우 실행
           ├─ 생성 성공 → 로그: "[Gemini fallback] {phrase}"
           │   └─ await insertExpressionAndStory(bundle)  // Supabase에 저장
           │   └─ { status: 'ready', expression, bundle } 반환
           └─ needs_selection → 후속 generate-bundle 요청에서 저장

3. needs_selection 케이스 (유저가 sense 선택 후 generate-bundle 호출 시):
   - 생성 완료 후 insertExpressionAndStory(bundle) 호출
```

**DB row → LearningBundle 조립 함수:**

```javascript
/**
 * @param {ExpressionRow} expression
 * @param {StoryRow} story
 * @returns {import('../../types/learning').LearningBundle}
 */
function rowsToBundle(expression, story)
```

---

### `Product/apps/backend/package.json` (수정)

`dependencies`에 추가:
```json
"@supabase/supabase-js": "^2.x"
```

설치 명령:
```bash
cd Product/apps/backend && pnpm add @supabase/supabase-js
```

---

## 검증 방법 (4단계)

1. **번들 업로드 확인**
   - PLAN_CONTENT2 완료 후: Supabase Dashboard → expressions 테이블 행 수 ≥ 1,000

2. **캐시 히트 확인**
   - 백엔드 실행: `cd Product/apps/backend && pnpm start`
   - 기존 표현 검색 ("take off") → 응답시간 < 500ms
   - 서버 로그에 `[Supabase hit] take off` 출력 확인

3. **Gemini 폴백 확인**
   - DB에 없는 표현 검색 → 서버 로그 `[Gemini fallback] {phrase}` 출력
   - 반환 후 Supabase Dashboard에 새 행 추가 확인

4. **재검색 캐시 확인**
   - 3번에서 검색한 표현 재검색 → `[Supabase hit]` 출력, 응답 < 500ms
