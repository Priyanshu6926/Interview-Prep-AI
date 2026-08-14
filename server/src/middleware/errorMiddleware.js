export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = error.message || "Something went wrong.";

  if (error.name === "MulterError") {
    statusCode = 400;
    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Maximum PDF resume size is 5MB.";
    }
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    message,
    ...(isProduction ? {} : { stack: error.stack })
  });
}
