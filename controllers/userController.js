const catchAsync = require("./../utils/catchAsync");

exports.getAllUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "All Users will be displayed here",
  });
});
