const crypto = require('crypto');

const JOB_TTL_MS = 15 * 60 * 1000;
const jobs = new Map();

function createJob() {
  const id = crypto.randomUUID();
  const now = Date.now();
  const job = {
    id,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    videoUri: null,
    message: null,
  };
  jobs.set(id, job);
  return job;
}

function getJob(id) {
  return jobs.get(id) || null;
}

function updateJob(id, patch) {
  const current = jobs.get(id);
  if (!current) return null;

  const next = {
    ...current,
    ...patch,
    updatedAt: Date.now(),
  };
  jobs.set(id, next);
  return next;
}

function cleanupJobs() {
  const now = Date.now();
  for (const [id, job] of jobs.entries()) {
    if (now - job.updatedAt > JOB_TTL_MS) {
      jobs.delete(id);
    }
  }
}

module.exports = {
  createJob,
  getJob,
  updateJob,
  cleanupJobs,
};
