// HERE ARE THE MODULES WE USE DO NOT TOUCH
var express = require('express');
var router = express.Router();
var session = require("express-session");
var path = require('path');
var crypto = require('crypto');
var mongoose = require('mongoose');
var multer = require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var stripe = require("stripe")("sk_test_95zmCFtr3vHOffkw0DEfXiiI");

// il faut ajouter stripe (voir credentials sur Slack)
// HERE ARE THE MODULES WE USE

router.post('/trip', function(req, res, next) {
  var stripe = require("stripe")("sk_test_95zmCFtr3vHOffkw0DEfXiiI");
  const token = req.body.stripeToken;
  const charge = stripe.charges.create({
  amount: 999,
  currency: 'eur',
  description: 'Example charge',
  source: token,
  });


  res.render('confirmation');
});



// HERE IS THE CONNECTION TO OUR MLAB DATABASE
var options = { server: { socketOptions: {connectTimeoutMS: 5000 } }};
mongoose.connect('mongodb://capsule:azerty@ds139459.mlab.com:39459/waildeproject',
    options,
    function(err) {
     console.log(err);
    }
);
// HERE IS THE CONNECTION TO OUR MLAB DATABASE



// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************


// 1) Schéma Collection partner

var partnerSchema = mongoose.Schema({
    email: String,
    password: String,
    salutation: String,
    lastname: String,
    firstname: String,
    company: String
});

var patnerModel = mongoose.model('partners', partnerSchema);



// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************



// 2) Schéma Collection user


var userSchema = mongoose.Schema({
    email: String,
    password: String,
    salutation: String,
    lastname: String,
    firstname: String,
    company: String
});

var userModel = mongoose.model('users', userSchema);




// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************








// 3) Schéma Collection trips
var userSchema = mongoose.Schema({
    salutation: String,
    lastName: String,
    firstName: String,
    company: String,
    triptitle: String,
    tripdesc: String,
    location: String,
    theme: String,
    difficulty: String,
    budget: Number,
    duration: String,
    startdate: String,
    enddate: String,
    team: Number,
    file: String,
    file2: String
});





// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************
// ****************************************************************








// GOOGLE MAP API



var map;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });
      }


// HERE ARE THE NAVBAR LINKS
/* GET squeleton page. */
router.get('/', function(req, res, next) {
  res.render('squeleton');
});




/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('home');
});





/* GET search page with ALL CARDS */
router.get('/search-trip', function(req, res, next) {
  res.render('search-trip');
});

/* GET trip page with ONE CARD (selected trip) */
router.get('/trip', function(req, res, next) {
  res.render('trip');
});




/* GET experience page. */
router.get('/experience', function(req, res, next) {
  res.render('experience');
});

/* GET partner form. */
router.get('/partner', function(req, res, next) {
  res.render('partner');
});
// HERE ARE THE NAVBAR LINKS



// HERE ARE THE SIGN-IN & SIGN-UP ROUTES
router.post('/signin', function(req, res, next) {
  res.render('search-trip');
});

router.post('/signup', function(req, res, next) {
  res.render('search-trip');
});


// HERE ARE THE SIGN-IN & SIGN-UP ROUTES

router.post('/signup', function(req, res, next) {

  userModel.find(
      { email: req.body.email} ,
      function (err, users) {
        if(users.length == 0) {

        var newUser = new userModel ({
         name: req.body.name,
         email: req.body.email,
         password: req.body.password
         salutation: req.body.salutation,
         lastname: req.body.lastname,
         firstname: req.body.firstname,
         company: req.body.company

        });
        newUser.save(
          function (error, user) {
            req.session.user = user;
            CityModel.find(
                 {user_id: req.session.user._id},
                 function (error, cityList) {
                   res.render('index', { cityList, user : req.session.user });
                 }
             )
          }
        );
      } else {
        res.render('login');
      }
    }
  );
});



/* GET partner form. */
router.get('/confirmation', function(req, res, next) {
  res.render('confirmation');
});










module.exports = router;
