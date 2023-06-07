const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'prod') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user: user,
    },
  });
  console.log(res.data);
};
exports.logout = (req, res) => {
  res.clearCookie('jwt'); // Clear the JWT cookie
  res.status(200).json({ status: 'Success' });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createAndSendToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);

  // Check both the email and password exist
  if (!email || !password) {
    return next(new AppError('Please enter email and password', 400));
  }

  // Find User
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.VerifyPass(password, user.password))) {
    return next(new AppError('Invalid Email or Password', 401));
  }
  // Send token back
  createAndSendToken(user, 200, res);
});

exports.verifyLogin = catchAsync(async (req, res, next) => {
  let token;

  // Getting Token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in and try again later', 401));
  }

  try {
    // Verifying Token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // finding the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user associated with this token no longer exists', 401));
    }

    // Check if the user changed the password after token creation
    if (user.changePassAfter(decoded.iat)) {
      return next(new AppError('Password was recently changed. Please log in again', 401));
    }

    // Grant Access
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again', 401));
  }
});






exports.isLoggedIn = async (req, res, next) => {
  if(req.cookies.jwt){
    try{
      const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      
      // finding the user
      const freshUser = await User.findById(decode.id);
      if (!freshUser) {
        next();
      }
      // Check if the user changed the password after Token Creation
      if (freshUser.changePassAfter(decode.iat)) {
        next();
      }
      
      // 
      res.locals.user=freshUser;
      req.user=freshUser
      return next();
    }catch(err){
      next();
    }
  }
  next();
};





exports.restictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Invalid email id', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const msg = `Forgot your password! Use this link ${resetUrl} to reset your password. It will expire in 10 minutes...`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Your Password - Link Will Expire in 10 minutes',
      message: msg,
      url: resetUrl,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Reset link is sent to email',
    });
  } catch (err) {
    user.passwordRestToke = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new AppError('There was an error in sending the email. Please try again later', 500));
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hash = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hash,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Invalid or expired token', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!await user.VerifyPass(req.body.currentPassWord, user.password)) {
    return next(new AppError('Wrong Password', 400));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createAndSendToken(user, 200, res);
});
