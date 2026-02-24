const express = require('express');
const { findExpressionByPhrase, findExpressionsByPhraseLike, rowsToBundle } = require('../../lib/supabase');

const router = express.Router();

router.post('/resolve-and-generate', async (req, res, next) => {
  try {
    const input = String(req.body?.input || '').trim();
    if (!input) {
      res.status(400).json({ error: 'invalid_input', message: 'input is required' });
      return;
    }

    const normalized = input.toLowerCase().trim();

    // 1. exact match
    const cached = await findExpressionByPhrase(normalized);
    if (cached) {
      console.log(`[Supabase hit] ${normalized}`);
      const bundle = rowsToBundle(cached.expression, cached.story);
      res.json({ status: 'ready', expression: cached.expression.phrase, bundle });
      return;
    }

    // 2. LIKE search → needs_selection
    const matches = await findExpressionsByPhraseLike(normalized);
    if (matches.length > 0) {
      console.log(`[Supabase like] ${normalized} → ${matches.length}개`);
      const candidates = matches.map((row) => ({
        id: row.id,
        phrase: row.phrase,
        senseLabelKo: row.sense_label_ko,
        shortHintKo: row.meaning?.shortExampleKo ?? '',
        domains: [row.domain ?? 'general'],
      }));
      res.json({ status: 'needs_selection', normalizedInput: normalized, candidates });
      return;
    }

    // 3. 없음
    console.log(`[Supabase miss] ${normalized}`);
    res.json({
      status: 'invalid',
      reasonKo: `"${input}"에 해당하는 표현을 찾지 못했습니다.`,
      retryHintKo: '다른 표현을 검색해 보세요.',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-bundle', async (req, res, next) => {
  try {
    const phrase = String(req.body?.phrase || '').trim().toLowerCase();
    if (!phrase) {
      res.status(400).json({ error: 'invalid_input', message: 'phrase is required' });
      return;
    }

    const cached = await findExpressionByPhrase(phrase);
    if (!cached) {
      res.status(404).json({ error: 'not_found', message: 'Expression not found.' });
      return;
    }

    const bundle = rowsToBundle(cached.expression, cached.story);
    res.json(bundle);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
