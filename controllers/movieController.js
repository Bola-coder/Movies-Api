const Movie = require("./../models/movieModel");
const ApiFeatures = require("./../utils/apiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.cheapMovies = (req, res, next) => {
  req.query.limit = 5;
  req.query.price = { lte: "1500" };
  req.query.sort = "price";
  console.log(req.query);
  next();
};

exports.createNewMovie = catchAsync(async (req, res, next) => {
  const newMovie = await Movie.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      movie: newMovie,
    },
  });
});

exports.getAllMovies = catchAsync(async (req, res, next) => {
  // EXECUTING QUERY
  const features = new ApiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .fieldLimit()
    .pagination();
  const movies = await features.query;

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: movies.length,
    data: {
      movies,
    },
  });
});

exports.getMovie = catchAsync(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    return next(new AppError("No movie found with the specified ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      movie,
    },
  });
});

exports.updateMovie = catchAsync(async (req, res, next) => {
  const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedMovie) {
    return next(new AppError("No movie found with the specified ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      movie: updatedMovie,
    },
  });
});

exports.deleteMovie = catchAsync(async (req, res, next) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) {
    return next(new AppError("No movie found with the specified ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMovieStats = catchAsync(async (req, res, next) => {
  const stats = await Movie.aggregate([
    {
      $match: { completed: true },
    },
    {
      $group: {
        _id: "$name",
      },
    },
    {
      $project: {
        name: "$_id",
        releasedSince: { $subtract: [new Date(), "$createdAt"] },
      },
    },
    {
      $sort: { name: 1 },
    },
    {
      $project: { _id: 0 },
    },
  ]);
  res.status(200).json({
    status: "success",
    stats,
  });
});
