function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'not_found',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) {
    console.error('[server:error]', err);
  }
  res.status(status).json({
    error: status >= 500 ? 'internal_error' : 'request_error',
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
