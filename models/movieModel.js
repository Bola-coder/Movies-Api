const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A movie should have a name"],
    unique: [true, "Two Movies should not have the same name"],
    trim: true,
  },
  producedBy: {
    type: String,
    required: [true, "A movie should have a producer"],
  },
  directedBy: {
    type: String,
    required: [true, "A movie should have a director"],
  },
  price: {
    type: Number,
    required: [true, "A Movie should have a price"],
  },
  completed: {
    type: Boolean,
    required: [true, "Specify if the movie is completed or not"],
  },
  cast: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
