# Design Docs — UX Flow & Storyboard

EnglishStudyMate AI World의 4개 콘텐츠 영역에 대한 UX 플로우 + 스토리보드 문서.

---

## 문서 구조

| 영역 | flow.md | storyboard.md |
|------|---------|---------------|
| [채팅](./chat/flow.md) | AI 페르소나와의 채팅 유저 여정 | [화면별 레이아웃](./chat/storyboard.md) |
| [작업(일)](./work/flow.md) | 직장·행정 미션 수행 유저 여정 | [화면별 레이아웃](./work/storyboard.md) |
| [강의](./lecture/flow.md) | 한국어 강의 수강 유저 여정 | [화면별 레이아웃](./lecture/storyboard.md) |
| [플래시카드](./flashcard/flow.md) | 단어 암기 복습 유저 여정 | [화면별 레이아웃](./flashcard/storyboard.md) |

---

## 문서 설명

- **flow.md** — 유저가 어떤 경로로 화면을 이동하는지 단계별 플로우차트 (텍스트 다이어그램)
- **storyboard.md** — 화면별 레이아웃 요소·인터랙션·상태 변화 설명 (와이어프레임 텍스트)

---

## 프로토타입 연결

각 문서 기반으로 구현된 React 프로토타입:

```
landing-pages/src/pages/prototypes/
├── ChatPrototype.tsx      → /prototype/chat
├── WorkPrototype.tsx      → /prototype/work
├── LecturePrototype.tsx   → /prototype/lecture
└── FlashcardPrototype.tsx → /prototype/flashcard
```
