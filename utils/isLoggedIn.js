const isLoggedIn = (req, res, next) => {
    req.session.returnTo = req.originalUrl;
    if (!req.isAuthenticated()) {
        req.flash('error', 'Sorry, you must be signed in to access this page.')
        res.redirect('/login')
    }
    next();
}
module.exports = isLoggedIn;
