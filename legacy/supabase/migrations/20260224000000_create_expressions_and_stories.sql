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
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id  TEXT NOT NULL REFERENCES expressions(id) ON DELETE CASCADE,
  step1_sentence TEXT NOT NULL,
  step2_story    TEXT NOT NULL,
  step3_story    TEXT NOT NULL,
  topic_tag      TEXT,
  mood_tag       TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expressions_phrase ON expressions(phrase);
CREATE INDEX idx_stories_expression_id ON stories(expression_id);
