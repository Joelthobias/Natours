const express = require("express");
const userController=require('../controlers/userControler');
const authController=require('../controlers/authController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.verifyLogin)

router.patch('/updatePassword',authController.updatePassword);

router.patch('/updateMe',userController.uploadUserPhoto,userController.UpdateMe);
router.delete('/deleteMe',userController.deleteMe);

router.get('/me',userController.getMe,userController.ViewUser);


router.route('/') .get(authController.restictTo('admin','lead-guide'),userController.getAllUsers)
router.route('/:id')
    .get(userController.ViewUser)
    .delete(userController.deleteUser)
    .patch(userController.updateUser)

module.exports = router;
