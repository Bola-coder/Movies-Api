const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `${err.value} is not a valid ${err.path}`;
  return new AppError(message, 401);
};

const handleDuplicateFieldErrorDB = (err) => {
  const dupKey = Object.keys(err.keyValue)[0];
  const dupValue = Object.values(err.keyValue)[0];
  const message = `"${dupKey}" field with "${dupValue}" exists already.`;
  return new AppError(message, 401);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((err) => err.message);
  const message = `Inalid input data: ${errors.join(". ")}.`;
  return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      lol: "EWEEEEEE",
    });
  } else {
    console.error("An Error Occurred", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = JSON.parse(JSON.stringify(err));
    // Checking for error type and handling errors based on the type
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldErrorDB(error);
    }
    if (err.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    sendErrorProd(error, res);
  }
  next();
};
