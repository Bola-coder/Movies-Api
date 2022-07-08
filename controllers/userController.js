const catchAsync = require("./../utils/catchAsync");
const User = require('./../models/userModel');

exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    status: "success",
   data: {
    user,
   }
  });
});
