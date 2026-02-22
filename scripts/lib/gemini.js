'use strict';

// ── Constants ──────────────────────────────────────────────────────────────

const PAGE_KEYS = ['step1', 'step2', 'step3'];

// ── Diversity Slots ────────────────────────────────────────────────────────

const TOPIC_POOL = [
  'school friendship',
  'family routine',
  'workplace teamwork',
  'grocery shopping',
  'public transportation',
  'weekend hobby',
  'neighbor interaction',
  'doctor visit',
  'restaurant service',
  'travel day',
];

const MOOD_POOL = [
  'warm',
  'lightly funny',
  'calm',
  'slightly tense',
  'encouraging',
  'surprised then relieved',
  'curious',
  'grateful',
];

const SETTING_POOL = [
  'home',
  'school',
  'office',
  'street',
  'bus or subway',
  'store',
  'cafe',
  'park',
  'clinic',
  'library',
];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDiversitySlots() {
  const topics = shuffle(TOPIC_POOL);
  const moods = shuffle(MOOD_POOL);
  const settings = shuffle(SETTING_POOL);
  return PAGE_KEYS.reduce((acc, key, index) => {
    acc[key] = {
      topic: topics[index % topics.length],
      mood: moods[index % moods.length],
      setting: settings[index % settings.length],
    };
    return acc;
  }, {});
}

// ── Prompts ────────────────────────────────────────────────────────────────

function buildSlotLines(slots) {
  return PAGE_KEYS.map((key) => {
    const s = slots[key];
    return `${key}: topic=${s.topic}; mood=${s.mood}; setting=${s.setting}`;
  }).join('\n');
}

function buildBundlePrompt(params, slots) {
  return `
You are creating progressive learning content for an English expression.

Selected phrase: "${params.phrase}"
Selected sense (Korean): "${params.senseLabelKo}"
Selected domain: "${params.domain}"

Output only valid JSON with this exact shape:
{
  "expression": "string",
  "step1": { "sentence": "string" },
  "step2": { "story": "string", "topicTag": "string", "moodTag": "string" },
  "step3": { "story": "string", "topicTag": "string", "moodTag": "string" },
  "meaning": {
    "literalMeaningKo":"string",
    "realUsageKo":"string",
    "etymologyKo":"string",
    "nuanceKo":"string",
    "shortExampleEn":"string",
    "shortExampleKo":"string"
  }
}

Hard rules:
1) step1.sentence: exactly 1 sentence; rich natural context; expression used naturally.
2) step2.story: exactly 2 sentences; short story with a clear scene; different context from step1.
3) step3.story: 3 to 4 sentences; richer story from yet another angle; different context from step2.
4) All steps must anchor to the selected sense and domain.
5) English level A2-B1 throughout.
6) No title, no markdown, no explanation, JSON only.
7) "meaning" fields must be Korean-centered explanations (except shortExampleEn).
8) shortExampleEn must include the selected phrase or its natural variation.
9) Each meaning field should be concise (1 to 2 sentences).

Use these page slots for diversity:
${buildSlotLines(slots)}
`.trim();
}

function buildImagePrompt(params) {
  return [
    `Create a single cartoon-style illustration for page "${params.pageKey}".`,
    `Target expression: "${params.expression}".`,
    'Style: kid-friendly, soft cartoon, clean lines, warm colors, clear subject, daily-life atmosphere.',
    'Keep one scene only. No split panel.',
    'No text, no captions, no watermark, no logo.',
    'Use this story context as visual guidance:',
    params.story,
  ].join('\n');
}

// ── Shared Utilities ───────────────────────────────────────────────────────

function extractGeneratedText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts.map((p) => p?.text || '').join('\n').trim();
  return text.length > 0 ? text : null;
}

function extractJsonText(raw) {
  const trimmed = String(raw || '').trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('Model output does not contain valid JSON object');
  }
  return trimmed.slice(first, last + 1);
}

// ── Validation ─────────────────────────────────────────────────────────────

const MAX_PAIR_SIMILARITY = 0.62;

