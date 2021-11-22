const express = require("express");
const movieRouter = require("./routes/movieRoute");
const morgan = require("morgan");
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

module.exports = app;
