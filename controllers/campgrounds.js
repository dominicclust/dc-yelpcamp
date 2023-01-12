const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})
const {cloudinary} = require('../cloudinary')



module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new', {})
}

module.exports.editForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Oops! Looks like that campground does not exist.')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}

module.exports.editCamp = async (req, res, next) => {
    const {id} = req.params;
    let campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...images)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    if (!campground) {
        req.flash('error', 'Oops! Looks like that campground does not exist.')
        return res.redirect(`/campgrounds`)
    }
    await campground.save();

    req.flash('success', `Successfully updated ${campground.title}`)
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCamp = async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted campground.')
    res.redirect('/campgrounds')
}

module.exports.showCamp = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author').populate('images');
    if (!campground) {
        req.flash('error', 'Oops! Looks like that campground does not exist.')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}

module.exports.createCamp = async (req, res) => {
    const geolocation = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = await new Campground(req.body.campground)
    campground.geometry = geolocation.body.features[0].geometry
    campground.images = req.files.map(file => ({url: file.path, filename: file.filename}))
    campground.author = req.user._id;
    await campground.save()
    req.flash('success', `Successfully created ${campground.title}`)
    res.redirect(`/campgrounds/${campground._id}`)
}
