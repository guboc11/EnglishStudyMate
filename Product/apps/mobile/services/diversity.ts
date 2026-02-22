import type { LearningPageKey } from '@/types/learning';

export type DiversitySlot = {
  topic: string;
  mood: string;
  setting: string;
};

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

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildDiversitySlots(): Record<LearningPageKey, DiversitySlot> {
  const keys: LearningPageKey[] = ['step1', 'step2', 'step3'];

  const topics = shuffle(TOPIC_POOL);
  const moods = shuffle(MOOD_POOL);
  const settings = shuffle(SETTING_POOL);

  return keys.reduce(
    (acc, key, index) => {
      acc[key] = {
        topic: topics[index % topics.length],
        mood: moods[index % moods.length],
        setting: settings[index % settings.length],
      };
      return acc;
    },
    {} as Record<LearningPageKey, DiversitySlot>
  );
}
