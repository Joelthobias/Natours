const { query } = require('express');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory=require('./../controlers/handleFactory');
const multer = require('multer');

const multerStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'public/img/users')
  },
  filename:(req,file,cb)=>{
    const ext=file.mimetype.split('/')[1];
    cb(null,`user-${req.user._id}-${Date.now()}.${ext}`)
  }
})
const multerFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }else{
    cb(new AppError('It is not a image . Please Uplaod a image file !',400),false)
  }
}

const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
})
exports.uploadUserPhoto=upload.single('photo');

const filterObj=(obj,...allowedFields)=>{
  const newObj={};
  Object.keys(obj).forEach(el=>{
    if(allowedFields.includes(el)) newObj[el]=obj[el];
  })
  return newObj;
}

exports.getMe=(req,res,next)=>{
  console.log(req.user);
  req.params.id=req.user._id;
  next();
}


exports.UpdateMe=catchAsync(async (req, res, next) => {
  if(req.body.password||req.body.passwordConfirm){
    return next(new AppError('This route is not for Password Update Puposes',400))
  }
  // filter data 
  const filterBody=filterObj(req.body,'email','name')
  if(req.file) filterBody.photo=req.file.filename
  console.log(filterBody.email);
  // Update User
  const updateUser=await User.findByIdAndUpdate(req.user._id,filterBody,{
    new:true,
    runValidators:true
  })
  console.log('updated');
   res.status(200).json({
    'status': 'Success',
    data:{
      user:updateUser
    }
  });
});

exports.deleteMe=catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user._id,{active:false});
  res.status(204).json({
    status:'Sucess',
    data:null
  })
});

exports.getAllUsers = factory.getAll(User);

exports.deleteUser=factory.deleteOne(User);

// Do not update password with this user
exports.updateUser=factory.updateOne(User);

exports.ViewUser = factory.getOne(User);

