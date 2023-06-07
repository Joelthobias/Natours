const express = require("express");
const morgan = require('morgan');
const app = express();
const path=require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser=require('cookie-parser')
const Handlebars=require('handlebars')

const AppError = require('./utils/appError');
const authController=require('./controlers/authController');

const globalErrorHandler = require('./controlers/errorController');

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'hbs');


// Security - HTTPS header
app.use(helmet());


const viewRoter = require('./routes/viewRoute');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// Limits requests from Same IP
const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message: 'Too many requests from this IP plese try again after a hour ',
});
app.use('/api', limiter);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Logging Routes
app.use(morgan('dev'));

// Body Parser, reading data from body into req.body
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

// Data sanitation against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({
  whitelist:['duration','ratingsAverage','ratingsQuantity','maxGroupSize','difficulty','price']
}));
app.use((req,res,next)=>{
  console.log(req.cookies);
  next();
})

app.use('/',viewRoter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review',reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the current server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
