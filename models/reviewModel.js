const mongoose = require('mongoose');
const Tour=require('./tourModel')
const reviewSchema=mongoose.Schema({
    review:{
        type:String,
        required:[true,"A review Can't be empty"],
        minLength:[10,'Review Must include minimum 10 letters ....']
    },
    rating:{
        required:true,
        type:Number,
        minLength:[0.1,'Rating must be At leaste .1'],
        maxLength:[5.0,'Rating shouldnt exceed 5.0']
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"A review must belong to a user "],
    },
    tour:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,"A review must belong to a tour "],
        ref:'Tour'
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  })
//   .populate({
//     path: 'tour',
//     select: 'name'
//   });
  next();
});

reviewSchema.statics.calcAverageRating=async function (tourId) {
    const stats =await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{
                    $avg:'$rating'
                }
            }
        }
    ])
    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId ,{
            ratingsQuantity:stats[0].nRating,
            ratingsAverage:stats[0].avgRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId ,{
            ratingsQuantity:0,
            ratingsAverage:0
        });
    }
};
reviewSchema.index({tour:1,user:1},{unique:true})
reviewSchema.post('save',async function(){
    this.constructor.calcAverageRating(this.tour);
});
reviewSchema.pre(/^findOneAnd/,async function (next) {
    this.r=await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/,async function () {
    await this.r.constructor.calcAverageRating(this.r.tour);
});


const Review=mongoose.model('Review',reviewSchema);

module.exports=Review;