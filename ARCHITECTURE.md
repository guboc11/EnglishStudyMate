# AI World — 기술 구조 (Architecture)

> 랜딩페이지 기획: [MAIN_PLAN.md](./MAIN_PLAN.md) | 프로젝트 비전: [CLAUDE.md](./CLAUDE.md) | 개발 규칙: [TECH_RULES.md](./TECH_RULES.md)

---

## 확정 기술 스택

| 항목 | 결정 |
|------|------|
| 클라이언트 | React Native (Expo) |
| 백엔드 | Node.js — 단일 서버로 시작 |
| DB | Supabase (PostgreSQL + Auth + Realtime) |
| 알림 | Expo Push Notifications |
| AI | Anthropic API (Claude) — 채팅 단계에서 연결 |
| 플래시카드 콘텐츠 | Supabase DB 저장 — 초기엔 JSON으로 시딩, 이후 DB로 관리 |
| **MVP 1순위** | **플래시카드 + SRS 복습 시스템** |

---

## 전체 구조

```
┌─────────────────────────────────────┐
│  [앱] React Native (Expo)           │
│       채팅 / 플래시카드 / 알바 / 시험  │
└────────────┬────────────────────────┘
             │ HTTP REST / WebSocket
┌────────────▼────────────────────────┐
│  [서버] Node.js (단일 서버)          │
│  ├── study/    ← MVP 시작점          │
│  │   플래시카드 콘텐츠 + SRS 알고리즘  │
│  ├── chat/     ← 2단계               │
│  │   AI 페르소나 + Claude API         │
│  ├── world/    ← 3단계               │
│  │   알바·행정·경제 시나리오           │
│  └── scheduler/ ← 알림·지연응답      │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│  [Supabase]                         │
│  ├── users / profiles               │
│  ├── cards (단어·표현 DB)            │
│  ├── review_logs (SRS 상태)         │
│  ├── conversations (채팅 이력)       │
│  └── world_state (관계·경제)         │
└─────────────────────────────────────┘
```

---

## 개발 단계

### 1단계 — 기반 세팅
- Expo 앱 초기 세팅 (네비게이션, 인증 화면)
- Node.js 서버 + Supabase 연결
- 인증 (Supabase Auth — 이메일/소셜)

### 2단계 — MVP: 플래시카드 + SRS
- 단어·표현 콘텐츠 DB 설계 및 시딩
- SRS 알고리즘 (간격 복습 로직)
- 플래시카드 화면 (카드 넘기기, 정답/오답)
- 복습 알림 — Expo Push

### 3단계 — AI 채팅
- 페르소나 설계 (지식 그래프, 감정 상태)
- Claude API 연결 + 응답 지연 큐
- 채팅 UI (카카오 스타일)

### 4단계 — 세계 시나리오
- 알바 시뮬레이션 (식당·카페·배달)
- 행정 이벤트
- 경제 시스템 (₩)

### 5단계 — 시험
- IBIK 시험 UI + 채점
- 등급 배지 시스템

---

## 미결 결정 사항

다음 단계 진입 전 운영자와 확정 필요:

- **SRS 알고리즘**: SM-2 같은 기존 알고리즘 사용 vs 단순 자체 설계
- **레포 구조**: 모노레포 vs 앱·서버 분리 레포
- **2단계 진입 시점**: MVP 완성도 기준 정의
