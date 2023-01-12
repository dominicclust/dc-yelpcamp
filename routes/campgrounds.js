const express = require('express')
const campgrounds = require('../controllers/campgrounds')
const asyncHandler = require('../utils/asyncHandler')
const router = express.Router();
const isLoggedIn = require('../utils/isLoggedIn')
const isAuthor = require('../utils/isAuthor')
const validateCampground = require('../utils/validateCampground')
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({ storage })

router.get('/new', isLoggedIn, campgrounds.newForm)

router.get('/:id/edit', isLoggedIn, isAuthor, asyncHandler (campgrounds.editForm))

router.route('/:id')
    .get(asyncHandler(campgrounds.showCamp))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, asyncHandler(campgrounds.editCamp))
    .delete(isLoggedIn, isAuthor, asyncHandler(campgrounds.deleteCamp))

router.route('/')
    .post(isLoggedIn, upload.array('image'), validateCampground, asyncHandler(campgrounds.createCamp))
    .get(asyncHandler (campgrounds.index) )

module.exports = router;
