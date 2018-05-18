// HERE ARE THE MODULES WE USE
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


// HERE IS THE CONNECTION TO OUR MLAB DATABASE
var options = { server: { socketOptions: {connectTimeoutMS: 5000 } }};
mongoose.connect('mongodb://capsule:azerty@ds139459.mlab.com:39459/waildeproject',
    options,
    function(err) {
     console.log(err);
    }
);
// HERE IS THE CONNECTION TO OUR MLAB DATABASE


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


/* GOOGLE MAP */

var map;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 8
        });
      }




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


/* GET partner form. */
router.get('/confirmation', function(req, res, next) {
  res.render('confirmation');
});




// HERE ARE THE IS THE STRIPE PAY ROUTE

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


module.exports = router;
