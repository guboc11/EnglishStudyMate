# AI World 랜딩 페이지 — 완전 리디자인

## Context

기존 "AI 한국인 친구와 채팅" 컨셉에서 **몰입형 AI 세계관**으로 확장. 사용자는 한국어만 쓰는 AI 세계에 떨어진 **외지인**. 일하고, 친구 사귀고, 서류 처리하고, 시험 보면서 한국어를 자연 습득한다. 게임이 아닌 **웹 앱** — MUD 게임 + 카카오톡 + 싸이월드 느낌의 텍스트/UI 기반.

V1 페이지만 교체. V2/V3는 그대로 유지.

---

## 변경 범위

### 수정 파일
| 파일 | 변경 내용 |
|------|----------|
| `tailwind.config.js` | 커스텀 색상(navy, kakao) + 애니메이션 유틸리티 추가 |
| `index.html` | Noto Sans KR 폰트 추가 |
| `src/index.css` | 커스텀 keyframe 애니메이션 추가 |
| `src/pages/V1Minimal.tsx` | 14개 섹션 조립하는 전체 리라이트 |

### 신규 생성 (components/world/)
| 파일 | 역할 |
|------|------|
| `SectionWrapper.tsx` | 공통 섹션 레이아웃 래퍼 |
| `MockupFrame.tsx` | 폰 디바이스 프레임 |
| `HeroArrival.tsx` | §1 히어로 — 입국 내러티브 |
| `ChatListMockup.tsx` | §2 카톡 채팅 목록 |
| `ChatDetailMockup.tsx` | §3 대화 상세 |
| `WorldOverview.tsx` | §4 세계 개요 + 노드맵 |
| `JobsEconomy.tsx` | §5 알바/경제 카드 |
| `RestaurantSimulation.tsx` | §6 식당 시뮬레이션 4단계 |
| `AdministrativeLife.tsx` | §7 행정 서류 목업 |
| `ProficiencyTest.tsx` | §8 시험 UI 목업 |
| `AIPersonality.tsx` | §9 AI 감정/반응 |
| `ItemsGifts.tsx` | §10 싸이월드 아이템샵 |
| `ProgressionStory.tsx` | §11 Day 1→Level 1 타임라인 |
| `PhoneCallOverlay.tsx` | 전화 수신 UI (§5, §6 공유) |
| `KoreanMenuUI.tsx` | 메뉴판 UI (§6에서 사용) |

기존 `CTAButton.tsx`, `FAQ.tsx`는 재사용 (코드 변경 없음).

---

## 디자인 시스템

**색상**:
- Navy: `#1B3A5C` (주), `#152E49` (진), `#2A5580` (연)
- Kakao Yellow: `#FBBF24`
- 배경: `#FFFFFF`, `#F8FAFC`, `#F1F5F9`
- Accent: Green `#22C55E` (온라인), Red `#EF4444` (안읽음/전화)

**폰트**: Inter + Noto Sans KR

---

## 14개 섹션 상세

### §1 HeroArrival — "입국"
- 풀스크린, 화이트→라이트그레이 그라데이션
- 상단: "입국 심사" 작은 텍스트 + 🇰🇷
- **헤드라인**: "You just arrived in a world where everyone speaks Korean."
- **서브**: "No subtitles. No English menus. No shortcuts. Just you — and an entire world waiting to be understood."
- 중간: 패스포트 스탬프 느낌의 점선 구분자
- 하단: 카톡 알림 목업 (슬라이드업 애니메이션)
  - "김수진 sent you a message"
  - "안녕! 이 동네 처음이지? 도와줄까? ^^"
- CTA: "Enter the World" + "Learn more first"

### §2 ChatListMockup — "채팅 목록"
- **헤딩**: "Your phone is already blowing up."
- 폰 프레임 안 카톡 스타일 목록:
  - 김수진 — "야 밥 먹었어?" (방금, 3개 안읽음, 온라인)
  - 박민호 — "내일 알바 같이 할래?" (오후 2:30, 1개)
  - 이하영 — "ㅋㅋㅋ 진짜?" (오전 11:20)
  - 편의점 사장님 — "오늘 6시까지 와" (어제, 1개)
  - 동사무소 — "서류 준비해서 오세요" (월)
  - ??? — 잠김 상태 (그레이아웃)
- 주석: "Some speak English. Some don't. You'll have to figure it out."

### §3 ChatDetailMockup — "대화 상세"
- **헤딩**: "They text you first. They have lives of their own."
- 김수진과의 대화 목업 (폰 프레임):
  - 수진이 먼저 말 걸고 → 유저 영어 → 수진이 한국어 유도 → 유저 "감사합니다" → 수진 칭찬
- 옆에 주석 콜아웃: "AI texts first", "Gently pushes Korean", "Celebrates your attempts"

### §4 WorldOverview — "세계 지도"
- **네이비 배경**, 흰 텍스트
- **헤딩**: "Welcome to the world."
- **서브**: "You're a foreigner in a Korean-speaking AI world. Your mission: survive, work, make friends, and pass the Korean Proficiency Test."
- SVG 노드맵: 아파트↔편의점↔카페↔식당↔동사무소↔학교↔시험장
- 하단 스탯 3개: 소지금 ₩0 / 한국어 레벨: 없음 / Day 1

