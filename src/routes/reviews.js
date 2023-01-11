const express = require('express');
const router = express.Router( { mergeParams: true } );
const asyncHandler = require('../utils/asyncHandler');
const Campground = require('../../models/campground');
const Review = require('../../models/review')
const isLoggedIn = require('../utils/isLoggedIn');
const isReviewAuthor = require('../utils/isReviewAuthor')
const validateReview = require('../utils/validateReview')
const reviews = require('../../controllers/reviews')

router.post('/', isLoggedIn, validateReview, asyncHandler(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, asyncHandler(reviews.deleteReview))



module.exports = router;
