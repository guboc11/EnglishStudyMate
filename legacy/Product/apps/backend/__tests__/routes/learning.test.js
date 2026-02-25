'use strict';

// Mock lib/supabase before loading the router (path relative to this test file)
jest.mock('../../lib/supabase', () => ({
  findExpressionByPhrase: jest.fn(),
  findExpressionsByPhraseLike: jest.fn(),
  rowsToBundle: jest.fn(),
  insertExpressionAndStory: jest.fn(),
}));

jest.mock('../../src/providers/geminiText', () => ({
  resolveAndGenerate: jest.fn(),
  generateBundle: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const learningRouter = require('../../src/routes/learning');
const {
  findExpressionByPhrase,
  findExpressionsByPhraseLike,
  rowsToBundle,
  insertExpressionAndStory,
} = require('../../lib/supabase');
const { resolveAndGenerate, generateBundle } = require('../../src/providers/geminiText');

// Minimal Express app for integration testing (no listen, no rate-limit, no helmet)
const app = express();
app.use(express.json());
app.use('/api/v1/learning', learningRouter);
app.use((err, req, res, _next) => {
  res.status(err.statusCode || 500).json({ error: 'internal_error', message: err.message });
});

beforeEach(() => {
  findExpressionByPhrase.mockReset();
  findExpressionsByPhraseLike.mockReset();
  rowsToBundle.mockReset();
  insertExpressionAndStory.mockReset();
  insertExpressionAndStory.mockResolvedValue(undefined);
  resolveAndGenerate.mockReset();
  generateBundle.mockReset();
});

describe('POST /api/v1/learning/resolve-and-generate', () => {
  it('returns status:ready when an exact phrase match exists', async () => {
    const mockExpression = { phrase: 'put off', meaning: {}, selection_meta: {} };
    const mockStory = {
      step1_sentence: 'She put off the meeting.',
      step2_story: 'A.',
      step3_story: 'B.',
    };
    const mockBundle = { expression: 'put off', step1: { sentence: 'She put off the meeting.' } };

    findExpressionByPhrase.mockResolvedValue({ expression: mockExpression, story: mockStory });
    rowsToBundle.mockReturnValue(mockBundle);

    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'Put Off' }); // should be normalized to lowercase

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.bundle).toEqual(mockBundle);
    expect(res.body.expression).toBe('put off');
    // Verify exact-match lookup used normalized input
    expect(findExpressionByPhrase).toHaveBeenCalledWith('put off');
  });

  it('returns status:needs_selection when LIKE candidates are found', async () => {
    findExpressionByPhrase.mockResolvedValue(null);
    findExpressionsByPhraseLike.mockResolvedValue([
      {
        id: '1',
        phrase: 'put off',
        sense_label_ko: '미루다',
        domain: 'daily',
        meaning: { shortExampleKo: '회의를 미뤘다.' },
      },
      {
        id: '2',
        phrase: 'put out',
        sense_label_ko: '끄다',
        domain: 'daily',
        meaning: {},
      },
    ]);

    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'put' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('needs_selection');
    expect(res.body.normalizedInput).toBe('put');
    expect(res.body.candidates).toHaveLength(2);
    expect(res.body.candidates[0]).toMatchObject({ id: '1', phrase: 'put off' });
  });

  it('returns status:invalid when Gemini returns invalid (DB miss)', async () => {
    findExpressionByPhrase.mockResolvedValue(null);
    findExpressionsByPhraseLike.mockResolvedValue([]);
    resolveAndGenerate.mockResolvedValue({
      status: 'invalid',
      reasonKo: '존재하지 않거나 학습용 표현이 아닙니다.',
      retryHintKo: '다른 단어/구문으로 다시 시도해 주세요.',
    });

    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'xyzabc123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('invalid');
    expect(res.body.reasonKo).toBeTruthy();
  });

  it('returns 400 when input exceeds 100 characters', async () => {
    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'a'.repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_input');
  });

  it('returns status:ready when Gemini resolves successfully (DB miss)', async () => {
    const mockBundle = { expression: 'general', step1: { sentence: 'In general, this works.' } };
    findExpressionByPhrase.mockResolvedValue(null);
    findExpressionsByPhraseLike.mockResolvedValue([]);
    resolveAndGenerate.mockResolvedValue({ status: 'ready', expression: 'general', bundle: mockBundle });

    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'general' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.bundle).toEqual(mockBundle);
    expect(insertExpressionAndStory).toHaveBeenCalledWith(mockBundle);
  });

  it('returns status:needs_selection when Gemini returns candidates (DB miss)', async () => {
    findExpressionByPhrase.mockResolvedValue(null);
    findExpressionsByPhraseLike.mockResolvedValue([]);
    resolveAndGenerate.mockResolvedValue({
      status: 'needs_selection',
      normalizedInput: 'put',
      candidates: [{ id: 'c1', phrase: 'put off', senseLabelKo: '미루다', shortHintKo: '', domains: ['daily'] }],
    });

    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'put' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('needs_selection');
    expect(res.body.candidates).toHaveLength(1);
  });

  it('returns 400 when input field is missing from body', async () => {
    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_input');
  });

  it('returns 400 when input is an empty string', async () => {
    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_input');
  });

  it('does not call findExpressionsByPhraseLike when exact match is found', async () => {
    const mockBundle = { expression: 'put off' };
    findExpressionByPhrase.mockResolvedValue({
      expression: { phrase: 'put off', meaning: {}, selection_meta: {} },
      story: { step1_sentence: '', step2_story: '', step3_story: '' },
    });
    rowsToBundle.mockReturnValue(mockBundle);

    await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'put off' });

    expect(findExpressionsByPhraseLike).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/learning/generate-bundle', () => {
  it('returns bundle when phrase exists in DB', async () => {
    const mockBundle = { expression: 'put off', step1: { sentence: 'She put off the meeting.' } };
    findExpressionByPhrase.mockResolvedValue({
      expression: { phrase: 'put off', meaning: {}, selection_meta: {} },
      story: { step1_sentence: 'She put off the meeting.', step2_story: '', step3_story: '' },
    });
    rowsToBundle.mockReturnValue(mockBundle);

    const res = await request(app)
      .post('/api/v1/learning/generate-bundle')
      .send({ phrase: 'put off' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockBundle);
  });

  it('returns 400 when phrase is missing', async () => {
    const res = await request(app)
      .post('/api/v1/learning/generate-bundle')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_input');
  });

  it('returns 400 when phrase exceeds 100 characters', async () => {
    const res = await request(app)
      .post('/api/v1/learning/generate-bundle')
      .send({ phrase: 'a'.repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_input');
  });

  it('calls generateBundle and returns bundle when phrase is not in DB', async () => {
    const mockBundle = {
      expression: 'put off',
      step1: { sentence: 'She put off the meeting.' },
      selectionMeta: { selectedPhrase: 'put off', selectedSenseLabelKo: '미루다', selectedDomain: 'daily' },
    };
    findExpressionByPhrase.mockResolvedValue(null);
    generateBundle.mockResolvedValue(mockBundle);

    const res = await request(app)
      .post('/api/v1/learning/generate-bundle')
      .send({ phrase: 'put off', senseLabelKo: '미루다', domain: 'daily' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockBundle);
    expect(generateBundle).toHaveBeenCalledWith({ phrase: 'put off', senseLabelKo: '미루다', domain: 'daily' });
    expect(insertExpressionAndStory).toHaveBeenCalledWith(mockBundle);
  });
});
