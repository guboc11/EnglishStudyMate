# PLAN_CONTENT2 — 로컬 번들 → Supabase DB 업로드

**전제조건:** SUPABASE1 완료 + CONTENT1 완료
**후속 플랜:** CONTENT3

---

## 목적

`scripts/output/bundles/*.json` 전체를 Supabase `expressions` + `stories` 테이블에 upsert한다.
idempotent 설계: 중복 실행해도 안전하다.

---

## 생성/수정 파일 목록

| 파일 | 작업 |
|------|------|
| `scripts/upload-bundles.js` | 신규 (일회성 업로드 스크립트) |
| `scripts/lib/supabase.js` | 수정 (upsertBundle 실제 Supabase 연동으로 교체) |

---

## 환경변수 확인

`scripts/.env`에 아래 항목이 있어야 한다:
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 번들 JSON → DB 매핑

로컬 번들 파일 구조:
```json
{
  "id": "expression-slug_8charHash",
  "expression": "a bird's eye view",
  "selectionMeta": {
    "selectedPhrase": "a bird's eye view",
    "selectedSenseLabelKo": "조감도 / 전반적인 시각",
    "selectedDomain": "general"
  },
  "step1": { "sentence": "단문 1개" },
  "step2": { "story": "2문장 스토리", "topicTag": "leadership", "moodTag": "insightful" },
  "step3": { "story": "3~4문장 스토리", "topicTag": "problem solving", "moodTag": "reflective" },
  "meaning": {
    "literalMeaningKo": "...",
    "realUsageKo": "...",
    "etymologyKo": "...",
    "nuanceKo": "...",
    "shortExampleEn": "...",
    "shortExampleKo": "..."
  },
  "savedAt": "2026-02-24T..."
}
```

DB 매핑:
| 번들 필드 | DB 테이블 | 컬럼 |
|-----------|-----------|------|
| `id` | `expressions` | `id` |
| `selectionMeta.selectedPhrase` | `expressions` | `phrase` |
| `selectionMeta.selectedSenseLabelKo` | `expressions` | `sense_label_ko` |
| `selectionMeta.selectedDomain` | `expressions` | `domain` |
| `meaning` | `expressions` | `meaning` (JSONB) |
| `selectionMeta` | `expressions` | `selection_meta` (JSONB) |
| `id` | `stories` | `expression_id` |
| `step1.sentence` | `stories` | `step1_sentence` |
| `step2.story` | `stories` | `step2_story` |
| `step3.story` | `stories` | `step3_story` |
| `step2.topicTag` | `stories` | `topic_tag` |
| `step2.moodTag` | `stories` | `mood_tag` |

---

## 함수 명세

### `scripts/upload-bundles.js` (신규)

```javascript
/**
 * scripts/output/bundles/*.json 전체를 Supabase에 upsert한다.
 * 실행: node scripts/upload-bundles.js
 *
 * 동작:
 * 1. output/bundles/ 디렉토리에서 *.json 파일 목록 수집
 * 2. 파일별 JSON 파싱
 * 3. upsertBundle(bundle) 호출 (scripts/lib/supabase.js)
 * 4. 완료/실패 수 집계 후 출력
 *
 * 출력 예시:
 *   총 2000개 처리
 *   성공: 1998개, 실패: 2개
 */
async function main(): Promise<void>
```

### `scripts/lib/supabase.js` (수정)

현재 상태: 로컬 파일 저장 전용
변경 후: 실제 Supabase upsert 추가

```javascript
/**
 * 번들을 expressions + stories 테이블에 upsert한다.
 * expressions: ON CONFLICT (id) DO NOTHING
 * stories: 항상 INSERT (같은 expression에 스토리 누적 가능)
 *
 * @param {BundleJson} bundle - 로컬 번들 JSON 객체
 * @returns {Promise<{ id: string; path: string }>}
 *   - id: bundle.id
 *   - path: "bundles/{id}.json" (로컬 경로 참조용)
 */
async function upsertBundle(bundle)

/**
 * expression ID로 번들 조회
 * @param {string} id
 * @returns {Promise<BundleJson | null>}
 */
async function getBundle(id)

/**
 * 이미지를 Supabase Storage에 업로드
 * @param {string} bundleId
 * @param {'step2' | 'step3'} step
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<string>}  // Storage path: "images/{bundleId}/{step}.png"
 */
async function uploadImage(bundleId, step, buffer, mimeType)

/**
 * step2/step3 이미지가 없는 번들 목록 조회
 * (Storage에 이미지가 없는 항목)
 * @returns {Promise<BundleJson[]>}
 */
async function listBundlesWithoutImages()
```

---

## 실행 방법

```bash
cd scripts
node upload-bundles.js
```

대략 2,000개 기준 소요 시간: 3~5분 (Supabase 배치 upsert 사용 시 단축 가능)

---

## 검증

1. Supabase Dashboard → Table Editor → `expressions` 테이블
2. 행 수 = `ls scripts/output/bundles/ | wc -l` 값과 일치 확인
3. `stories` 테이블 행 수 ≥ `expressions` 행 수 (1:1 이상)
