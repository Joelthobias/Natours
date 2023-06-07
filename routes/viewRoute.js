const express=require('express');
const router=express.Router();
const viewController=require('./../controlers/viewController')
const authController=require('../controlers/authController');
const userController=require('../controlers/userControler');
router.use(authController.isLoggedIn)
router.get('/',viewController.getTours);
router.get('/login',viewController.getLoginForm)
router.get('/overView',viewController.getTours)
router.get('/tour/:slug',viewController.getTour);

// router.use(authController.verifyLogin)
router.get('/me',userController.getMe,viewController.getMe);
router.post('/updateData',viewController.updUserData);
module.exports=router;