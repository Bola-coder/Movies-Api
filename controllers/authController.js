const { promisify } = require("util");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");

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

// Forgot password functionality:
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Find user based on email addres
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("Email address is not valid", 400));

  // Generate token for user
  const resetToken = user.generateResetToken();
  // Save resetToken to db.
  await user.save({ validateBeforeSave: false });

  // Send resetToken to user's mail.
  const resetUrl = `${req.protocol}://${req.get(
    host
  )}/api/v1/users/resetPasswrd/${resetToken};`;

  const message = `Find below the link to reset your password for your Movies API account. ${resetUrl}. Please disregard this email if you didn't initiate this action.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Link",
      message,
    });
    res.status.send(200).json({
      status: "success",
      message: "Password reset token sent to email successfully",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);

    return next(
      new AppError(
        "There was an error sending the email. Please try again",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //  1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  // 2. If token hasn't expired and and there is a user, set the new password.
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  // 4. Log user in. Send JWT.
  const token = signToken(user._id);
  res.status(200).json({
    ststus: 'success',
    token,
  });
});
