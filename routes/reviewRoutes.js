const express = require("express");
const router = express.Router({mergeParams:true});
const { restictTo, verifyLogin} = require('../controlers/authController');
const reviewController=require('../controlers/reviewController');


router.use(verifyLogin);
// add and find reviews to tours
router.route('/')
    .post(reviewController.setTourUserId, reviewController.addReview)
    .get(reviewController.getAllReview)

router.use(restictTo('user','admin'))
// Update delete and get reviews personally
router.route('/:id')
    .get(reviewController.getReview)
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview )


// router.route('/byUser/:user')
//     .get(reviewController.getReviewByUser)

module.exports = router;

