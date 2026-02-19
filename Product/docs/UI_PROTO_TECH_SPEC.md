# UI Prototype Technical Spec

## 1. Technical Goal
`Execution/Plans/UI_PROTO_SPEC.md`의 사용자 흐름을 React Native 앱(Expo)에서 구현 가능한 기술 단위로 분해한다. 초기 단계는 파일 기반 mock provider를 사용하고, 동일 인터페이스를 유지한 채 추후 Go 백엔드 + OpenAI API 연동으로 교체한다.

## 2. Architecture Overview
- Presentation Layer: 화면 렌더링, 사용자 입력, 네비게이션
- Orchestration Layer: 학습 세션 상태 제어(예문/복습 흐름)
- Content Provider Layer: 텍스트/삽화/영상/자막 생성 또는 조회

원칙:
- 화면은 데이터 소스 구현 상세(API/파일)를 직접 알지 않는다.
- 계약(함수 시그니처/리턴 타입)을 먼저 고정한다.

### 2.1 Runtime Stack & Provider Phases
- UI 런타임: React Native + Expo.
- 생성/콘텐츠: OpenAI API 키 사용 예정.
- Backend: Go(Phase 3)로 교체 가능 구조; 초기에는 필요 시점까지 생략.
- Provider 단계:
  1) Phase 1: 하드코딩/모킹으로 플로우 완주.
  2) Phase 2: `data/mock/` 파일을 읽는 provider로 교체(동일 인터페이스).
  3) Phase 3: Go API 구현으로 provider를 교체(계약 불변).

## 3. Route Map
0. `AppEntryScreen` (부트스트랩/세션 복구 판단)
1. `SearchScreen`
2. `MeaningSelectScreen` (다의어일 때 의미 선택)
3. `ExampleTextScreen` (예문 1)
4. `ExampleImageScreen` (예문 2)
5. `ExampleVideoScreen` (예문 3+ 반복)
6. `ReviewCountdownScreen`
7. `ReviewStoryScreen` (2~4 페이지 시퀀스)
8. `ReviewEndScreen` (복습 더하기)
9. `PauseSummaryScreen` (중단 요약)

Modal:
- `ExitConfirmModal`
- `ResumePromptModal`

## 4. Core Domain Models
- `RequestContext`
  - `actorId`, `ruleVersion`, `sessionId`

- `SenseOption`
  - `senseId`, `label`, `exampleSentence`

- `SearchResult`
  - `expression`, `normalizedText`, `senses[]`

- `SearchExpression`
  - `id`, `rawText`, `normalizedText`, `createdAt`, `selectedSenseId`

- `ExampleStory`
  - `storyId`, `expression`, `selectedSenseId`, `storyType(text|image|video)`, `sentences[]`, `difficulty`, `source`

- `IllustrationAsset`
  - `prompt`, `imageUrl`, `width`, `height`

- `VideoClip`
  - `clipId`, `sourceType(external|generated)`, `url`, `startSec`, `endSec`

- `SubtitleTrack`
  - `clipId`, `language`, `segments[]`

- `ReviewBatch`
  - `reviewBatchId`, `expression`, `selectedSenseId`, `pages[]`, `targetPageCount`, `delayedRevealStrategy`

- `PauseSession`
  - `expression`
  - `selectedSenseId`
  - `currentStage`
  - `currentPageIndex`
  - `countdownRemainingSec`
  - `contentRef`
  - `updatedAt`

- `PauseContentRef`
  - `example1StoryId`
  - `example2StoryId`
  - `videoClipCursor` (`{ clipId: string; listIndex: number; playbackSec: number; subtitleSegmentIndex: number }`)
  - `reviewBatchId`
  - `reviewPagesSnapshot`

