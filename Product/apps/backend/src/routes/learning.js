const express = require('express');
const { findExpressionByPhrase, rowsToBundle } = require('../../lib/supabase');

const router = express.Router();

router.post('/resolve-and-generate', async (req, res, next) => {
  try {
    const input = String(req.body?.input || '').trim();
    if (!input) {
      res.status(400).json({ error: 'invalid_input', message: 'input is required' });
      return;
    }

    const normalizedInput = input.toLowerCase().trim();

    const cached = await findExpressionByPhrase(normalizedInput);
    if (cached) {
      console.log(`[Supabase hit] ${normalizedInput}`);
      const bundle = rowsToBundle(cached.expression, cached.story);
      res.json({ status: 'ready', expression: cached.expression.phrase, bundle });
      return;
    }

    console.log(`[Supabase miss] ${normalizedInput}`);
    res.status(404).json({ error: 'not_found', message: 'Expression not found in database.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
