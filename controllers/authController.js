const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(200).json({
    status: "success",
    token,
    data: {
      newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please enter a email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("No token found. Please login to get a token", 401)
    );
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // Check if user with token still exists:
  const id = decoded.id;
  const currentUser = await User.findById(id);
  if (!currentUser) {
    return next(
      new AppError("User with this token doesn't exist anymore", 401)
    );
  }

  // 4. Check if user changed password after token was issued
  if (!currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User password has been changed. Please login to get a new token",
        401
      )
    );
  }

  // Assign current user to the req object
  req.user = currentUser;
  next();
});

// Restrict some routes to specific roles
exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to visit this route", 401)
      );
    }
    next();
  };
};
