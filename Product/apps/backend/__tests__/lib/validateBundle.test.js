'use strict';

const { validateLearningBundle } = require('../../src/lib/validateBundle');

const validMeaning = {
  literalMeaningKo: '미루다',
  realUsageKo: '일정을 나중으로 연기하다',
  etymologyKo: 'put(놓다) + off(떨어뜨리다)',
  nuanceKo: '약간 부정적인 어감',
  shortExampleEn: 'She put off the meeting.',
  shortExampleKo: '그녀는 회의를 미뤘다.',
};

const validMeta = {
  selectedPhrase: 'put off',
  selectedSenseLabelKo: '미루다',
  selectedDomain: 'daily',
};

function makeBundle(overrides = {}) {
  return {
    step1: { sentence: 'She put off the meeting.' },
    step2: { story: 'Tom went to the market. He bought some fresh vegetables.' },
    step3: {
      story: 'Alice was nervous about the presentation. She had prepared slides for weeks. Finally, the day arrived and she delivered it confidently.',
    },
    meaning: { ...validMeaning },
    selectionMeta: { ...validMeta },
    ...overrides,
  };
}

describe('validateLearningBundle', () => {
  describe('valid bundle', () => {
    it('returns { valid: true } for a well-formed bundle', () => {
      expect(validateLearningBundle(makeBundle())).toEqual({ valid: true });
    });
  });

  describe('step1 validation', () => {
    it('fails when step1.sentence is empty', () => {
      const result = validateLearningBundle(makeBundle({ step1: { sentence: '' } }));
      expect(result).toEqual({ valid: false, reason: 'step1_sentence_missing' });
    });

    it('fails when step1.sentence has 2 sentences', () => {
      const result = validateLearningBundle(
        makeBundle({ step1: { sentence: 'First sentence here. Second sentence here.' } })
      );
      expect(result).toEqual({ valid: false, reason: 'step1_sentence_count_invalid' });
    });
  });

  describe('step2 validation', () => {
    it('fails when step2.story is empty', () => {
      const result = validateLearningBundle(makeBundle({ step2: { story: '' } }));
      expect(result).toEqual({ valid: false, reason: 'step2_story_missing' });
    });

    it('fails when step2.story has 1 sentence', () => {
      const result = validateLearningBundle(
        makeBundle({ step2: { story: 'Only one sentence here.' } })
      );
      expect(result).toEqual({ valid: false, reason: 'step2_sentence_count_invalid' });
    });

    it('fails when step2.story has 3 sentences', () => {
      const result = validateLearningBundle(
        makeBundle({ step2: { story: 'First sentence. Second sentence. Third sentence.' } })
      );
      expect(result).toEqual({ valid: false, reason: 'step2_sentence_count_invalid' });
    });
  });

  describe('step3 validation', () => {
    it('fails when step3.story is empty', () => {
      const result = validateLearningBundle(makeBundle({ step3: { story: '' } }));
      expect(result).toEqual({ valid: false, reason: 'step3_story_missing' });
    });

    it('fails when step3.story has 2 sentences', () => {
      const result = validateLearningBundle(
        makeBundle({ step3: { story: 'First sentence here. Second sentence here.' } })
      );
      expect(result).toEqual({ valid: false, reason: 'step3_sentence_count_invalid' });
    });

    it('fails when step3.story has 5 sentences', () => {
      const result = validateLearningBundle(
        makeBundle({ step3: { story: 'One. Two. Three. Four. Five.' } })
      );
      expect(result).toEqual({ valid: false, reason: 'step3_sentence_count_invalid' });
    });

    it('accepts step3.story with 3 sentences', () => {
      const result = validateLearningBundle(
        makeBundle({
          step3: { story: 'Alice studied hard. She passed the exam. Everyone cheered.' },
        })
      );
      expect(result).toEqual({ valid: true });
    });

    it('accepts step3.story with 4 sentences', () => {
      const result = validateLearningBundle(
        makeBundle({
          step3: {
            story: 'Alice studied hard. She passed the exam. Everyone cheered. She was proud.',
          },
        })
      );
      expect(result).toEqual({ valid: true });
    });
  });

  describe('diversity check (step2 vs step3 Jaccard similarity)', () => {
    it('fails when step2 and step3 are too similar (>0.62 Jaccard)', () => {
      const similarStory2 = 'She went to the market. She bought some fresh vegetables.';
      const similarStory3 =
        'She went to the market. She bought some fresh vegetables. And she was very happy.';
      const result = validateLearningBundle(
        makeBundle({ step2: { story: similarStory2 }, step3: { story: similarStory3 } })
      );
      expect(result).toEqual({ valid: false, reason: 'stories_too_similar' });
    });

    it('passes when step2 and step3 are sufficiently different', () => {
      // step2 and step3 share only "the" → Jaccard ≈ 0.04
      const result = validateLearningBundle(makeBundle());
      expect(result).toEqual({ valid: true });
    });
  });

  describe('meaning validation', () => {
    it('fails when meaning is missing', () => {
      const result = validateLearningBundle(makeBundle({ meaning: undefined }));
      expect(result).toEqual({ valid: false, reason: 'meaning_missing' });
    });

    it('fails when meaning.literalMeaningKo is empty', () => {
      const result = validateLearningBundle(
        makeBundle({ meaning: { ...validMeaning, literalMeaningKo: '' } })
      );
      expect(result).toEqual({ valid: false, reason: 'meaning_literal_missing' });
    });

    it('fails when meaning.shortExampleEn is empty', () => {
      const result = validateLearningBundle(
        makeBundle({ meaning: { ...validMeaning, shortExampleEn: '   ' } })
      );
      expect(result).toEqual({ valid: false, reason: 'meaning_short_example_en_missing' });
    });
  });

  describe('selectionMeta validation', () => {
    it('fails when selectionMeta is missing', () => {
      const result = validateLearningBundle(makeBundle({ selectionMeta: undefined }));
      expect(result).toEqual({ valid: false, reason: 'selection_meta_missing' });
    });

    it('fails when selectionMeta.selectedPhrase is empty', () => {
      const result = validateLearningBundle(
        makeBundle({ selectionMeta: { ...validMeta, selectedPhrase: '' } })
      );
      expect(result).toEqual({ valid: false, reason: 'selection_meta_phrase_missing' });
    });

    it('fails when selectionMeta.selectedDomain is empty', () => {
      const result = validateLearningBundle(
        makeBundle({ selectionMeta: { ...validMeta, selectedDomain: '' } })
      );
      expect(result).toEqual({ valid: false, reason: 'selection_meta_domain_missing' });
    });
  });
});
