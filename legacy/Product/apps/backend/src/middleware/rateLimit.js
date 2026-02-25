const rateLimit = require('express-rate-limit');

function buildRateLimit() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX || 40);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Please try again shortly.',
    },
  });
}

module.exports = {
  buildRateLimit,
};
