const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  console.log('handleCastErrorDB');
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  console.log('handleDuplicateFieldsDB');
  const keys = Object.keys(err.keyPattern);
  const message = `Duplicate Field Value: ${err.keyValue[keys[0]]}, Please use another value for ${keys[0]}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  console.log('handleValidationErrorDB');
  const message = `Invalid Input Data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError=err=>new AppError('Invalid Token ! . Please login again ',401);
const handleJWTexp=err=>new AppError('The token has expired ! . Please login again ',401);

// Response Sending 

const devError = (err,req, res) => {
  // for API
  if(req.originalUrl.startsWith('/api')){
    console.log(err.statusCode);
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    
  }
  // For renderd Website
  return res.status(err.statusCode).render('error',{
    title:'Somthing off',
    msg:err.message
  })
  
};

const proError = (err,req, res) => {
  // FOR API
  if(req.originalUrl.startsWith('/api')){
    // Known Error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } 
    // for Unknown Errors
    console.log(err);
    return res.status(500).json({
      status: 'fail',
      message: 'Something went wrong',
    });
    
  }
    // Renderd Website 
    // Known Error
    if (err.isOperational) {
      return res.status(err.statusCode).render('error',{
        title:'Somthing off',
        msg:err.message
      })
    } 

    // for Unknown Errors
    console.log(err);
    return res.status(err.statusCode).render('error',{
      title:'Somthing off',
      msg:'Please Try again later !'
    })
    
  
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'dev') {
    console.log(process.env.NODE_ENV, 'deverror');
    console.log(err);
    devError(err,req, res);
  } else if (process.env.NODE_ENV === 'pro') {
    let error = err;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if(err.name==='JsonWebTokenError')error=handleJWTError(error);
    if(err.name==='TokenExpiredError')error=handleJWTexp(error);
    console.log('proerror');
    proError(error,req, res);
  }
};
 