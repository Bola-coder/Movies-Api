const express = require("express");
const movieController = require("./../controllers/movieController");

const router = express.Router();

router
  .route("/cheap-movies")
  .get(movieController.cheapMovies, movieController.getAllMovies);

router.route("/movie-stat").get(movieController.getMovieStats);
router
  .route("/")
  .get(movieController.getAllMovies)
  .post(movieController.createNewMovie);

router
  .route("/:id")
  .get(movieController.getMovie)
  .patch(movieController.updateMovie)
  .delete(movieController.deleteMovie);
module.exports = router;
