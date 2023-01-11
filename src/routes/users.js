const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const asyncHandler = require('../utils/asyncHandler')
const passport = require('passport')
const users = require('../../controllers/users')

router.route('/register')
    .get(users.signUpForm)
    .post(asyncHandler (users.register))

router.route('/login')
    .get(users.loginForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout)

module.exports = router;
