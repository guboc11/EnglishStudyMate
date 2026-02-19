const { PAGE_KEYS } = require('./constants');

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
  for (let i = copy.length - 1; i > 0; i -= 1) {
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

module.exports = {
  buildDiversitySlots,
};
