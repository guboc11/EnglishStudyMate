# PLAN_REVIEW1 — ReviewCountdownScreen

**전제조건:** 없음 (독립 실행 가능)
**후속 플랜:** REVIEW2

---

## 목적

복습 세션 시작 전 3초 카운트다운을 보여주는 화면을 구현한다.
`ReviewSessionScreen` 진입 전에 사용자에게 짧은 준비 시간을 제공한다.

---

## 신규 파일 목록

| 파일 | 작업 |
|------|------|
| `Product/apps/mobile/screens/ReviewCountdownScreen.tsx` | 신규 |

---

## 상수

```typescript
const REVIEW_COUNTDOWN_SECONDS = 3;  // 10초 → 3초로 단순화
```

---

## 화면 파라미터 타입

```typescript
// RootStackParamList에 추가
type RootStackParamList = {
  // ... 기존 항목 유지
  ReviewCountdown: undefined;  // 파라미터 없음
};
```

---

## 컴포넌트 명세

**파일:** `Product/apps/mobile/screens/ReviewCountdownScreen.tsx`

```typescript
/**
 * 복습 시작 전 3초 카운트다운 화면.
 * 카운트다운 종료 → ReviewSession 화면으로 자동 이동.
 * 화면 탭 시 즉시 이동.
 */
export default function ReviewCountdownScreen(): JSX.Element
```

**상태:**
```typescript
const [count, setCount] = useState<number>(REVIEW_COUNTDOWN_SECONDS);
```

**동작:**
1. 화면 마운트 시 `setInterval(1000)` 시작
2. count가 0이 되면 `navigation.replace('ReviewSession')` 호출
3. 화면 언마운트 시 interval 정리 (`useEffect` cleanup)
4. 화면 탭 시 즉시 `navigation.replace('ReviewSession')` 호출

**UI 구성:**
```
┌─────────────────────────────┐  배경: #FAF7F2
│                             │
│      복습을 시작합니다       │
│                             │
│             3               │  ← count (큰 숫자, 색상: #D97706)
│                             │
│      탭하면 바로 시작        │
│                             │
└─────────────────────────────┘
```

---

## Navigation 수정

**파일:** `Product/apps/mobile/App.tsx`

```typescript
// Stack.Navigator에 추가
<Stack.Screen name="ReviewCountdown" component={ReviewCountdownScreen} />
```

```typescript
// RootStackParamList에 추가
ReviewCountdown: undefined;
```

**진입점:** `HomeScreen`에서 "복습하기" 버튼 탭 시
`navigation.navigate('ReviewCountdown')` 호출.

*(ReviewEnd에서 "한 번 더" 버튼이 없으므로 ReviewCountdown 재진입은 HomeScreen에서만.)*

---

## 검증

1. HomeScreen "복습하기" 탭 → ReviewCountdownScreen 진입 확인
2. 3에서 카운트다운 시작, 0 도달 시 ReviewSessionScreen 자동 전환 확인
3. 카운트다운 중 화면 탭 → 즉시 ReviewSessionScreen 전환 확인
