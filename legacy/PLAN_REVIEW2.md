# PLAN_REVIEW2 — ReviewEndScreen + familiarity 일괄 평가

**전제조건:** REVIEW1 완료 (ReviewCountdownScreen + Navigation 타입 업데이트)
**후속 플랜:** 없음

---

## 목적

복습 세션 종료 플로우를 완성한다:
- `ReviewEndScreen`: 복습한 표현 목록 + familiarity 일괄 평가 + [홈으로] 버튼
- `ReviewSessionScreen` 수정: [종료] 버튼 추가, 완료 시 ReviewEnd로 이동

> **제거 결정:** PauseSummaryScreen, pauseSession.ts — 일시정지 기능 없이 종료만.

---

## 신규/수정 파일 목록

| 파일 | 작업 |
|------|------|
| `Product/apps/mobile/screens/ReviewEndScreen.tsx` | 신규 |
| `Product/apps/mobile/screens/ReviewSessionScreen.tsx` | 수정 |

---

## 화면 파라미터 타입

```typescript
// RootStackParamList에 추가
type RootStackParamList = {
  // ... 기존 + REVIEW1 항목 유지
  ReviewEnd: {
    entries: VocabularyEntry[];  // 이번 세션에서 복습한 표현 목록 전체
  };
};
```

---

## ReviewEndScreen 명세

**파일:** `Product/apps/mobile/screens/ReviewEndScreen.tsx`

```typescript
/**
 * 복습 세션 완료 화면.
 * 복습한 표현 목록을 보여주고 familiarity를 일괄 평가한다.
 * 평가 완료 후 [홈으로] 버튼으로 Home 이동.
 *
 * @param params.entries - 이번 세션에서 복습한 VocabularyEntry 배열
 */
export default function ReviewEndScreen(): JSX.Element
```

**상태:**
```typescript
// 각 표현의 임시 평가값 (저장 전)
const [ratings, setRatings] = useState<Record<string, FamiliarityLevel | null>>(
  () => Object.fromEntries(params.entries.map((e) => [e.expression, e.familiarity ?? null]))
);
```

**동작:**
1. 화면 진입 시 `entries` 배열로 ratings 초기 상태 설정 (기존 familiarity 기본값)
2. [알겠어] / [흐릿해] / [모르겠어] 탭 → `ratings` 업데이트
3. [홈으로] 탭:
   - `ratings` 에서 변경된 항목만 `setFamiliarity(expression, level)` 호출
   - `navigation.navigate('Home')` 이동

**UI 구성:**
```
┌─────────────────────────────────┐  배경: #FAF7F2
│                                 │
│        복습 완료!               │  텍스트: #2C2C2C, bold
│     {entries.length}개 복습     │  서브: #6B5C4C
│                                 │
│  take off    [알] [흐] [모]     │  ← 각 표현마다
│  burn out    [알] [흐] [모]     │    선택된 버튼: #D97706 배경
│  give up     [알] [흐] [모]     │    미선택: #E8E0D5 배경
│  ...                            │
│                                 │
│           [홈으로]              │  배경: #D97706, 텍스트: #FFFFFF
│                                 │
└─────────────────────────────────┘
```

**familiarity 버튼 레이블:**
| FamiliarityLevel | 버튼 텍스트 |
|-----------------|------------|
| `known` | 알 |
| `fuzzy` | 흐 |
| `unknown` | 모 |

**[홈으로] 활성화 조건:** 항상 활성 (평가 없이 넘어가도 됨)

---

## ReviewSessionScreen 수정 명세

**파일:** `Product/apps/mobile/screens/ReviewSessionScreen.tsx`

**변경 사항 1 — [종료] 버튼 추가**

reading 단계 헤더에 [종료] 버튼 추가. 탭 시 현재까지 복습한 entries를 ReviewEnd로 전달.

```typescript
// 헤더 영역
<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
  <Text>{progress}</Text>
  <Button onPress={handleExit}>종료</Button>  // ← 추가
</View>

function handleExit() {
  navigation.navigate('ReviewEnd', { entries: entries.slice(0, currentIndex + 1) });
}
```

**변경 사항 2 — 세션 완료 시 ReviewEnd 이동**

기존 `setPhase('complete')` → `navigation.navigate('ReviewEnd', { entries })` 로 변경.

```typescript
const handleNext = () => {
  if (currentIndex + 1 >= entries.length) {
    // 기존: setPhase('complete')
    navigation.navigate('ReviewEnd', { entries });  // ← 변경
  } else {
    setCurrentIndex((prev) => prev + 1);
  }
};
```

**변경 사항 3 — 기존 complete phase 제거**

`phase === 'complete'` 분기 전체 삭제 (ReviewEnd로 이관).

**변경 사항 4 — 색상 적용 (PLAN_UI1 기준)**
- 배경: `#FAF7F2`
- 표현 강조 텍스트: `#D97706`
- "다음" 버튼: `#D97706` 배경

---

## Navigation 수정

**파일:** `Product/apps/mobile/App.tsx`

```typescript
// Stack.Navigator에 추가
<Stack.Screen name="ReviewEnd" component={ReviewEndScreen} />
```

---

## 검증

1. ReviewSession → 마지막 표현 "다음" → ReviewEndScreen 진입 확인
2. ReviewEndScreen에 복습한 표현 목록 전체 표시 확인
3. [알]/[흐]/[모] 탭 → 버튼 하이라이트 변경 확인
4. [홈으로] 탭 → setFamiliarity 호출 후 Home 이동 확인
5. ReviewSession 중 [종료] → 지금까지 복습한 표현만 ReviewEnd에 표시 확인
6. vocabularyProfile AsyncStorage에 familiarity 업데이트 확인
