const express = require('express');
const { generateBundle, resolveAndGenerate } = require('../providers/geminiText');
const { findExpressionByPhrase, rowsToBundle, insertExpressionAndStory } = require('../lib/supabase');

const router = express.Router();

router.post('/resolve-and-generate', async (req, res, next) => {
  try {
    const input = String(req.body?.input || '').trim();
    if (!input) {
      res.status(400).json({ error: 'invalid_input', message: 'input is required' });
      return;
    }

    const normalizedInput = input.toLowerCase().trim();

    // 1. Supabase 캐시 조회
    const cached = await findExpressionByPhrase(normalizedInput);
    if (cached) {
      console.log(`[Supabase hit] ${normalizedInput}`);
      const bundle = rowsToBundle(cached.expression, cached.story);
      res.json({ status: 'ready', expression: cached.expression.phrase, bundle });
      return;
    }

    // 2. Gemini 폴백
    const result = await resolveAndGenerate(input);

    if (result.status === 'ready') {
      console.log(`[Gemini fallback] ${result.expression}`);
      // 비동기 저장 (응답 블로킹 없이)
      insertExpressionAndStory(result.bundle).catch((err) =>
        console.error('[Supabase] insertExpressionAndStory failed:', err.message)
      );
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/generate-bundle', async (req, res, next) => {
  try {
    const expression = String(req.body?.expression || '').trim();
    const phrase = String(req.body?.phrase || '').trim();
    const senseLabelKo = String(req.body?.senseLabelKo || '').trim();
    const domain = String(req.body?.domain || '').trim() || 'general';

    if (!expression || !phrase || !senseLabelKo) {
      res.status(400).json({
        error: 'invalid_input',
        message: 'expression, phrase, senseLabelKo are required',
      });
      return;
    }

    const bundle = await generateBundle({ expression, phrase, senseLabelKo, domain });

    // 비동기 저장
    insertExpressionAndStory(bundle).catch((err) =>
      console.error('[Supabase] insertExpressionAndStory failed:', err.message)
    );

    res.json(bundle);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
