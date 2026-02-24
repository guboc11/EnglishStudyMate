# EnglishStudyMate — PLAN.md

> 구현 계획, 타입 명세, API 계약, 로드맵의 단일 진실원(Single Source of Truth).
> 코드 작성 전 이 문서에 파일명·함수명·파라미터 타입·리턴 타입을 먼저 정의할 것.

---

## 1. 현재 구현 상태

### Mobile 화면

| 화면 | 파일 | 상태 |
|------|------|------|
| HomeScreen | `screens/HomeScreen.tsx` | ✅ 구현됨 |
| MeaningGateScreen | `screens/MeaningGateScreen.tsx` | ✅ 구현됨 |
| ExampleFlowScreen | `screens/ExampleFlowScreen.tsx` | ✅ 구현됨 (step1/2/3) |
| MeaningScreen | `screens/MeaningScreen.tsx` | ✅ 구현됨 |
| ReviewSessionScreen | `screens/ReviewSessionScreen.tsx` | ✅ 구현됨 |
| ExampleVideoScreen | — | ❌ 미구현 |
| ReviewCountdownScreen | — | ❌ 미구현 |
| ReviewEndScreen | — | ❌ 미구현 |
| PauseSummaryScreen | — | ❌ 미구현 |

### Backend API

| 엔드포인트 | 파일 | 상태 |
|-----------|------|------|
| POST /api/v1/learning/resolve-and-generate | `routes/learning.js` | ✅ (실시간 Gemini, 5~10초) |
| POST /api/v1/learning/generate-bundle | `routes/learning.js` | ✅ |
| POST /api/v1/media/image | `routes/media.js` | ✅ |
| POST /api/v1/media/video/jobs | `routes/media.js` | ✅ |
| GET /api/v1/media/video/jobs/:jobId | `routes/media.js` | ✅ |
| GET /api/v1/media/video/jobs/:jobId/stream | `routes/media.js` | ✅ |
| Supabase 캐시 조회 | — | ❌ 미구현 |

### 콘텐츠 파이프라인

| 항목 | 수치 |
|------|------|
| 전체 표현 수 | 2,000개 (tasks.json) |
| 번들 생성 완료 | 1,129개 (56.5%) |
| 생성 대기 | 871개 (43.5%) |
| Supabase 업로드 | 0개 (미업로드) |

---

## 2. 우선순위 로드맵

| 순위 | 작업 | 이유 |
|------|------|------|
| **P1** | Supabase 연동 | 현재 검색 5~10초 → 즉각 응답으로 개선 |
| **P2** | 콘텐츠 파이프라인 완성 | 나머지 871개 번들 생성 + 업로드 |
| **P3** | ExampleVideoScreen 구현 | 스펙 필수 기능, 백엔드 API 이미 존재 |
| **P4** | Review 플로우 완성 | ReviewCountdown/End/Pause 화면 |

---

## 3. 타입 정의 (현재 구현 기준)

### Mobile Types

**`types/learning.ts`**
```typescript
type LearningPageKey = 'step1' | 'step2' | 'step3';

interface ExpressionMeaning {
  literalMeaningKo: string;
  realUsageKo: string;
  etymologyKo: string;
  nuanceKo: string;
  shortExampleEn: string;
  shortExampleKo: string;
}

interface LearningBundle {
  expression: string;
  step1: { sentence: string };
  step2: { story: string; imageUrl?: string };
  step3: { story: string; imageUrl?: string; videoUrl?: string };
  meaning: ExpressionMeaning;
  selectionMeta: {
    selectedPhrase: string;
    selectedSenseLabelKo: string;
    selectedDomain: DomainTag;
  };
}
```

**`types/selection.ts`**
```typescript
type DomainTag = 'general' | 'tech' | 'art' | 'business' | 'science' | 'daily';

interface SenseCandidate {
  id: string;
  phrase: string;
  senseLabelKo: string;
  shortHintKo: string;
  domains: DomainTag[];
}

type ExpressionResolution =
  | { status: 'invalid'; reasonKo: string; retryHintKo: string }
  | { status: 'valid'; normalizedInput: string; candidates: SenseCandidate[]; autoResolvedCandidateId?: string };

interface SelectedMeaning {
  phrase: string;
  senseId: string;
  senseLabelKo: string;
  domain: DomainTag;
}

type ResolveAndGenerateResult =
  | { status: 'invalid'; reasonKo: string; retryHintKo: string }
  | { status: 'needs_selection'; normalizedInput: string; candidates: SenseCandidate[] }
  | { status: 'ready'; expression: string; bundle: LearningBundle };
```

