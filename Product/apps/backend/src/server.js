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
});
