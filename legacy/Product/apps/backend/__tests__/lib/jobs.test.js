'use strict';

const { createJob, getJob, updateJob, cleanupJobs } = require('../../src/lib/jobs');

describe('createJob', () => {
  it('returns a job with UUID id', () => {
    const job = createJob();
    expect(job.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('returns a job with status "queued"', () => {
    const job = createJob();
    expect(job.status).toBe('queued');
  });

  it('returns a job with createdAt and updatedAt timestamps', () => {
    const before = Date.now();
    const job = createJob();
    const after = Date.now();
    expect(job.createdAt).toBeGreaterThanOrEqual(before);
    expect(job.createdAt).toBeLessThanOrEqual(after);
    expect(job.updatedAt).toBeGreaterThanOrEqual(before);
    expect(job.updatedAt).toBeLessThanOrEqual(after);
  });

  it('returns a job with null videoUri and message', () => {
    const job = createJob();
    expect(job.videoUri).toBeNull();
    expect(job.message).toBeNull();
  });

  it('returns unique ids on each call', () => {
    const a = createJob();
    const b = createJob();
    expect(a.id).not.toBe(b.id);
  });
});

describe('getJob', () => {
  it('returns the job by id', () => {
    const job = createJob();
    expect(getJob(job.id)).toEqual(job);
  });

  it('returns null for a non-existent id', () => {
    expect(getJob('non-existent-00000000-0000-0000-0000-000000000000')).toBeNull();
  });
});

describe('updateJob', () => {
  it('applies patch fields to the job', () => {
    const job = createJob();
    const updated = updateJob(job.id, { status: 'processing', message: 'Starting...' });
    expect(updated.status).toBe('processing');
    expect(updated.message).toBe('Starting...');
  });

  it('preserves unchanged fields', () => {
    const job = createJob();
    const updated = updateJob(job.id, { status: 'processing' });
    expect(updated.id).toBe(job.id);
    expect(updated.createdAt).toBe(job.createdAt);
    expect(updated.videoUri).toBeNull();
  });

  it('updates updatedAt timestamp', async () => {
    const job = createJob();
    // Ensure at least 1ms passes
    await new Promise((resolve) => setTimeout(resolve, 2));
    const updated = updateJob(job.id, { status: 'done' });
    expect(updated.updatedAt).toBeGreaterThanOrEqual(job.updatedAt);
  });

  it('reflects the update when retrieved via getJob', () => {
    const job = createJob();
    updateJob(job.id, { status: 'done', videoUri: 'https://example.com/video.mp4' });
    const fetched = getJob(job.id);
    expect(fetched.status).toBe('done');
    expect(fetched.videoUri).toBe('https://example.com/video.mp4');
  });

  it('returns null for a non-existent id', () => {
    expect(updateJob('ghost-id-00000000', { status: 'done' })).toBeNull();
  });
});

describe('cleanupJobs', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('removes jobs whose updatedAt is older than 15 minutes', () => {
    const job = createJob();
    expect(getJob(job.id)).not.toBeNull();

    jest.advanceTimersByTime(15 * 60 * 1000 + 1);
    cleanupJobs();

    expect(getJob(job.id)).toBeNull();
  });

  it('keeps jobs updated within the last 15 minutes', () => {
    const job = createJob();

    jest.advanceTimersByTime(10 * 60 * 1000);
    cleanupJobs();

    expect(getJob(job.id)).not.toBeNull();
  });

  it('removes expired job but keeps a fresh one', () => {
    const oldJob = createJob();

    jest.advanceTimersByTime(15 * 60 * 1000 + 1);

    const newJob = createJob();

    cleanupJobs();

    expect(getJob(oldJob.id)).toBeNull();
    expect(getJob(newJob.id)).not.toBeNull();
  });
});
