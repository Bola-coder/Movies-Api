const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user should have a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A user should have an email"],
    unique: [true, "Email addresses should be unique for each user"],
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter a password for user"],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please enter a password for user"],
    validate: {
      validator: function (element) {
        return element === this.password;
      },
      message: "Passwords do not match.",
    },
  },
});

// Hash the password;
userSchema.pre("save", (next) => {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

const Users = mongoose.model("Users", userSchema);

module.exxports = Users;
