# PLAN_CONTENT1 — 나머지 번들 생성 완료

**전제조건:** 없음 (독립 실행 가능)
**후속 플랜:** CONTENT2, CONTENT3 (모두 CONTENT1 완료 필요)

---

## 목적

`scripts/data/tasks.json`의 pending 상태 ~863개 표현에 대해 번들(텍스트 콘텐츠)을 생성해
`scripts/output/bundles/` 에 저장한다.

---

## 현재 상태

```
전체 표현: 2,000개
완료:      ~1,137개 (output/bundles/ 내 파일 수)
대기:      ~863개 (tasks.json status = pending)
```

---

## 실행 방법

### 전제: 환경변수 확인

`scripts/.env` 파일에 아래 항목이 설정되어 있어야 한다:
```
GEMINI_API_KEY=...
```

### 단일 실행 (기본)

```bash
cd scripts
node auto-batch.js
```

### 병렬 3개 실행 (권장, 속도 3배)

터미널 3개를 열어 각각 실행:

```bash
# 터미널 1
cd scripts && node auto-batch.js

# 터미널 2
cd scripts && node auto-batch.js

# 터미널 3
cd scripts && node auto-batch.js
```

`auto-batch.js`는 `tasks.json`에서 pending 항목을 atomic하게 가져가므로
동시 실행해도 중복 처리가 발생하지 않는다.

### max_count 지정 (일부만 실행)

```bash
node auto-batch.js 100   # 100개만 처리 후 종료
```

---

## 진행 상황 확인

```bash
cd scripts && node status.js
```

출력 예시:
```
전체: 2000
완료: 1137 (56.9%)
대기: 863 (43.2%)
오류: 0 (0.0%)
```

---

## 검증

- `node scripts/status.js` 실행 → `대기(pending) = 0` 확인
- `ls scripts/output/bundles/ | wc -l` → 2000개 근접 확인

---

## 완료 후 다음 단계

CONTENT1 완료 + SUPABASE1 완료 → 병렬 진행 가능:
- `PLAN_CONTENT2.md`: 번들 DB 업로드
- `PLAN_CONTENT3.md`: 이미지 생성 + Storage 업로드
