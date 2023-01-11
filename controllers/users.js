const User = require('../models/user')

module.exports.signUpForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({email, username})
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', `Welcome to YelpCamp, ${registeredUser.username}!`)
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.loginForm = (req, res) => {
    console.log(req.session.returnTo)
    res.render('users/login')
}
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!')
    const prevPage = req.session.returnTo || '/campgrounds'
    res.redirect(prevPage)

}

module.exports.logout = (req, res, next) => {
    req.logout((err) => next(err));
    req.flash('success', 'Successfully signed out')
    res.redirect('/campgrounds')
}