## 5. Service Contracts (Interface First)
- `searchExpression(input: string, ctx: RequestContext) -> Promise<SearchResult>`
- `startLearningSessionFromSearch(input: string, ctx: RequestContext) -> Promise<SearchExpression>`
- `selectSenseForSession(sessionId: string, selectedSenseId: string, ctx: RequestContext) -> Promise<SearchExpression>`
- `generateExampleStory(expression: string, selectedSenseId: string, mode: 'example1' | 'example2', ctx: RequestContext) -> Promise<ExampleStory>`
- `generateIllustration(storyId: string, expression: string, selectedSenseId: string, ctx: RequestContext) -> Promise<IllustrationAsset>`
- `fetchVideoClipsByExpression(expression: string, selectedSenseId: string, ctx: RequestContext) -> Promise<VideoClip[]>`
- `generateVideoClip(expression: string, selectedSenseId: string, ctx: RequestContext) -> Promise<VideoClip>`
- `generateSubtitlesForClip(clip: VideoClip, expression: string, selectedSenseId: string, ctx: RequestContext) -> Promise<SubtitleTrack>`
- `generateReviewBatch(expression: string, selectedSenseId: string, pageCount: number, ctx: RequestContext) -> Promise<ReviewBatch>`
- `savePauseSession(session: PauseSession, ctx: RequestContext) -> Promise<{ revision: string; updatedAt: string }>`
- `loadPauseSession(ctx: RequestContext) -> Promise<PauseSession | null>`
- `clearPauseSession(ctx: RequestContext) -> Promise<void>`
- `validateStoryContent(story: ExampleStory, ruleVersion: string) -> Promise<'PASS' | 'RETRYABLE_FAIL' | 'HARD_FAIL'>`

## 6. UI State Machine
States:
- `bootstrap`
- `idle`
- `searching`
- `sense_select`
- `example_loading`
- `example1_ready`
- `example2_ready`
- `example_video_ready`
- `video_exhausted`
- `review_countdown`
- `review_story`
- `review_end`
- `exit_confirm`
- `pause_summary`
- `resume_prompt`
- `error`

Transitions:
- 앱 진입 -> `bootstrap` -> 저장 세션 검사 -> `resume_prompt` 또는 `idle`
- 다의어 입력 -> `sense_select` -> 선택 완료 -> `example_loading`
- `sense_select`에서 `selectSenseForSession` 성공 MUST -> `example_loading`
- `sense_select`에서 sense 영속화 실패 -> `error` (`SENSE_SELECTION_COMMIT_FAILED`)
- 단일 의미 입력 -> `searching`에서 `selectedSenseId = senses[0].senseId`를 원자 저장 후 `example_loading` 전이(MUST)
- 단일 의미 자동 선택 저장 실패 또는 `selectedSenseId` 누락 시 하드 에러(`error`) 처리(MUST)
- `example_loading` -> `example1_ready` -> `example2_ready` -> `example_video_ready`
- `example_video_ready`(ExampleVideoScreen)에서 `더보기` 반복
- `example_video_ready` + clip 없음 -> `video_exhausted`
- `video_exhausted` -> fallback 성공 시 `example_video_ready`, 실패 시 `error`
- `복습하기` -> `review_countdown` -> `review_story`
- `복습 더하기` -> `review_countdown` (새 batch)
- 글로벌 종료 요청(`error` 포함) -> `exit_confirm`
- `exit_confirm --continue--> previous_state_in_memory` (저장 없음)
- `exit_confirm --save--> pause_summary` (저장 수행)
- `exit_confirm --save_failed--> exit_confirm` + 오류 안내/재시도 CTA
- 앱 재진입 + 저장 세션 존재 -> `resume_prompt`
- `resume_prompt --resume--> state(currentStage)` + stage-to-route 매핑 적용
- `resume_prompt --restart--> clearPauseSession -> idle`
- `error --retry--> previous_retriable_state`
- `error --home--> idle`
- `error --exit--> exit_confirm`

Stage-to-Route Mapping (authoritative):
- `idle` -> `SearchScreen`
- `example1_ready` -> `ExampleTextScreen`
- `example2_ready` -> `ExampleImageScreen`
- `example_video_ready` -> `ExampleVideoScreen`
- `video_exhausted` -> `ExampleVideoScreen` (fallback loading/error UX)
- `review_countdown` -> `ReviewCountdownScreen`
- `review_story` -> `ReviewStoryScreen`
- `review_end` -> `ReviewEndScreen`
- `currentStage` 저장 허용값 MUST:
  - `example1_ready`, `example2_ready`, `example_video_ready`, `video_exhausted`, `review_countdown`, `review_story`, `review_end`
  - 위 집합 외 상태는 저장 금지(`pause_stage_not_persistable`)

