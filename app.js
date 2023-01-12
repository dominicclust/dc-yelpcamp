if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/user')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const users = require('./routes/users')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const MongoStore = require('connect-mongo')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'database connection error'))
db.once('open', () => {
    console.log('database connected')
});

const app = express();
const sessionSecret = process.env.SECRET || 'buildabettersecret!';

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))


const sessionConfig = {
    name: 'session',
    secret: sessionSecret,
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24*3600,
        crypto: {secret: sessionSecret}
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 24 * 7 * 60 * 60,
        maxAge: 1000 * 24 * 7 * 60 * 60
    }
}

app.use(session(sessionConfig))
app.use(flash());

const scriptSrcUrls = [
    "*.bootstrapcdn.com/",
    "api.mapbox.com/",
    "*.mapbox.com/",
    "*.fontawesome.com/",
    "*.cloudflare.com/",
    "cdn.jsdelivr.net/",
    "*.cloudinary.com/do6zpracb/"
];

const styleSrcUrls = [
    "*.fontawesome.com/",
    "api.mapbox.com/",
    "*.googleapis.com/",
    "*.jsdelivr.net/"
];
const connectSrcUrls = [
    "*.mapbox.com/",
    "api.mapbox.com",
    "*.cloudinary.com/do6zpracb/"
];

const imgSrcUrls = [
    "*.cloudinary.com/do6zpracb/",
    "*.unsplash.com/"
];

app.use(helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
        'default-src': ["'self'"],
        'connect-src': ["'self'", ...connectSrcUrls],
        'script-src': ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
        'style-src': ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        'worker-src': ["'self'", "blob:"],
        'child-src': ["blob:"],
        'object-src': ["'self'", "*.cloudinary.com/do6zpracb/"],
        'img-src': ["*.jpg", "*.png", ...imgSrcUrls],
        'media-src': ["*"],
        'font-src': ["'self'"]
    }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
});

app.use('/', users);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "3 lefts were not taken (something ain't right)"
    res.status(statusCode).render('error', {err});
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}!`));
