const ExpressError = require('../utils/ExpressError')
const { reviewSchema } = require('../validationSchemas')

const validateReview = (req, res, next) => {
    const {id} = req.params;
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        req.flash('error', msg)
        res.redirect(`/campgrounds/${id}`)
    } else {
        next()
    }
}
module.exports = validateReview;
