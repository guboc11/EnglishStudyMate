const express = require('express');
const { findExpressionByPhrase, findExpressionsByPhraseLike, rowsToBundle, insertExpressionAndStory } = require('../../lib/supabase');
const { resolveAndGenerate, generateBundle } = require('../providers/geminiText');

const router = express.Router();

router.post('/resolve-and-generate', async (req, res, next) => {
  try {
    const input = String(req.body?.input || '').trim();
    if (!input || input.length > 100) {
      res.status(400).json({ error: 'invalid_input', message: 'input must be 1–100 characters' });
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

    // 3. DB miss → Gemini fallback
    console.log(`[Gemini fallback] ${normalized}`);
    const aiResult = await resolveAndGenerate(normalized);

    if (aiResult.status === 'ready') {
      await insertExpressionAndStory(aiResult.bundle).catch((err) =>
        console.error('[insert error]', err.message)
      );
      res.json({ status: 'ready', expression: aiResult.expression, bundle: aiResult.bundle });
      return;
    }

    if (aiResult.status === 'needs_selection') {
      res.json({ status: 'needs_selection', normalizedInput: normalized, candidates: aiResult.candidates });
      return;
    }

    // invalid
    res.json({ status: 'invalid', reasonKo: aiResult.reasonKo, retryHintKo: aiResult.retryHintKo });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-bundle', async (req, res, next) => {
  try {
    const phrase = String(req.body?.phrase || '').trim().toLowerCase();
    if (!phrase || phrase.length > 100) {
      res.status(400).json({ error: 'invalid_input', message: 'phrase must be 1–100 characters' });
      return;
    }

    const cached = await findExpressionByPhrase(phrase);
    if (!cached) {
      const senseLabelKo = String(req.body?.senseLabelKo || '').trim();
      const domain      = String(req.body?.domain || 'general').trim();
      const bundle      = await generateBundle({ phrase, senseLabelKo, domain });
      await insertExpressionAndStory(bundle).catch((err) =>
        console.error('[insert error]', err.message)
      );
      res.json(bundle);
      return;
    }

    const bundle = rowsToBundle(cached.expression, cached.story);
    res.json(bundle);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
