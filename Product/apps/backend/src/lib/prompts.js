const { PAGE_KEYS } = require('./constants');

function buildSlotLines(slots) {
  return PAGE_KEYS.map((key) => {
    const slot = slots[key];
    return `${key}: topic=${slot.topic}; mood=${slot.mood}; setting=${slot.setting}`;
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

function buildResolveAndGeneratePrompt(input, slots) {
  return `
You analyze learner input and decide whether to generate learning content immediately.

Input expression: "${input}"

Output JSON only in one of these shapes:

1) invalid
{
  "status":"invalid",
  "reasonKo":"string",
  "retryHintKo":"string"
}

2) needs_selection
{
  "status":"needs_selection",
  "normalizedInput":"string",
  "candidates":[
    {
      "id":"string",
      "phrase":"string",
      "senseLabelKo":"string",
      "shortHintKo":"string",
      "domains":["general"|"tech"|"art"|"business"|"science"|"daily"]
    }
  ]
}

3) ready
{
  "status":"ready",
  "selected":{
    "phrase":"string",
    "senseLabelKo":"string",
    "domain":"general|tech|art|business|science|daily"
  },
  "bundle": {
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
}

Rules:
- If input is nonsense/non-existent/not practical, return invalid.
- If sense is ambiguous, return needs_selection with 1-6 candidates.
- If context clearly disambiguates, return ready.
- In ready, bundle must follow the same quality rules:
  - step1: exactly 1 sentence, rich context
  - step2: exactly 2 sentences, short story
  - step3: 3-4 sentences, richer story from a different angle
  - selected phrase variation included naturally in each step
  - contexts diverse across steps
  - selected sense/domain must stay consistent
  - meaning fields Korean-centered except shortExampleEn
- No markdown, no explanation, JSON only.

Use these page slots for diversity in ready mode:
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

function buildVideoPrompt(params) {
  return [
    'Create one short cinematic video clip (8-10 seconds) for an English learning example.',
    `Target expression: "${params.expression}".`,
    'Show a simple daily-life scene with 1-2 people and clear action.',
    'No subtitles, no watermark, no on-screen text.',
    'Natural camera movement, realistic lighting, family-friendly tone.',
    'Output compatibility target: web-playable MP4 (H.264/AVC video + AAC audio).',
    'Avoid codecs that are often unsupported in browsers (for example HEVC-only output).',
    'Use this story context:',
    params.story,
  ].join('\n');
}

module.exports = {
  buildBundlePrompt,
  buildResolveAndGeneratePrompt,
  buildImagePrompt,
  buildVideoPrompt,
};
