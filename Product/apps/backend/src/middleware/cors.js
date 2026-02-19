const cors = require('cors');

function buildCors() {
  const raw = process.env.ALLOWED_ORIGINS || '';
  const allowList = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowList.length === 0) {
    return cors({ origin: true, credentials: false });
  }

  return cors({
    origin(origin, callback) {
      if (!origin || allowList.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: false,
  });
}

module.exports = {
  buildCors,
};
