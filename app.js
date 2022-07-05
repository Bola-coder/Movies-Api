const express = require("express");
const movieRouter = require("./routes/movieRoute");
const userRouter = require("./routes/userRoute");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const errorHandler = require("./controllers/errorController");
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/users", userRouter);

// Error 404 messgae for undefined routes
app.all("*", (req, res, next) => {
  const error = new AppError(
    `Cant find ${req.originalUrl} on this server`,
    404
  );
  next(error);
});

// Global error handling middleware
app.use(errorHandler);
module.exports = app;
