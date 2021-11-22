const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A movie should have a name"],
    unique: [true, "Two Movies should not have the same name"],
  },
  producedBy: {
    type: String,
    required: [true, "A movie should have a producer"],
  },
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
