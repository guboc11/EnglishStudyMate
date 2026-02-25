# PLAN_UI1 — UI 테마 & 화면 개선

**전제조건:** 없음 (독립 실행 가능)
**후속 플랜:** 없음

---

## 목적

앱 전체에 따뜻한 크림 계열 테마를 적용한다.
레이아웃·컴포넌트 구조 변경 없이 **색상·타이포그래피만** 변경.
ExampleFlowScreen에 step 인디케이터(● ○ ○) 추가.

---

## 색상 팔레트 (확정)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `bg-primary` | `#FAF7F2` | 화면 배경 전체 |
| `surface` | `#FFFFFF` | 카드, 입력창 배경 |
| `text-primary` | `#2C2C2C` | 본문 텍스트 |
| `text-secondary` | `#6B5C4C` | 보조 텍스트, 힌트 |
| `accent` | `#D97706` | 포인트 컬러 (버튼, 강조 텍스트) |
| `accent-light` | `#FEF3C7` | 강조 배경 (태그, 뱃지) |
| `border` | `#E8E0D5` | 입력창 테두리, 구분선 |
| `error` | `#DC2626` | 에러 메시지 |

---

## 수정 파일 목록

| 파일 | 작업 |
|------|------|
| `Product/apps/mobile/screens/HomeScreen.tsx` | 수정 — 배경색, 버튼 색상 |
| `Product/apps/mobile/screens/ExampleFlowScreen.tsx` | 수정 — 배경색, 버튼 색상, 상단 인디케이터 추가 |
| `Product/apps/mobile/screens/ReviewSessionScreen.tsx` | 수정 — 배경색, 버튼 색상 |
| `Product/apps/mobile/screens/MeaningScreen.tsx` | 수정 — 배경색 |
| `Product/apps/mobile/screens/MeaningGateScreen.tsx` | 수정 — 배경색 |
| `Product/apps/mobile/screens/SearchHistoryScreen.tsx` | **삭제** |
| `Product/apps/mobile/screens/ReviewFlowScreen.tsx` | **삭제** |

---

## 화면별 색상 적용 명세

### 공통
- 화면 배경: `backgroundColor: '#FAF7F2'`
- 기존 `bg-background-50` 클래스 → 인라인 스타일 `#FAF7F2` 또는 글래스스택 테마 override

### HomeScreen
```
배경: #FAF7F2
Input border: #E8E0D5
Input 배경: #FFFFFF
"단어 검색" 버튼: 배경 #D97706, 텍스트 #FFFFFF
"복습하기" 버튼: 배경 #FFFFFF, 테두리 #D97706, 텍스트 #D97706
에러 텍스트: #DC2626
```

### ExampleFlowScreen
```
배경: #FAF7F2
이미지 플레이스홀더 배경: #E8E0D5
영어 표현 강조 색상: #D97706 (현재 #2563eb에서 변경)
"다음" 버튼: 배경 #D97706, 텍스트 #FFFFFF
"뜻 보러 가기" 버튼: 배경 #FFFFFF, 테두리 #D97706, 텍스트 #D97706
```

### ReviewSessionScreen
```
배경: #FAF7F2
표현 강조 텍스트: #D97706 (현재 #2563eb에서 변경)
"다음" 버튼: 배경 #D97706, 텍스트 #FFFFFF
"복습 완료" 버튼: 배경 #FFFFFF, 테두리 #D97706, 텍스트 #D97706
```

---

## ExampleFlowScreen step 인디케이터 명세

상단에 점 3개 인디케이터 추가.

**UI 구성:**
```
  ● ──────── ○ ──────── ○    ← step1 상태
  ● ──────── ● ──────── ○    ← step2 상태
  ● ──────── ● ──────── ●    ← step3 상태
```

**구현:**
```typescript
// ExampleFlowScreen 내부
function StepIndicator({ current, total }: { current: ExampleStep; total: 3 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {[1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <View style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: i <= current ? '#D97706' : '#E8E0D5',
          }} />
          {i < 3 && (
            <View style={{
              width: 32, height: 1,
              backgroundColor: i < current ? '#D97706' : '#E8E0D5',
            }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
```

**배치:** `LearningFlowLayout` 내부 최상단, 또는 VStack 첫 번째 항목.

---

## 삭제 대상 파일

### `SearchHistoryScreen.tsx` 삭제 이유
- Navigation에서 사용되지 않음
- Home 검색창에서 직접 입력으로 대체

### `ReviewFlowScreen.tsx` 삭제 이유
- `ReviewSessionScreen`과 역할 중복
- PLAN에도 없고 현재 Navigation 진입점 없음

삭제 전 반드시 `App.tsx` 및 Navigation 파일에서 import 제거 확인.

---

## 검증

1. HomeScreen 실행 → 배경 크림색, 버튼 앰버색 확인
2. ExampleFlowScreen step 이동 → 상단 점 인디케이터 활성화 확인
3. 영어 표현 하이라이트 → 파란색 대신 앰버색 확인
4. ReviewSessionScreen → 동일 테마 확인
5. SearchHistoryScreen, ReviewFlowScreen 파일 없음 확인
