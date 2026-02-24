'use strict';

// Mock lib/supabase before loading the router (path relative to this test file)
jest.mock('../../lib/supabase', () => ({
  findExpressionByPhrase: jest.fn(),
  findExpressionsByPhraseLike: jest.fn(),
  rowsToBundle: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const learningRouter = require('../../src/routes/learning');
const {
  findExpressionByPhrase,
  findExpressionsByPhraseLike,
  rowsToBundle,
} = require('../../lib/supabase');

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

  it('returns status:invalid when no matches are found', async () => {
    findExpressionByPhrase.mockResolvedValue(null);
    findExpressionsByPhraseLike.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/v1/learning/resolve-and-generate')
      .send({ input: 'xyzabc123' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('invalid');
    expect(res.body.reasonKo).toBeTruthy();
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