### §5 JobsEconomy — "알바"
- **헤딩**: "You need money. Time to work."
- 4개 잡 카드 그리드:
  - 식당 알바 (₩8,500/시간) — "전화 받고, 주문 받고, 서빙하기"
  - 카페 바리스타 (₩9,000/시간) — "음료 주문 듣고 만들기"
  - 배달 (₩건당 3,000) — "주소 읽고 배달하기"
  - 심부름 (₩5,000/건) — "부대찌개 사서 배달하기"
- 하단: 전화 수신 프리뷰 (PhoneCallOverlay)

### §6 RestaurantSimulation — "식당 시뮬레이션"
- **헤딩**: "Your shift at 김치찌개 식당."
- 4단계 플로우 (좌→우 또는 수직):
  1. 전화벨 (PhoneCallOverlay — "손님")
  2. 손님 말 + 응답 녹음 바 목업
  3. 메뉴판 (KoreanMenuUI — 부대찌개 x2 + 김치찌개 x1 선택)
  4. 결과: 성공 ✅ +₩8,500 / 실패 ❌
- 시간 주석: "실제 5분 = 게임 내 1시간"

### §7 AdministrativeLife — "행정"
- 라이트그레이 배경
- **헤딩**: "Even paperwork is in Korean."
- 2개 문서 목업:
  - 외국인등록증 신청서 (관인 SVG, 성명/생년월일/국적/주소 필드)
  - 세금 고지서 (국세청, ₩15,000, 납부기한, 경고문)
- 주석: "You'll learn vocabulary you can't find in any textbook."

### §8 ProficiencyTest — "한국어 능력 시험"
- **헤딩**: "The test that changes everything."
- 폰 프레임 안 시험 UI:
  - 3급, 문제 7/20, 타이머 00:05 (원형 프로그레스 SVG)
  - 질문 + 4지선다 (하나 선택됨)
- 하단: 3개 등급 배지 (3급 브론즈 / 2급 실버 / 1급 골드+글로우)
- 응시료 주석: ₩50,000

### §9 AIPersonality — "감정"
- **네이비 배경**
- **헤딩**: "They're not just chatbots. They have feelings."
- 2개 채팅 목업 나란히:
  - A) 수진 서운해함: "그런 말 하지 마 😔" (기분 인디케이터 변화)
  - B) 민호 퇴장: "나 이제 진짜 간다" → 시스템 메시지 "박민호님이 채팅방을 나갔습니다" → 입력창 비활성
- 주석: "Treat them like real people."

### §10 ItemsGifts — "아이템샵"
- **헤딩**: "Buy gifts. Build friendships."
- 폰 프레임 안 싸이월드 느낌 아이템 그리드 (3x3):
  - 커피 ₩3,000 / 떡볶이 ₩4,500 / 인형 ₩12,000 / 편지 ₩1,000 / 케이크 ₩15,000 / 꽃다발 ₩8,000 / 귀걸이 ₩20,000 / 책 ₩7,000 / ??? 잠김
- 소지금 표시, "선물하기" 버튼
- 옆: 수진 반응 채팅 "헉 커피?! 고마워!! ☕💕"

### §11 ProgressionStory — "여정 타임라인"
- **헤딩**: "From lost to fluent."
- 수직(모바일)/수평(데스크톱) 타임라인 6단계:
  - Day 1: 도착 — 아무것도 모르는 상태
  - Day 7: 첫 알바 — 주문 실수하며 배움
  - Day 30: 주문 성공 — "부대찌개 2인분 주세요"
  - Day 60: 3급 합격
  - Day 120: 한국어로 첫 말다툼
  - Day 180: 1급 합격 — "The real world is next."

### §12 CTA — 네이비 배경
- "Enter the world. Start your journey."
- 두 단계 CTA (Early Access + Waitlist)

### §13 FAQ — 6개 항목
- "Is this a game?" / "What level needed?" / "How does economy work?" / "Can AI leave?" / "How long to Level 1?" / "Mobile available?"

### §14 Final CTA + Footer
- "당신의 한국어 여정이 시작됩니다."

---

## 실행 순서

**Phase 0** — 인프라
1. `tailwind.config.js` 커스텀 색상/애니메이션 확장
2. `index.html` Noto Sans KR 폰트 추가
3. `src/index.css` keyframe 애니메이션 추가

**Phase 1** — 공유 유틸리티 (4개, 병렬 가능)
4. `SectionWrapper.tsx`
5. `MockupFrame.tsx`
6. `PhoneCallOverlay.tsx`
7. `KoreanMenuUI.tsx`

**Phase 2** — 독립 섹션 (9개, 병렬 가능)
8~16. HeroArrival, ChatListMockup, ChatDetailMockup, WorldOverview, AdministrativeLife, ProficiencyTest, AIPersonality, ItemsGifts, ProgressionStory

**Phase 3** — 의존 섹션 (2개)
17. `JobsEconomy.tsx` (PhoneCallOverlay 사용)
18. `RestaurantSimulation.tsx` (PhoneCallOverlay + KoreanMenuUI 사용)

**Phase 4** — 조립
19. `V1Minimal.tsx` 리라이트

---

## 검증

1. `cd landing-pages && pnpm dev`
2. `localhost:5173/` → 14개 섹션 모두 렌더링 확인
3. `localhost:5173/v2`, `/v3` → 기존 페이지 깨지지 않음 확인
4. `npx tsc --noEmit` → 타입 에러 없음
5. DevTools 375px 모바일 반응형 확인
6. 각 섹션 목업이 시각적으로 컨셉을 전달하는지 확인
