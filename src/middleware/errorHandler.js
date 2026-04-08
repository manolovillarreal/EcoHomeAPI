const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || 'Internal server error'
  };

  if (process.env.NODE_ENV !== 'production' && error.details) {
    payload.details = error.details;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
