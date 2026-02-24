# PLAN_VIDEO1 — ExampleVideoScreen (플레이스홀더)

**전제조건:** CONTENT3 완료 (이미지 파이프라인 완성 후 착수)
**후속 플랜:** 없음

---

## 우선순위

**P3 — CONTENT 완료 후 착수.** 이미지 파이프라인(CONTENT3)이 안정화된 후 이 화면을 구현한다.
지금은 명세만 정리해두고 코드 작성하지 않는다.

---

## 목적

`ExampleFlowScreen`의 step3 이후 단계로 표시되는 영상+자막 화면 구현.
백엔드 video API (`POST /api/v1/media/video/jobs`, `GET /api/v1/media/video/jobs/:jobId`)는 이미 구현 완료.

---

## ⚠️ 상태: 명세 미완성

아래 항목들의 명세를 확정한 후에만 코드 작성 가능하다.
CONTENT3 완료 후 이 섹션을 채울 것.

---

## 미결 명세 항목

### 1. 화면 파라미터 타입

```typescript
// 미확정 — 아래 중 하나로 결정 필요
type ExampleVideoScreenParams =
  | { expression: string; bundle: LearningBundle }           // option A: bundle 전체 전달
  | { expression: string; story: string; jobId?: string };  // option B: jobId 포함
```

**결정 필요:** Navigation에서 어떤 파라미터를 전달할 것인가?

### 2. 비디오 폴링 로직

```typescript
// 미확정
// - 폴링 간격: ? ms (예: 2000ms)
// - 최대 대기 시간: ? ms (예: 60000ms = 1분)
// - GET /api/v1/media/video/jobs/:jobId → status: 'processing' | 'ready' | 'error'
// - ready 시: GET /api/v1/media/video/jobs/:jobId/stream 재생
```

**결정 필요:**
- 폴링 간격
- 타임아웃 시간
- 타임아웃 시 fallback UX

### 3. 영상 재생 컴포넌트

**미확정 — 아래 중 선택 필요:**
- `expo-av` (Video 컴포넌트) — 검증된 방식, API 안정적
- `expo-video` — 신규 API, Expo SDK 50+ 지원

### 4. Fallback UX

```typescript
// video_error | video_timeout 시 어떤 화면을 보여줄 것인가?
// option A: "영상 준비 중" 메시지 + 재시도 버튼
// option B: step3 스토리 텍스트로 대체 표시
// option C: 화면 건너뛰기 (자동으로 다음 단계로)
```

### 5. Navigation 진입점

```typescript
// 미확정
// option A: ExampleFlowScreen 내에서 step3 완료 후 자동 전환
// option B: ExampleFlowScreen에 "영상 보기" 버튼 추가
// option C: 독립 스택 (별도 Navigator)
```

**결정 필요:** RootStackParamList에 ExampleVideo 추가 여부 및 형태

---

## 완료 후 추가할 내용 (명세 확정 시)

- `screens/ExampleVideoScreen.tsx` 파일 명세
- Navigation 타입 업데이트 (`App.tsx` `RootStackParamList`)
- 상태 관리 (polling interval, video URI, error state) 타입

---

## 참조

- Backend API 계약: `PLAN_SUPABASE2.md` §Backend API 계약 또는 원본 `PLAN.md` 섹션 5
- 기존 영상 엔드포인트:
  - `POST /api/v1/media/video/jobs` → `{ jobId: string; status: 'processing' }`
  - `GET /api/v1/media/video/jobs/:jobId` → `{ jobId, status, message }`
  - `GET /api/v1/media/video/jobs/:jobId/stream` → `video/mp4`
