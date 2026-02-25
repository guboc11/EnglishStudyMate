const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { buildCors } = require('./middleware/cors');
const { buildRateLimit } = require('./middleware/rateLimit');
const { cleanupJobs } = require('./lib/jobs');
const learningRoutes = require('./routes/learning');
const mediaRoutes = require('./routes/media');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(buildCors());
app.use(morgan('tiny'));
app.use(express.json({ limit: '1mb' }));
app.use(buildRateLimit());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/v1/learning', learningRoutes);
app.use('/api/v1/media', mediaRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const interval = setInterval(cleanupJobs, 60_000);
interval.unref();

app.listen(port, () => {
  console.log(`[backend] listening on :${port}`);

  // Render 무료 플랜 슬립 방지: 5분마다 자기 자신에게 health check
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (selfUrl) {
    setInterval(() => {
      fetch(`${selfUrl}/health`)
        .then(() => console.log('[keep-alive] ping ok'))
        .catch((err) => console.warn('[keep-alive] ping failed:', err.message));
    }, 5 * 60 * 1000);
  }
});
