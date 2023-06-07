const express = require("express");
const tourController=require('../controlers/tourControler');
const router = express.Router();
const authController=require('../controlers/authController');
const reviewRouter=require('./../routes/reviewRoutes')



router.use('/:tourId/review',reviewRouter);


// router.param('id',tourController.CheckID);
router.route('/top-5-Cheap').get(tourController.alaiasTopTours, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)

router.use(authController.isLoggedIn)
router.route('/')
    .get( tourController.getAllTours)
    .post(tourController.CreateToure);

router.route('/:id') 
    .get(tourController.ViewTour)
    .patch( tourController.updateTour)
    .delete( tourController.DeleteTour);

module.exports = router;
