function sendSuccess(res, message, data, status = 200, meta) {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
}

function sendError(res, message, status = 500, code = 'INTERNAL_ERROR', details) {
  const payload = {
    success: false,
    message,
    error: {
      code
    }
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(status).json(payload);
}

module.exports = {
  sendSuccess,
  sendError
};
