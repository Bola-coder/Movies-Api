const Movie = require("./../models/movieModel");
const ApiFeatures = require("./../utils/apiFeatures");

exports.cheapMovies = (req, res, next) => {
  req.query.limit = 5;
  req.query.price = { lte: "1500" };
  req.query.sort = "price";
  console.log(req.query);
  next();
};

exports.createNewMovie = async (req, res) => {
  try {
    const newMovie = await Movie.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        movie: newMovie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "Failed",
      message: err,
    });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "Failed",
      message: err,
    });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        movie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "Failed",
      message: err,
    });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    console.log(updatedMovie);
    res.status(200).json({
      status: "success",
      data: {
        movie: updatedMovie,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "Failed",
      message: err,
    });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "Failed",
      message: err,
    });
  }
};

exports.getMovieStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: "Failed",
      message: err.message,
    });
  }
};
