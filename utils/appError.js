class AppError extends Error {
  contructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.status = this.statusCode.startsWith("4") ? "fail" : "err";
    this.isOperational = true;

    Error.captureStackTrace(this, this.contructor);
  }
}

module.exports = AppError;