## 7. Validation Rules
### Search Input
- 문장 입력 금지
- 길이 제한 MUST: 1~40 chars
- 토큰 제한 MUST: 최대 3개 단어(구문 허용)
- 허용 문자 규칙 MUST: 알파벳/공백/아포스트로피(`'`)만 허용
- 문장 판정 규칙 MUST(프로토타입 휴리스틱):
  - 본 규칙은 문자/길이/토큰 검증 통과 입력에만 적용
  - 토큰 3개 초과면 문장으로 판정
  - `. , ! ? ; :` 포함 시 문장으로 판정
  - `I/you/he/she/they/we` + 동사 기본형 패턴 매치 시 문장 의심으로 판정
  - 문장 판정 시 `INPUT_SENTENCE_NOT_ALLOWED` 반환
- 에러코드 우선순위 MUST(단일 반환):
  - Phase 1: `INPUT_EMPTY` -> `INPUT_TOO_LONG` -> `INPUT_TOO_MANY_TOKENS` -> `INPUT_INVALID_FORMAT`
  - Phase 2: (Phase 1 모두 통과 시) `INPUT_SENTENCE_NOT_ALLOWED`
- 정규화 규칙 MUST:
  - trim
  - 다중 공백 -> 단일 공백
  - 소문자화
  - `'` 보존
- 위반 에러 코드:
  - `INPUT_EMPTY`
  - `INPUT_TOO_LONG`
  - `INPUT_TOO_MANY_TOKENS`
  - `INPUT_SENTENCE_NOT_ALLOWED`
  - `INPUT_INVALID_FORMAT`
  - `SENSE_AUTOBIND_FAILED` (단일 의미 자동 선택 영속화 실패 시)
  - `SENSE_SELECTION_COMMIT_FAILED` (다의어 선택 영속화 실패 시)

### Story Content
- 쉬운 단어 중심 지표 필요(정책 훅)
- 대상 표현+선택 의미가 반드시 반영되도록 생성 검증
- Example 1/2 스토리는 각 3~4문장으로 생성 강제
- 난이도 목표: CEFR A2~B1
- 검증 기준(초안):
  - CEFR 분류 결과가 A2~B1 범위일 것
  - 문장당 최대 토큰 수 18 이하
  - 난이도 기준 미달 시 최대 `MAX_GENERATION_RETRIES` 내 재생성

### Review Strategy
- `delayedRevealStrategy` 플래그로 표현 지연 노출 허용
- 복습 배치 생성 시 페이지 수 범위(2~4) 강제
- 복습 각 페이지는 3~4문장으로 생성 강제
- `복습 더하기` 클릭 시 `generateReviewBatch()` 재호출로 새 콘텐츠 배치 생성
- 기본 페이지 수는 `DEFAULT_REVIEW_PAGE_COUNT = 3`
- 세션당 복습 반복 상한: `MAX_REVIEW_LOOPS_PER_SESSION`

### Review Pagination Rule
- `ReviewStoryScreen`은 내부 페이지 인덱스(`pageIndex`)를 가진다.
- `next` 이벤트로 다음 페이지 이동, 마지막 페이지 도달 시 `review_end` 전이
- 중간 이탈 시 `savePauseSession`에 `currentPageIndex` 저장
- `review_countdown` 중 이탈 시 `countdownRemainingSec` 저장
- 재개 시 `loadPauseSession`으로 해당 인덱스부터 이어서 재생
- `review_story` 마지막 페이지 도달 시 반드시 `review_end`로 전이

## 8. Constants / Quota
- `REVIEW_COUNTDOWN_SECONDS = 10`
- `DEFAULT_REVIEW_PAGE_COUNT = 3`
- `MAX_EXAMPLE_LOOPS_PER_SESSION = 5`
- `MAX_REVIEW_LOOPS_PER_SESSION = 5`
- `MAX_GENERATION_RETRIES = 3`
- `SUBTITLE_MAX_RETRIES = 1`
- `RETRY_BACKOFF_BASE_MS = 1000`
- `REQUEST_TIMEOUT_MS = 12000`
- `MAX_RETRY_ELAPSED_MS = 30000`
- cap 도달 시 동작:
  - `예문 더보기` 비활성화
  - `복습하기` CTA 강조
  - `example_loop_cap_reached` 이벤트 기록