**`types/vocabularyProfile.ts`**
```typescript
type FamiliarityLevel = 'known' | 'fuzzy' | 'unknown';

interface VocabularyEntry {
  expression: string;
  familiarity: FamiliarityLevel | null;  // null = 검색했지만 아직 평가 안 함
  searchedAt: string;   // ISO string
  lastUpdatedAt: string; // ISO string
  reviewStory: string;   // bundle.step3.story
  meaningKo: string;     // bundle.meaning.realUsageKo
}

type VocabularyProfile = Record<string, VocabularyEntry>;
```

**`types/image.ts`**
```typescript
type ImagePageKey = 'step2' | 'step3';

interface GeneratedImageState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  uri?: string;
  error?: string;
}
```

### Navigation Types

**`App.tsx`**
```typescript
type RootStackParamList = {
  Home: undefined;
  MeaningGate: { rawInput: string; initialResult?: ResolveAndGenerateResult };
  ExampleFlow: { expression: string; bundle: LearningBundle };
  Meaning: { expression: string; bundle: LearningBundle };
  ReviewSession: undefined;
};
```

---

## 4. Mobile 서비스 함수 목록

**`services/apiClient.ts`**
```typescript
async function apiPost<T>(path: string, body: unknown): Promise<T>
async function apiGet<T>(path: string): Promise<T>
function apiUrl(path: string): string
```

**`services/gemini.ts`**
```typescript
type GenerateBundleParams = {
  expression: string;
  phrase: string;
  senseLabelKo: string;
  domain: DomainTag;
};

async function resolveAndGenerateLearning(
  params: { input: string }
): Promise<ResolveAndGenerateResult>

async function generateLearningBundle(
  params: GenerateBundleParams
): Promise<LearningBundle>

function buildFallbackLearningBundle(
  params: GenerateBundleParams
): LearningBundle
```

**`services/geminiImage.ts`**
```typescript
async function generateCartoonImage(params: {
  expression: string;
  story: string;
  pageKey: ImagePageKey;
}): Promise<string>  // base64 data URI 반환
```

**`services/vocabularyProfile.ts`**
```typescript
async function getVocabularyProfile(): Promise<VocabularyProfile>
async function addExpressionToProfile(expression: string, bundle: LearningBundle): Promise<void>
async function setFamiliarity(expression: string, level: FamiliarityLevel): Promise<void>
async function getExpressionsForReview(limit: number): Promise<VocabularyEntry[]>
// 우선순위: fuzzy > unknown > unrated(null) > known
// localStorage key: 'english_study_mate_vocab_profile_v1'
```

**`services/searchHistory.ts`**
```typescript
async function getSearchHistory(): Promise<string[]>
async function addSearchHistory(expression: string): Promise<void>
// localStorage key: 'english_study_mate_search_history_v1', max 100개, 중복 제거
```

---

## 5. Backend API 계약

### POST /api/v1/learning/resolve-and-generate

**Request:** `{ input: string }`

**Response:**
```typescript
| { status: 'invalid'; reasonKo: string; retryHintKo: string }
| { status: 'needs_selection'; normalizedInput: string; candidates: SenseCandidate[] }
| { status: 'ready'; expression: string; bundle: LearningBundle }
```

### POST /api/v1/learning/generate-bundle

**Request:** `{ expression: string; phrase: string; senseLabelKo: string; domain: DomainTag }`

**Response:** `LearningBundle`

### POST /api/v1/media/image

**Request:** `{ expression: string; story: string; pageKey: 'step2' | 'step3' }`

**Response:** `{ uri: string }`

### POST /api/v1/media/video/jobs

**Request:** `{ expression: string; story: string }`

**Response (202):** `{ jobId: string; status: 'processing' }`

### GET /api/v1/media/video/jobs/:jobId

**Response:** `{ jobId: string; status: 'processing' | 'ready' | 'error'; message: string | null }`

### GET /api/v1/media/video/jobs/:jobId/stream

**Response:** video/mp4 스트림

---

## 6. 번들 JSON 구조 (로컬 파일 기준)

