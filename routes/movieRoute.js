const express = require("express");
const movieController = require("./../controllers/movieController");
const authController = require("./../controllers/authController");
const router = express.Router();

router
  .route("/cheap-movies")
  .get(movieController.cheapMovies, movieController.getAllMovies);

router.route("/movie-stat").get(movieController.getMovieStats);
router
  .route("/")
  .get(authController.protectRoute, movieController.getAllMovies)
  .post(
    authController.protectRoute,
    authController.restrictedTo("admin", "moderator"),
    movieController.createNewMovie
  );

router
  .route("/:id")
  .get(authController.protectRoute, movieController.getMovie)
  .patch(
    authController.protectRoute,
    authController.restrictedTo("admin", "moderator"),
    movieController.updateMovie
  )
  .delete(
    authController.protectRoute,
    authController.restrictedTo("admin"),
    movieController.deleteMovie
  );
module.exports = router;