function sentenceCount(text) {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 0;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function validateBundle(bundle) {
  const step1 = String(bundle?.step1?.sentence || '').trim();
  if (!step1) return { valid: false, reason: 'step1_sentence_missing' };
  if (sentenceCount(step1) !== 1) return { valid: false, reason: 'step1_sentence_count_invalid' };

  const step2 = String(bundle?.step2?.story || '').trim();
  if (!step2) return { valid: false, reason: 'step2_story_missing' };
  if (sentenceCount(step2) !== 2) return { valid: false, reason: 'step2_sentence_count_invalid' };

  const step3 = String(bundle?.step3?.story || '').trim();
  if (!step3) return { valid: false, reason: 'step3_story_missing' };
  const s3count = sentenceCount(step3);
  if (s3count < 3 || s3count > 4) return { valid: false, reason: 'step3_sentence_count_invalid' };

  if (jaccardSimilarity(step2, step3) > MAX_PAIR_SIMILARITY) {
    return { valid: false, reason: 'stories_too_similar' };
  }

  const m = bundle.meaning;
  if (!m) return { valid: false, reason: 'meaning_missing' };
  const meaningFields = [
    'literalMeaningKo', 'realUsageKo', 'etymologyKo',
    'nuanceKo', 'shortExampleEn', 'shortExampleKo',
  ];
  for (const field of meaningFields) {
    if (!String(m[field] || '').trim()) {
      return { valid: false, reason: `meaning_${field}_missing` };
    }
  }

  return { valid: true };
}

// ── API Endpoints ──────────────────────────────────────────────────────────

function getTextEndpoint() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment');
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  return {
    apiKey,
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  };
}

function getImageEndpoint() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment');
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  return {
    apiKey,
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  };
}

async function requestJson(prompt) {
  const { url, apiKey } = getTextEndpoint();
  const res = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.95,
        topP: 0.95,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini text API error (${res.status}): ${text}`);
  }

  const payload = await res.json();
  const raw = extractGeneratedText(payload);
  if (!raw) throw new Error('Gemini API returned empty content');
  return JSON.parse(extractJsonText(raw));
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate a learning bundle for a single expression.
 * @param {string} phrase - English phrase (e.g. "take off")
 * @param {string} senseLabelKo - Korean sense label (e.g. "이륙하다")
 * @param {string} domain - Domain tag (e.g. "general", "tech", "business")
 * @returns {Promise<object>} Learning bundle
 */
async function generateBundle(phrase, senseLabelKo, domain) {
  const params = { phrase, senseLabelKo, domain };
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const slots = buildDiversitySlots();
      const parsed = await requestJson(buildBundlePrompt(params, slots));
      const bundle = {
        expression: phrase,
        step1: { sentence: parsed?.step1?.sentence || '' },
        step2: {
          story: parsed?.step2?.story || '',
          topicTag: parsed?.step2?.topicTag || '',
          moodTag: parsed?.step2?.moodTag || '',
        },
        step3: {
          story: parsed?.step3?.story || '',
          topicTag: parsed?.step3?.topicTag || '',
          moodTag: parsed?.step3?.moodTag || '',
        },
        meaning: {
          literalMeaningKo: parsed?.meaning?.literalMeaningKo || '',
          realUsageKo: parsed?.meaning?.realUsageKo || '',
          etymologyKo: parsed?.meaning?.etymologyKo || '',
          nuanceKo: parsed?.meaning?.nuanceKo || '',
          shortExampleEn: parsed?.meaning?.shortExampleEn || '',
          shortExampleKo: parsed?.meaning?.shortExampleKo || '',
        },
        selectionMeta: {
          selectedPhrase: phrase,
          selectedSenseLabelKo: senseLabelKo,
          selectedDomain: domain,
        },
      };

      const result = validateBundle(bundle);
      if (result.valid) return bundle;

      lastError = new Error(`Validation failed: ${result.reason}`);
      process.stderr.write(`[gemini] Attempt ${attempt} validation failed: ${result.reason}\n`);
    } catch (err) {
      lastError = err;
      process.stderr.write(`[gemini] Attempt ${attempt} error: ${err.message}\n`);
    }
  }

  throw new Error(`Bundle generation failed after 3 attempts: ${lastError?.message}`);
}

/**
 * Generate an image for a learning step.
 * @param {string} story - Story text to use as visual context
 * @param {string} pageKey - Step key ('step2' or 'step3')
 * @param {string} expression - English expression being learned
 * @returns {Promise<{buffer: Buffer, mimeType: string}>}
 */
async function generateImage(story, pageKey, expression) {
  const { url, apiKey } = getImageEndpoint();
  const prompt = buildImagePrompt({ story, pageKey, expression });

  const res = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, topP: 0.95 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini image API error (${res.status}): ${text}`);
  }

  const payload = await res.json();
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) throw new Error('Gemini image API returned no parts');

  for (const part of parts) {
    if (part?.inlineData?.data && part?.inlineData?.mimeType) {
      return {
        buffer: Buffer.from(part.inlineData.data, 'base64'),
        mimeType: part.inlineData.mimeType,
      };
    }
  }

  throw new Error('Gemini image API returned no image data');
}

module.exports = { generateBundle, generateImage };
