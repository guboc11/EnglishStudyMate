const express = require('express');
const { generateBundle, resolveAndGenerate } = require('../providers/geminiText');

const router = express.Router();

router.post('/resolve-and-generate', async (req, res, next) => {
  try {
    const input = String(req.body?.input || '').trim();
    if (!input) {
      res.status(400).json({ error: 'invalid_input', message: 'input is required' });
      return;
    }

    const result = await resolveAndGenerate(input);
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

    const bundle = await generateBundle({
      expression,
      phrase,
      senseLabelKo,
      domain,
    });

    res.json(bundle);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