## 9. Error and Fallback
- AI 생성 실패: 재시도 + 사용자 안내
- 영상 검색 0건: 단일 fallback 체인
  - Step 1: 생성 영상 시도
  - Step 2: 생성 영상도 실패 시 에러 상태 + 재시도 CTA
- `video_exhausted` UX:
  - 자동 fallback 진행 로더 표시
  - 수동 재시도 CTA 표시
  - `복습하기` 우회 CTA 표시
- 자막 생성 실패: `SUBTITLE_MAX_RETRIES` 자동 재시도 -> 실패 시 기본 캡션(또는 무자막) + 수동 재시도 CTA

Retry matrix:
- Story generation: max `MAX_GENERATION_RETRIES`, exponential backoff(`RETRY_BACKOFF_BASE_MS`), jitter=full, timeout=`REQUEST_TIMEOUT_MS`
- Illustration generation: max `MAX_GENERATION_RETRIES`, exponential backoff, jitter=full, timeout=`REQUEST_TIMEOUT_MS`
- Video fallback generation: max `MAX_GENERATION_RETRIES`, exponential backoff, jitter=full, timeout=`REQUEST_TIMEOUT_MS`
- Subtitle generation: max `SUBTITLE_MAX_RETRIES`, exponential backoff, jitter=full, timeout=`REQUEST_TIMEOUT_MS`
- Review batch generation: max `MAX_GENERATION_RETRIES`, exponential backoff, jitter=full, timeout=`REQUEST_TIMEOUT_MS`
- 재시도 소진 시 `retry_exhausted` 이벤트 + 에러 UX 노출

## 10. Telemetry Events (Minimum)
- Event Envelope MUST:
  - Common(required): `eventName`, `ts`, `sessionId`, `actorId`, `ruleVersion`, `stage`
  - Sense-bound events only(required): `selectedSenseId`
  - Generation events only(required): `attempt`, `provider`, `errorCode`
- `search_submitted`
- `search_validation_failed`
- `meaning_selected`
- `sense_autobind_failed`
- `example_next_clicked`
- `review_started`
- `review_countdown_completed`
- `review_story_completed`
- `review_repeat_clicked`
- `review_loop_cap_reached`
- `video_source_exhausted`
- `exit_confirm_opened`
- `exit_continue_clicked`
- `exit_save_clicked`
- `session_paused`
- `pause_saved`
- `resume_accepted`
- `resume_declined`
- `resume_restored`
- `resume_restart_selected`
- `resume_failed`
- `resume_stage_mismatch`
- `content_generation_failed`
- `content_generation_succeeded`
- `subtitle_generation_succeeded`
- `review_batch_generated`
- `content_generation_cancelled`
- `retry_clicked`
- `retry_exhausted`
- `video_fallback_used`
- `fallback_failed`
- `subtitle_fallback_used`
- `pause_save_failed`
- `pause_stage_not_persistable_detected`
- `pause_load_failed`
- `pause_cleared`
- `subtitle_sense_mismatch_detected`
- `example_loop_cap_reached`

## 11. Implementation Phases
### Phase 1 (Prototype-Local)
- 하드코딩 + mock provider로 전체 플로우 동작

### Phase 2 (File-backed)
- `Product/data/mock` 기반 provider 분리

### Phase 3 (API-backed)
- OpenAI/외부 영상 소스 연동
- provider 내부 구현 교체 (UI 변경 최소화)

## 12. Non-Functional Constraints
- 초기 목표는 품질 최적화보다 흐름 완주
- 생성 지연 시 로딩 상태/재시도 UX 필수
- 규칙 버전 및 Actor ID 기반 로그 연동 유지

## 13. Mandatory Consistency Rules
- `selectedSenseId`는 단일/다의어 모든 경로에서 필수이며, 예문/영상/복습 생성 API 입력에서 누락되면 호출을 거부한다.
- Pause/Resume 복원은 `currentStage + contentRef + selectedSenseId` 조합으로 결정한다.
- fallback 정책은 단일 체인으로 유지하며, 예문 3+에서 텍스트/삽화 대체를 기본 경로로 허용하지 않는다.
- `currentStage`는 저장 허용 상태 집합 내에서만 영속화한다.
- `reviewBatchId`의 단일 진실원은 `PauseContentRef.reviewBatchId`다.
- video cursor의 단일 진실원은 `PauseContentRef.videoClipCursor`다.
