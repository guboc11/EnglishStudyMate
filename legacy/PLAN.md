# EnglishStudyMate — PLAN.md (Index)

> 서브 플랜 목록 및 의존성 다이어그램.
> 타입 정의·API 계약·번들 JSON 구조·함수 명세는 각 서브 플랜 내 포함.

---

## 의존성 다이어그램

```
┌─────────────┐      ┌─────────────┐
│  SUPABASE1  │      │  CONTENT1   │  ← 병렬 시작 가능
└──┬───────┬──┘      └──────┬──────┘
   │       │                 │
   ▼       └────────┬────────┘
┌──────────┐        ▼
│SUPABASE2 │  ┌──────────────┐
└──────────┘  │   CONTENT2   │
              └──────┬───────┘
                     ▼
              ┌──────────────┐
              │   CONTENT3   │
              └──────────────┘

┌─────────────┐      ┌──────────────────────┐
│   REVIEW1   │      │        VIDEO1        │  ← 독립 (명세 완성 후)
└──────┬──────┘      └──────────────────────┘
       ▼
┌─────────────┐
│   REVIEW2   │
└─────────────┘
```

---

## 서브 플랜 목록

| 파일 | 내용 | 전제조건 | 상태 |
|------|------|----------|------|
| `PLAN_SUPABASE1.md` | DB 스키마 migration (expressions + stories 테이블) | 없음 | ⬜ 미착수 |
| `PLAN_SUPABASE2.md` | Backend Supabase 캐시 연동 (resolve-and-generate) | SUPABASE1 | ⬜ 미착수 |
| `PLAN_CONTENT1.md` | 나머지 번들 생성 완료 (auto-batch 병렬 실행) | 없음 | ⬜ 미착수 |
| `PLAN_CONTENT2.md` | 로컬 번들 → Supabase DB upsert | SUPABASE1 + CONTENT1 | ⬜ 미착수 |
| `PLAN_CONTENT3.md` | 이미지 생성 + Supabase Storage 업로드 | SUPABASE1 + CONTENT1 | ⬜ 미착수 |
| `PLAN_UI1.md` | 크림 테마 적용 + step 인디케이터 + 불필요 파일 삭제 | 없음 | ⬜ 미착수 |
| `PLAN_VIDEO1.md` | ExampleVideoScreen (명세 미완성, CONTENT3 후 착수) | CONTENT3 | 🔲 명세 필요 |
| `PLAN_REVIEW1.md` | ReviewCountdownScreen (3초 카운트다운) | 없음 | ⬜ 미착수 |
| `PLAN_REVIEW2.md` | ReviewEndScreen + familiarity 일괄 평가 + ReviewSession 수정 | REVIEW1 | ⬜ 미착수 |

---

## 현재 구현 상태 요약

### Mobile 화면

| 화면 | 파일 | 상태 |
|------|------|------|
| HomeScreen | `screens/HomeScreen.tsx` | ✅ 구현됨 |
| MeaningGateScreen | `screens/MeaningGateScreen.tsx` | ✅ 구현됨 |
| ExampleFlowScreen | `screens/ExampleFlowScreen.tsx` | ✅ 구현됨 |
| MeaningScreen | `screens/MeaningScreen.tsx` | ✅ 구현됨 |
| ReviewSessionScreen | `screens/ReviewSessionScreen.tsx` | ✅ 구현됨 |
| ExampleVideoScreen | — | ❌ 미구현 → PLAN_VIDEO1.md (CONTENT3 후) |
| ReviewCountdownScreen | — | ❌ 미구현 → PLAN_REVIEW1.md |
| ReviewEndScreen | — | ❌ 미구현 → PLAN_REVIEW2.md |
| SearchHistoryScreen | `screens/SearchHistoryScreen.tsx` | 🗑 삭제 예정 → PLAN_UI1.md |
| ReviewFlowScreen | `screens/ReviewFlowScreen.tsx` | 🗑 삭제 예정 → PLAN_UI1.md |

### Backend API

| 엔드포인트 | 파일 | 상태 |
|-----------|------|------|
| POST /api/v1/learning/resolve-and-generate | `routes/learning.js` | ✅ (실시간 Gemini, 5~10초) |
| POST /api/v1/learning/generate-bundle | `routes/learning.js` | ✅ |
| POST /api/v1/media/image | `routes/media.js` | ✅ |
| POST /api/v1/media/video/jobs | `routes/media.js` | ✅ |
| GET /api/v1/media/video/jobs/:jobId | `routes/media.js` | ✅ |
| GET /api/v1/media/video/jobs/:jobId/stream | `routes/media.js` | ✅ |
| Supabase 캐시 조회 | — | ❌ 미구현 → PLAN_SUPABASE2.md |

### 콘텐츠 파이프라인

| 항목 | 수치 |
|------|------|
| 전체 표현 수 | 2,000개 (tasks.json) |
| 번들 생성 완료 | ~1,137개 |
| 생성 대기 | ~863개 |
| Supabase 업로드 | 0개 → PLAN_CONTENT2.md |

---

## 우선순위 로드맵

| 순위 | 플랜 | 이유 |
|------|------|------|
| **P1** | SUPABASE1 → SUPABASE2 | 검색 응답 5~10초 → <500ms |
| **P1** | UI1 | 테마 적용 + 불필요 파일 정리 (독립) |
| **P2** | CONTENT1 → CONTENT2 → CONTENT3 | 콘텐츠 완성 + Storage 업로드 |
| **P3** | REVIEW1 → REVIEW2 | 복습 플로우 완성 |
| **P4** | VIDEO1 (CONTENT3 완료 후 명세 확정) | 스펙 기능, 의존성 높음 |
