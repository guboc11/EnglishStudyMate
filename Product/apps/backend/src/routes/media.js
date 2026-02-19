const express = require('express');
const { generateImage } = require('../providers/geminiImage');
const { generateVideo, streamVideo } = require('../providers/geminiVideo');
const { createJob, getJob, updateJob } = require('../lib/jobs');

const router = express.Router();

router.post('/image', async (req, res, next) => {
  try {
    const expression = String(req.body?.expression || '').trim();
    const story = String(req.body?.story || '').trim();
    const pageKey = String(req.body?.pageKey || '').trim();

    if (!expression || !story || !pageKey) {
      res.status(400).json({ error: 'invalid_input', message: 'expression, story, pageKey are required' });
      return;
    }

    const uri = await generateImage({ expression, story, pageKey });
    res.json({ uri });
  } catch (error) {
    next(error);
  }
});

router.post('/video/jobs', (req, res) => {
  const expression = String(req.body?.expression || '').trim();
  const story = String(req.body?.story || '').trim();

  if (!expression || !story) {
    res.status(400).json({ error: 'invalid_input', message: 'expression and story are required' });
    return;
  }

  const job = createJob();
  updateJob(job.id, { status: 'processing' });

  (async () => {
    try {
      const uri = await generateVideo({ expression, story });
      updateJob(job.id, { status: 'ready', videoUri: uri, message: null });
    } catch (error) {
      updateJob(job.id, {
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  })();

  res.status(202).json({ jobId: job.id, status: 'processing' });
});

router.get('/video/jobs/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: 'job_not_found', message: 'Video job not found' });
    return;
  }

  res.json({
    jobId: job.id,
    status: job.status,
    message: job.message,
  });
});

router.get('/video/jobs/:jobId/stream', async (req, res, next) => {
  try {
    const job = getJob(req.params.jobId);
    if (!job) {
      res.status(404).json({ error: 'job_not_found', message: 'Video job not found' });
      return;
    }

    if (job.status !== 'ready' || !job.videoUri) {
      res.status(409).json({ error: 'job_not_ready', message: 'Video is not ready yet' });
      return;
    }

    await streamVideo(job.videoUri, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
