const crypto = require("crypto");
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

// Hash the password;
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// Method to check user password input and compare with password in db
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if password has been changed after token was issued
userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 100,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
