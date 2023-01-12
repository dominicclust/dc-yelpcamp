const mongoose = require('mongoose')
const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const Review = require('../models/review')
const User = require('../models/user')
const cities = require('./cities')
const {descriptors, places} = require('./seedHelpers')


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'database connection error'))
db.once('open', () => {
    console.log('database connected')
});

const sample = array => array[Math.floor(Math.random() * array.length)]
const seedDB = async () => {
    await Campground.deleteMany({})
    await Review.deleteMany({})
    for (let i = 0; i < 1000; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            //YOUR USER ID
            author: '6387d15efd0918658dc3ec99',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price: Math.floor(random1000/4 + 10),
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/do6zpracb/image/upload/v1672714624/YelpCamp/x97hkwt2loa1odzqadlj.jpg',
                    filename: 'YelpCamp/x97hkwt2loa1odzqadlj'
                },
                {
                    url: 'https://res.cloudinary.com/do6zpracb/image/upload/v1671233304/YelpCamp/ihfz2sf6nybezaz2luup.jpg',
                    filename: 'YelpCamp/ihfz2sf6nybezaz2luup'
                }
            ]
        })
        await camp.save()
    }
}
seedDB().then(() => mongoose.connection.close())
