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

// var path = require('path');
// var crypto = require('crypto');
// var mongoose = require('mongoose');
// var multer = require('multer');
// var GridFsStorage = require('multer-gridfs-storage');
// var Grid = require('gridfs-stream');
// var bodyParser = require('body-parser');
// var methodOverride = require('method-override');



//
// / SET STORAGE engine
var storage = multer.diskStorage({
  destination: './public/images/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() +
    path.extname(file.originalname));
  }
});

// INIT UPLOAD
var upload = multer({
  storage: storage,
  limits:{fileSize: 4000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('file');

// check file type
function checkFileType(file, cb){
  // Allowed ext
  var filetypes = /jpeg|jpg|png|gif/;
  // check ext
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // check mime type (dans le req.file)
  var mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};


router.post('/upload', function(req, res, next) {
  upload(req, res, (err) => {
    if(err){
        console.log("erreur 1");
        res.redirect('/partner');
    } else {
      console.log(req.file);
      // les infos du req.file sont à mettre dans la data base
      if(req.file == undefined){
        console.log("erreur 2");
        res.redirect('/partner');
      } else {
        req.session.picture = req.file.filename
        console.log("ca a marché!!");
        console.log(req.session.picture);
        res.redirect('/validate-image');
        // pour resrender l'img, bien ajouter le img tag sur le view!!
      }
    }
  });
});


/* GET partner form. */
router.get('/partner', function(req, res, next) {
  res.render('partner');
});

/* GET home page. */
router.get('/validate-image', function(req, res, next) {
  res.render('validate-image', {
    file: '/images/' + req.session.picture
  });
});

// router.get('/add-image', function(req, res, next) {
//   res.render('add-image');
// });

/* GET home page. */
router.post('/add-image', function(req, res, next) {

  var newTrip = new tripModel({
    salutation: "dynamicEmail@gmail.com",
    lastName: "dynamicNom",
    firstName: "dynamicPrenom",
    company: "dynamicNomEntreprise",
    triptitle: req.body.triptitle,
    tripdesc: req.body.tripdesc,
    location: req.body.location,
    theme: req.body.theme,
    difficulty: req.body.difficulty,
    budget: req.body.budget,
    duration: req.body.duration,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    team: req.body.team
  });
  newTrip.save(
    function(error, trip) {
      console.log(trip);
      res.redirect('/search-trip');
    }
  );
});

/* GET home page. */
router.get('/add-image', function(req, res, next) {
  res.render('add-image', {
    file: '/images/' + req.session.picture
  });
});

// router.post('/upload', function(req, res, next) {
//
//   upload(req, res, (err) => {
//     if(err){
//       console.log("Il n'y a pas d'erreur");
//       res.redirect('/partner');
//
//       console.log("Il y a une erreur");
//     } else {
//       // les infos du req.file sont à mettre dans la data base
//       if(req.file == undefined){
//         console.log("le fichier n'est pas défini!!");
//         res.redirect('/partner');
//       } else {
//         console.log(req.file.id);
//         req.session.picture = req.file.id
//         console.log(req.session.picture);
//         console.log("ca a marché!!");
//         res.redirect('/validate-image');
//         // pour resrender l'img, bien ajouter le img tag sur le view!!
//       }
//     }
//   });
// });




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
var tripSchema = mongoose.Schema({
    email: String,
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

var tripModel = mongoose.model('trips', tripSchema);



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
// router.get('/', function(req, res, next) {
//   res.render('squeleton');
// });


// HERE ARE THE SIGN-IN & SIGN-UP ROUTES
router.post('/add-trip', function(req, res, next) {


  var newTrip = new tripModel({
    salutation: "dynamicEmail@gmail.com",
    lastName: "dynamicNom",
    firstName: "dynamicPrenom",
    company: "dynamicNomEntreprise",
    triptitle: req.body.triptitle,
    tripdesc: req.body.tripdesc,
    location: req.body.location,
    theme: req.body.theme,
    difficulty: String,
    budget: Number,
    duration: String,
    startdate: String,
    enddate: String,
    team: Number,
    file: String,
    file2: String,

  });
  newTrip.save(
    function (error, trip) {
       console.log(trip);
    }
);

  res.redirect('/add-trip');
});



/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('home');
});



/* GET search page with ALL CARDS */
router.get('/search-trip', function(req, res, next) {
  tripModel.find(
    function (err, tripList ){
      console.log(tripList);
      res.render('search-trip', {
        tripList: tripList,
        user: req.session.user
      });
    }
  )
});

/* GET trip page with ONE CARD (selected trip) */
router.get('/trip', function(req, res, next) {
  res.render('trip');
});



/* GET experience page. */
router.get('/experience', function(req, res, next) {
  res.render('experience');
});

// HERE ARE THE NAVBAR LINKS



// // HERE ARE THE SIGN-IN & SIGN-UP ROUTES
// router.post('/signin', function(req, res, next) {
//   res.render('search-trip');
// });

router.post('/signin', function(req, res, next) {
  userModel.find({
      email: req.body.email,
      password: req.body.password
    },
    function(err, users) {
      if (users.length > 0) {
        req.session.user = users[0];
        tripModel.find(
          function (err, tripList ){
            console.log(users);
            res.render('search-trip', {
              tripList: tripList,
              user: req.session.user
            });
          }
        )
      } else {
        res.render('signin');
      }
    }
  )
});



// HERE ARE THE SIGN-IN & SIGN-UP ROUTES
//
router.post('/signup', function(req, res, next) {

  userModel.find({
      email: req.body.email
    },
    function(err, users) {
      if (users.length == 0) {
        console.log(users)
        var newUser = new userModel({
          email: req.body.email,
          password: req.body.password,
          salutation: req.body.salutation,
          lastname: req.body.lastname,
          firstname: req.body.firstname,
          company: req.body.company

        });
        newUser.save(
          function(error, user) {
            console.log(users)
            req.session.user = user;
            tripModel.find(
              function (err, tripList ){
                console.log(user);
                res.render('search-trip', {
                  tripList: tripList,
                  user: req.session.user
                });
              }
            )
          }
        )
      } else {
        res.render('home');
      }
    }
  )

});





/* GET partner form. */
router.get('/confirmation', function(req, res, next) {
  res.render('confirmation');
});


/* GET partner form. */
router.get('/', function(req, res, next) {
  res.render('squeleton');
});





module.exports = router;
