const catchAsync=require('./../utils/catchAsync');
const Tour=require('./../models/tourModel')
const User=require('./../models/userModel')
const authController=require('../controlers/authController');
const AppError = require('../utils/appError');

exports.getOverView=(req,res)=>{
    res.status(200).json({
        status:'Sucess'
    })
};
exports.getTours=async (req,res,next)=>{
    
    const tours=await Tour.find();
    if(!tours){
        return next(new AppError('No tour found ',404))
    }
    tours.map(el=>{
        for (let i = 0; i < el.startDates.length; i++) {
            el.startDates[i] =el.startDates[i].toLocaleString('en-US',{month:'long',year:'numeric'});
        }
        return el.startDates
    })
    res.status(200).set(
      "Content-Security-Policy",
      "connect-src 'self' https://cdnjs.cloudflare.com"
    ).render('tours',{
        tours
    })
};
exports.getTour=async (req,res,next)=>{
    let tour=await Tour.find({slug:req.params.slug}).populate({path:'reviews'})
    console.log(tour);
    tour=tour[0]
    if(!tour){
        return next(new AppError('Invalid Tour ',404))
    }
    for (let i = 0; i < tour.startDates.length; i++) {
        tour.startDates[i] =tour.startDates[i].toLocaleString('en-US',{month:'long',year:'numeric'});
    }
    res.status(200).set(
      "Content-Security-Policy",
      "connect-src 'self' https://cdnjs.cloudflare.com"
    ).render('tour',{
        tour
    })
}
exports.getAll=(req,res)=>{
    res.status(200).json({
        status:'Sucess'
    })
};
exports.getLoginForm=(req,res)=>{
    console.log("Login form")
    res.status(200).set(
      "Content-Security-Policy",
      "connect-src 'self' https://cdnjs.cloudflare.com"
    ).render('login',{
        title:'log into your account'
    })
}
exports.getMe=async(req,res)=>{
    let Query = User.findById(req.params.id);
    user=await Query;
    let admin=undefined;
    console.log(user);
    if(user.role==='admin'){
        admin=true;
    }
    res.status(200).set(
      "Content-Security-Policy",
      "connect-src 'self' https://cdnjs.cloudflare.com"
    ).render('profile',{
        user,
        admin
    })
};

exports.updUserData=async(req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.user._id,{
        name:req.body.uName,
        email:req.body.email
    },{
        new:true,
        runValidators:true
    })
    res.redirect('/me')
    // res.status(200).set(
    //   "Content-Security-Policy",
    //   "connect-src 'self' https://cdnjs.cloudflare.com"
    // ).render('profile',{
    //     user
    // });
}