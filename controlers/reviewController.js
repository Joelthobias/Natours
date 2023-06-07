const { query } = require('express');
const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError');
const Review = require('../models/reviewModel');
const factory=require('./../controlers/handleFactory');


module.exports.getAllReview=factory.getAll(Review)
module.exports.setTourUserId=((req,res,next)=>{
    if(!req.body.user) req.body.user=req.user._id
    if(!req.body.tour)req.body.tour=req.params.tourId;
    next(); 
});
exports.addReview=factory.CreateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview=factory.getOne(Review)
