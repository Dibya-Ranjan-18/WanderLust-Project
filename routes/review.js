const express = require("express");
const router = express.Router({ mergeParams: true }); 
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const{isLoggedIn}= require("../middleware.js");
const {validateReview, isReviewAuthor} = require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

// CREATE REVIEW
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReviews));

// DELETE REVIEW
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;
