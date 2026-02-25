# PLAN_SUPABASE1 — DB 스키마 Migration

**전제조건:** 없음 (독립 실행 가능)
**후속 플랜:** SUPABASE2, CONTENT2, CONTENT3

---

## 목적

모든 Supabase 작업의 기반이 되는 DB 스키마를 생성한다.
`expressions` 테이블과 `stories` 테이블을 분리해 같은 표현에 스토리 N개를 추가할 수 있는 확장 구조를 확보한다.

---

## 생성 파일

| 파일 | 작업 |
|------|------|
| `supabase/migrations/20260224000000_create_expressions_and_stories.sql` | 신규 |

---

## Migration SQL

**파일:** `supabase/migrations/20260224000000_create_expressions_and_stories.sql`

```sql
-- expressions: 표현 + 의미 (1개 표현 = 1행)
CREATE TABLE expressions (
  id             TEXT PRIMARY KEY,
  phrase         TEXT NOT NULL,
  sense_label_ko TEXT NOT NULL,
  domain         TEXT NOT NULL DEFAULT 'general',
  meaning        JSONB NOT NULL,
  selection_meta JSONB NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- stories: 스토리 (1개 표현 = N개 스토리)
CREATE TABLE stories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id TEXT NOT NULL REFERENCES expressions(id) ON DELETE CASCADE,
  step1_sentence TEXT NOT NULL,
  step2_story    TEXT NOT NULL,
  step3_story    TEXT NOT NULL,
  topic_tag      TEXT,
  mood_tag       TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expressions_phrase ON expressions(phrase);
CREATE INDEX idx_stories_expression_id ON stories(expression_id);
```

### JSONB 컬럼 구조

**`meaning` 컬럼 (ExpressionMeaning)**
```json
{
  "literalMeaningKo": "문자 그대로의 의미",
  "realUsageKo": "실제 사용 의미",
  "etymologyKo": "어원",
  "nuanceKo": "뉘앙스",
  "shortExampleEn": "짧은 예문 (영어)",
  "shortExampleKo": "짧은 예문 (한국어)"
}
```

**`selection_meta` 컬럼 (SelectionMeta)**
```json
{
  "selectedPhrase": "a bird's eye view",
  "selectedSenseLabelKo": "조감도 / 전반적인 시각",
  "selectedDomain": "general"
}
```

---

## 실행 방법

### 방법 A: Supabase Dashboard SQL Editor (권장)
1. Supabase Dashboard → SQL Editor 진입
2. 위 SQL 전체 붙여넣기
3. Run 클릭

### 방법 B: Supabase CLI
```bash
supabase db push
# 또는
supabase migration up
```

---

## 검증

1. Supabase Dashboard → Table Editor
2. `expressions` 테이블 존재 확인 (컬럼: id, phrase, sense_label_ko, domain, meaning, selection_meta, created_at)
3. `stories` 테이블 존재 확인 (컬럼: id, expression_id, step1_sentence, step2_story, step3_story, topic_tag, mood_tag, created_at)
4. Index Editor에서 `idx_expressions_phrase`, `idx_stories_expression_id` 확인

---

## 완료 후 다음 단계

SUPABASE1 완료 → 다음 플랜 병렬 진행 가능:
- `PLAN_SUPABASE2.md`: Backend 캐시 연동
- `PLAN_CONTENT2.md`: 번들 DB 업로드 (CONTENT1도 완료 필요)
- `PLAN_CONTENT3.md`: 이미지 Storage 업로드 (CONTENT1도 완료 필요)