```json
{
  "id": "expression-slug_8charHash",
  "expression": "a bird's eye view",
  "selectionMeta": {
    "selectedPhrase": "a bird's eye view",
    "selectedSenseLabelKo": "조감도 / 전반적인 시각",
    "selectedDomain": "general"
  },
  "step1": {
    "sentence": "단문 1개"
  },
  "step2": {
    "story": "2문장 스토리",
    "topicTag": "leadership",
    "moodTag": "insightful"
  },
  "step3": {
    "story": "3~4문장 심화 스토리",
    "topicTag": "problem solving",
    "moodTag": "reflective"
  },
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

---

## 7. P1 — Supabase 연동 상세 명세

### 목적
검색 시 Gemini 실시간 호출(5~10초) → Supabase DB 조회(즉각 응답)로 개선.
같은 표현에 스토리를 N개 추가할 수 있는 확장 구조 확보.

### DB 스키마

**파일:** `supabase/migrations/20260224000000_create_expressions_and_stories.sql`

```sql
CREATE TABLE expressions (
  id          TEXT PRIMARY KEY,
  phrase      TEXT NOT NULL,
  sense_label_ko TEXT NOT NULL,
  domain      TEXT NOT NULL DEFAULT 'general',
  meaning     JSONB NOT NULL,
  selection_meta JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id TEXT NOT NULL REFERENCES expressions(id) ON DELETE CASCADE,
  step1_sentence TEXT NOT NULL,
  step2_story   TEXT NOT NULL,
  step3_story   TEXT NOT NULL,
  topic_tag     TEXT,
  mood_tag      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expressions_phrase ON expressions(phrase);
CREATE INDEX idx_stories_expression_id ON stories(expression_id);
```

### 수정/신규 파일 목록

| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260224000000_create_expressions_and_stories.sql` | 신규 |
| `scripts/upload-bundles.js` | 신규 (일회성 업로드) |
| `scripts/lib/supabase.js` | 수정 (로컬 파일 저장 → Supabase upsert) |
| `Product/apps/backend/lib/supabase.js` | 신규 (클라이언트 + 조회 함수) |
| `Product/apps/backend/routes/learning.js` | 수정 (Supabase 조회 우선 로직 추가) |
| `Product/apps/backend/package.json` | 수정 (`@supabase/supabase-js` 추가) |

### 함수 명세

**`scripts/upload-bundles.js`** (일회성 실행 스크립트)
```javascript
// scripts/output/bundles/*.json 전부 읽어 Supabase에 upsert
// conflict 시 skip (idempotent)
// 환경변수: scripts/.env의 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

async function main(): Promise<void>
// 실행: node scripts/upload-bundles.js
```

**`scripts/lib/supabase.js`** (수정)
```javascript
// 현재: 로컬 파일 저장
// 변경: 실제 Supabase upsert

async function upsertBundle(bundle: BundleJson): Promise<{ id: string; path: string }>
async function getBundle(id: string): Promise<BundleJson | null>
async function uploadImage(
  bundleId: string,
  step: 'step2' | 'step3',
  buffer: Buffer,
  mimeType: string
): Promise<string>  // Supabase Storage path 반환
async function listBundlesWithoutImages(): Promise<BundleJson[]>
```

**`Product/apps/backend/lib/supabase.js`** (신규)
```javascript
// Supabase 클라이언트 초기화 + 조회 함수

function createSupabaseClient(): SupabaseClient
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 환경변수 사용

async function findExpressionByPhrase(
  phrase: string
): Promise<{ expression: ExpressionRow; story: StoryRow } | null>
// SELECT * FROM expressions WHERE phrase = $1
// JOIN stories WHERE expression_id = $1 ORDER BY RANDOM() LIMIT 1

async function insertExpressionAndStory(
  bundle: LearningBundle
): Promise<void>
// expressions 테이블 insert + stories 테이블 insert
// conflict 시 upsert (idempotent)
```

**`Product/apps/backend/routes/learning.js`** (수정 - resolve-and-generate 로직)
```javascript
// 수정된 흐름:
// 1. 입력 정규화 (lowercase trim)
// 2. Supabase 조회: findExpressionByPhrase(normalizedInput)
//    - 결과 있음 → { status: 'ready', bundle } 즉시 반환 (Gemini 호출 없음)
//    - 결과 없음 → 기존 Gemini 생성 플로우
//      - 생성 후 insertExpressionAndStory(bundle) 로 Supabase에 저장
// 3. needs_selection 케이스:
//    - 유저가 sense 선택 후 → 해당 expression_id로 story 조회
//    - 없으면 Gemini 생성 후 저장
```

### 검증 방법
1. `node scripts/upload-bundles.js` → Supabase에 1,129개 업로드 확인 (Supabase Dashboard)
2. 백엔드 실행 후 기존 표현 검색 ("take off") → 응답시간 < 500ms, 서버 로그 "Supabase hit"
3. 없는 표현 검색 → Gemini 생성 후 반환 + 서버 로그 "Gemini fallback" + Supabase에 저장 확인
4. 같은 표현 재검색 → Supabase hit 확인

### 전제 조건
- Supabase 프로젝트 URL + Service Role Key → `scripts/.env` 및 `Product/apps/backend/.env` 설정
- Supabase 대시보드 또는 CLI에서 migration SQL 직접 실행

---

## 8. P2 — 콘텐츠 파이프라인 완성

### 목표
- 나머지 871개 표현 번들 생성 (auto-batch.js 활용)
- 생성된 번들 Supabase 업로드 (P1 완료 후)
- 이미지 생성 및 Supabase Storage 업로드

### 실행 방법
```bash
# 야간 자동 배치 (백그라운드 데몬)
node scripts/auto-batch.js [max_count]

# 이미지 생성
node scripts/generate-images-batch.js

# 업로드
node scripts/upload-bundles.js
```

---

## 9. P3 — ExampleVideoScreen (미구현)

### 목적
스펙(`UI_PROTO_SPEC.md`) 기준 예문 3단계가 영상+자막이어야 함.
백엔드 video API는 이미 구현 완료.

### 구현 대상
- `screens/ExampleVideoScreen.tsx` 신규
- Navigation 추가: `ExampleFlow` 내 또는 별도 스택

### 명세 상태
**미완성** — 상세 명세 작성 필요:
- 화면 파라미터 타입
- 비디오 폴링 로직 (GET /video/jobs/:jobId)
- 영상 재생 컴포넌트 선택
- fallback UX (video_exhausted 상태)

→ P2 완료 후 이 섹션에 상세 명세 작성 후 구현

---

## 10. P4 — Review 플로우 완성 (미구현)

### 목적
`UI_PROTO_TECH_SPEC.md` 기준 완전한 복습 플로우 구현.

### 구현 대상
- `screens/ReviewCountdownScreen.tsx` — 10초 카운트다운
- `screens/ReviewEndScreen.tsx` — 복습 완료 + "복습 더하기" CTA
- `screens/PauseSummaryScreen.tsx` — 세션 저장 요약
- Session pause/resume 로직 (`services/pauseSession.ts`)

### 명세 상태
**미완성** — P3 완료 후 이 섹션에 상세 명세 작성 후 구현.

주요 상수 (`UI_PROTO_TECH_SPEC.md` 기준):
```typescript
const REVIEW_COUNTDOWN_SECONDS = 10;
const DEFAULT_REVIEW_PAGE_COUNT = 3;
const MAX_EXAMPLE_LOOPS_PER_SESSION = 5;
const MAX_REVIEW_LOOPS_PER_SESSION = 5;
const MAX_GENERATION_RETRIES = 3;
```

---

## 11. Backend 주요 유틸리티 (참조)

**`src/lib/validateBundle.js`**
```javascript
function validateLearningBundle(bundle: LearningBundle): {
  valid: boolean;
  reason?: string;
}
// step1: 1문장, step2: 2문장, step3: 3~4문장
// step2/step3 Jaccard 유사도 ≤ 0.62
// 모든 meaning 필드 필수
```

**`src/lib/diversity.js`**
```javascript
function buildDiversitySlots(): {
  step1: { topic: string; mood: string; setting: string };
  step2: { topic: string; mood: string; setting: string };
  step3: { topic: string; mood: string; setting: string };
}
```

**`src/lib/jobs.js`** (in-memory 비디오 Job 큐)
```javascript
interface Job {
  id: string;
  status: 'processing' | 'ready' | 'error';
  videoUri?: string;
  message?: string;
}

function createJob(): { id: string }
function getJob(jobId: string): Job | null
function updateJob(jobId: string, updates: Partial<Job>): void
```
