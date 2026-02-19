const { PAGE_KEYS } = require('./constants');

function buildSlotLines(slots) {
  return PAGE_KEYS.map((key) => {
    const slot = slots[key];
    return `${key}: topic=${slot.topic}; mood=${slot.mood}; setting=${slot.setting}`;
  }).join('\n');
}

function buildBundlePrompt(params, slots) {
  return `
You are creating learning stories for an English expression.

Selected phrase: "${params.phrase}"
Selected sense (Korean): "${params.senseLabelKo}"
Selected domain: "${params.domain}"

Output only valid JSON with this exact shape:
{
  "expression": "string",
  "example1": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "example2": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "example3": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "review1": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "review2": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
  "review3": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
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
1) Every story must be 3 to 4 sentences, easy A2-B1 English.
2) Every story must naturally include the selected phrase or its grammatical variation.
3) Each page must use a clearly different context and situation from the others.
4) Keep all stories anchored to the selected sense and domain.
5) No title, no markdown, no explanation, JSON only.
6) "meaning" fields must be Korean-centered explanations (except shortExampleEn).
7) shortExampleEn must include the selected phrase or its natural variation.
8) Each meaning field should be concise (1 to 2 sentences).

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
    "example1": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
    "example2": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
    "example3": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
    "review1": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
    "review2": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
    "review3": {"story":"string","topicTag":"string","moodTag":"string","usedExpressionVariants":["string"]},
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
  - each story 3-4 sentences
  - selected phrase variation included naturally
  - contexts diverse across pages
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
