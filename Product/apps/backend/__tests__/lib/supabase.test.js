'use strict';

// Must be called before any require() that triggers @supabase/supabase-js loading
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

const { createClient } = require('@supabase/supabase-js');
const { findExpressionsByPhraseLike, rowsToBundle } = require('../../lib/supabase');

describe('findExpressionsByPhraseLike', () => {
  const filterMock = jest.fn();
  const limitMock = jest.fn();

  beforeAll(() => {
    filterMock.mockReturnValue({ limit: limitMock });

    createClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          filter: filterMock,
        }),
      }),
    });
  });

  beforeEach(() => {
    filterMock.mockClear();
    limitMock.mockClear();
    limitMock.mockResolvedValue({ data: [], error: null });
  });

  it('calls .filter() with ~* operator and \\m...\\M word-boundary pattern (regression guard)', async () => {
    await findExpressionsByPhraseLike('put');
    expect(filterMock).toHaveBeenCalledWith('phrase', '~*', '\\mput\\M');
  });

  it('passes the search word verbatim inside \\m...\\M', async () => {
    await findExpressionsByPhraseLike('give up');
    expect(filterMock).toHaveBeenCalledWith('phrase', '~*', '\\mgive up\\M');
  });

  it('returns an empty array when DB returns an error', async () => {
    limitMock.mockResolvedValueOnce({ data: null, error: { message: 'connection timeout' } });
    const result = await findExpressionsByPhraseLike('test');
    expect(result).toEqual([]);
  });

  it('returns an empty array when DB returns null data', async () => {
    limitMock.mockResolvedValueOnce({ data: null, error: null });
    const result = await findExpressionsByPhraseLike('test');
    expect(result).toEqual([]);
  });

  it('returns the data array on success', async () => {
    const mockData = [
      { id: '1', phrase: 'put off', sense_label_ko: '미루다', domain: 'daily', meaning: {} },
      { id: '2', phrase: 'put out', sense_label_ko: '끄다', domain: 'daily', meaning: {} },
    ];
    limitMock.mockResolvedValueOnce({ data: mockData, error: null });
    const result = await findExpressionsByPhraseLike('put');
    expect(result).toEqual(mockData);
  });
});

describe('rowsToBundle', () => {
  const expression = {
    phrase: 'put off',
    meaning: { literalMeaningKo: '미루다', realUsageKo: '연기하다' },
    selection_meta: { selectedPhrase: 'put off', selectedSenseLabelKo: '미루다' },
  };

  const story = {
    step1_sentence: 'She put off the meeting.',
    step2_story: 'Tom went to the office. He arrived early.',
    step3_story: 'Alice studied all night. She finally understood. The answer was clear.',
    topic_tag: 'work',
    mood_tag: 'neutral',
  };

  it('maps expression.phrase to bundle.expression', () => {
    const bundle = rowsToBundle(expression, story);
    expect(bundle.expression).toBe('put off');
  });

  it('maps step1_sentence to bundle.step1.sentence', () => {
    const bundle = rowsToBundle(expression, story);
    expect(bundle.step1.sentence).toBe('She put off the meeting.');
  });

  it('maps step2_story and tags to bundle.step2', () => {
    const bundle = rowsToBundle(expression, story);
    expect(bundle.step2.story).toBe('Tom went to the office. He arrived early.');
    expect(bundle.step2.topicTag).toBe('work');
    expect(bundle.step2.moodTag).toBe('neutral');
  });

  it('maps step3_story and tags to bundle.step3', () => {
    const bundle = rowsToBundle(expression, story);
    expect(bundle.step3.story).toBe(
      'Alice studied all night. She finally understood. The answer was clear.'
    );
    expect(bundle.step3.topicTag).toBe('work');
    expect(bundle.step3.moodTag).toBe('neutral');
  });

  it('maps meaning and selectionMeta from expression', () => {
    const bundle = rowsToBundle(expression, story);
    expect(bundle.meaning).toEqual(expression.meaning);
    expect(bundle.selectionMeta).toEqual(expression.selection_meta);
  });

  it('falls back to empty string for null topic/mood tags', () => {
    const storyNoTags = { ...story, topic_tag: null, mood_tag: null };
    const bundle = rowsToBundle(expression, storyNoTags);
    expect(bundle.step2.topicTag).toBe('');
    expect(bundle.step2.moodTag).toBe('');
  });
});
