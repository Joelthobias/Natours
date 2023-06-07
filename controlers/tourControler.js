const { query } = require('express');
const Tour = require('../models/tourModel');
const catchAsync=require('../utils/catchAsync')
const factory=require('./../controlers/handleFactory');



exports.alaiasTopTours=(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,summary,ratingsAverage,difficulty';
    next();
}; 
exports.getAllTours =factory.getAll(Tour)

exports.CreateToure =factory.CreateOne(Tour);

exports.ViewTour =factory.getOne(Tour,{path:'reviews'})
exports.updateTour =factory.updateOne(Tour);
exports.DeleteTour=factory.deleteOne(Tour);

exports.getTourStats=catchAsync(async (req,res,next)=>{
        const stats = await Tour.aggregate([
            {
                $match: {
                ratingsAverage: {
                    $gte: 4.5,
                },
                },
            },
            {
                $group: {
                _id: {$toUpper:'$difficulty'},
                numTours:{
                    $sum:1
                },
                numRating:{
                    $sum:'$ratingsQuantity'
                },
                avgRating: {
                    $avg: '$ratingsAverage', // Remove quotes around field name
                },
                avgPrice: {
                    $avg: '$price', // Remove quotes around field name
                },
                minPrice: {
                    $min: '$price', // Remove quotes around field name
                },
                maxPrice: {
                    $max: '$price', // Remove quotes around field name
                },
                },
            },{
                $sort:{avgPrice:-1}
            },
            // {
            //     $match:{
            //         _id:{
            //             $ne:'EASY'
            //         }
            //     }
            // }            
        ]);
        // .sort('-difficulty');

        res.status(200).json({
            'status': 'Success',
            'data': {
                stats
            }
        });
})
exports.getMonthlyPlan=catchAsync(async (req,res,next)=>{
        const year=req.params.year*1;
        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },{
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },{
                $group:{
                    _id:{$month:'$startDates'},
                    numTour:{$sum:1},
                    name:{$push:'$name'}
                }
            },{
                $addFields:{
                    month:'$_id'
                }
            },{
                $project:{
                    _id:0
                }
            },{
                $sort:{numTours:1}
            }
        ])
        res.status(200).json({
            'status': 'Success',
            'data': {
                plan
            }
        });
    })