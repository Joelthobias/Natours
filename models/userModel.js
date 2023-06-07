const mongoose = require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');
const crypto=require('crypto')


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must provide a name.'],
    trim: true,
    minlength: [5, 'The name must be at least 5 characters long.'],
    maxlength: [50, 'The name cannot exceed 50 characters.']
  },
  email: {
    type: String,
    required: [true, 'Please Provide a Email'],
    unique: [true, 'A tour must have a name'],
    trim: true,
    lowercase: true,
    validate:[validator.isEmail,'Provide A Valid Email']
  },
  photo: {
    type: String
  },
  role:{
    type:String,
    enum:['user','admin','guide','lead-guide'],
    default:'user'
  },
  password: {
    type: String,
    required: [true, 'A user must provide a password.'],
    minlength: [8, 'The password must be at least 8 characters long.'],
    select:false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'The passwords do not match.'
    }
  },
  active:{
    type:Boolean,
    default:true,
    select:false
  },
  passwordChanged:Date,
  passwordResetToken:String,
  passwordResetExpires:Date,
});

userSchema.pre(/^find/,function(next) {
  this.find({active:{$ne:false}});
  next();
})
userSchema.pre('save', async function (next) {
  console.log('Encrypting ............... ');

  // Only run the function if the password field is modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with a cost factor of 12 using bcrypt
  this.password = await bcrypt.hash(this.password,12);
  if(!this.isNew){
    this.passwordChanged=Date.now()-1000;
  };
  // Delete the passwordConfirm field to avoid storing it in the database
  this.passwordConfirm = undefined;

  next();
});

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')||this.isNew) return next();
//   this.passwordChanged=Date.now();
//   next();
// });

userSchema.methods.changePassAfter=function (JWTTimestamp) {
  if(this.passwordChanged){
    const changeTimeStamp=parseInt(this.passwordChanged.getTime()/1000,10);

    return JWTTimestamp < changeTimeStamp;
  }  
  return false;
}


// Verify paswsword
userSchema.methods.VerifyPass=async function(canadiatePass,userPass) {
  return await bcrypt.compare(canadiatePass,userPass)
} 

// 
userSchema.methods.createPasswordResetToken=function () {
  const resetToken=crypto.randomBytes(32).toString('hex');
  this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires=Date.now()+10*60*1000;
  console.log({resetToken},this.passwordResetExpires);
  return resetToken;
}
const User = mongoose.model('User', userSchema);

module.exports = User;
