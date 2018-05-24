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
var nodemailer = require('nodemailer');


// il faut ajouter stripe (voir credentials sur Slack)
// HERE ARE THE MODULES WE USE
router.post('/trip', function(req, res, next) {
  tripModel.find({
      _id: req.body.id
    },

    function(err, tripList) {
      console.log("ici commence le test");
      console.log(req.body.id);
      console.log(tripList);
      res.render('trip', {
        tripList: tripList,
        user: req.session.user,
        file: '/images/' + req.session.picture,
        file: '/images/' + picturechoice,
        isLoggedIn: req.session.isLoggedIn
      });
    }
  )

});



// HERE IS THE CONNECTION TO OUR MLAB DATABASE
var options = {
  server: {
    socketOptions: {
      connectTimeoutMS: 5000
    }
  }
};
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
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() +
      path.extname(file.originalname));
  }
});

// INIT UPLOAD
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 4000000
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('file');

// check file type
function checkFileType(file, cb) {
  // Allowed ext
  var filetypes = /jpeg|jpg|png|gif/;
  // check ext
  var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // check mime type (dans le req.file)
  var mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};
var pictureSchema = mongoose.Schema({
    picturename: String
});

var pictureModel = mongoose.model('pictures', pictureSchema);


router.post('/upload', function(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      console.log("erreur 1");
      res.redirect('/partner');
    } else {
      console.log(req.file);
      // les infos du req.file sont à mettre dans la data base
      if (req.file == undefined) {
        console.log("erreur 2");
        res.redirect('/partner');
      } else {
        req.session.picture = req.file.filename;

        console.log("ca a marché!!");
        console.log(req.session.picture);

        var newPicture = new pictureModel ({
          picturename: req.file.filename
        });

        newPicture.save(
            function (error, picture) {

               console.log("ICI EST LA PICTURE:" + picture);
               picturechoice = picture.picturename;
               console.log("ICI EST LA DEUXIEME PICTURE BDD :" + picturechoice )
               res.redirect('/validate-image');
            }
        );

        // res.redirect('/validate-image');
        // pour resrender l'img, bien ajouter le img tag sur le view!!
      }
    }
  });
});




/* GET partner form. */
router.get('/partner', function(req, res, next) {
  res.render('partner', { isLoggedIn: req.session.isLoggedIn });
});

/* GET home page. */
router.get('/validate-image', function(req, res, next) {
  res.render('validate-image', {
    file: '/images/' + req.session.picture,
    file: '/images/' + picturechoice,
    isLoggedIn: req.session.isLoggedIn
  });
});

// router.get('/add-image', function(req, res, next) {
//   res.render('add-image');
// });
// var picturechoice = null;

/* GET home page. */
router.post('/add-image', function(req, res, next) {
  var budget
  var team
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
    team: req.body.team,
    file: req.body.file,
    dbbudget:"",
    dbteam:""
  });

if (req.body.budget <= 500) {
    budget = 1
  } else if (req.body.budget <=1000) {
    budget =2
  } else {budget = 3};
  if (req.body.team <11) {
    team = 1
  } else if (req.body.team <31) {
    team =2
  } else {team = 3};
  newTrip.dbbudget = budget;
  newTrip.dbteam = team;


  newTrip.save(
    function(error, trip) {
      res.redirect('/search-trip');
    }
  );
});

/* GET home page. */
router.get('/add-image', function(req, res, next) {
  res.render('add-image', {
    file: '/images/' + req.session.picture,
    file: '/images/' + picturechoice,
    isLoggedIn: req.session.isLoggedIn
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
    file2: String,
    dbbudget: Number,
    dbteam: Number

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
    center: {
      lat: -34.397,
      lng: 150.644
    },
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
    function(error, trip) {
      console.log(trip);
    }
  );

  res.redirect('/add-trip');
});



/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('home', {isLoggedIn: req.session.isLoggedIn});
});



/* GET search page with ALL CARDS */
router.get('/search-trip', function(req, res, next) {
  tripModel.find(
    function(err, tripList) {
      console.log(tripList);
      res.render('search-trip', {
        tripList: tripList,
        user: req.session.user,
        file: '/images/'+ req.session.picture,
        isLoggedIn: req.session.isLoggedIn
      });
    }
  )
});

/*POST Search barre to filter the CARDS*/
router.post('/search-filter', function(req, res, next) {
  tripModel.find(
    function (err, tripList ){
      console.log(tripList);
      console.log("PRE FILTER");
      var query = {};
      console.log('difficulty ==>', req.body.difficulty)
      if (req.body.difficulty !== "null") {
        query.difficulty = req.body.difficulty;
      }
      if (req.body.budget !== "null") {
        query.dbbudget = req.body.budget;
      }
      if (req.body.team !== "null") {
        query.dbteam = req.body.team;
      }
      console.log('query ==>', query)
      tripModel.find(query,
          function (err, trips) {
            console.log("FILTER");
            console.log(trips);
                    console.log("FILTER budget");
                    res.render('search-trip', {
                      tripList: trips,
                      user: req.session.user,
                      file: '/images/'+ req.session.picture,
                      isLoggedIn: req.session.isLoggedIn
                    });
          }
        )
    }
  )
});
// res.render('search-trip', {
//   tripList: trips,
//   user: req.session.user,
//   file: '/images/'+ req.session.picture,
//   isLoggedIn: req.session.isLoggedIn
// });

/* GET trip page with ONE CARD (selected trip) */
router.get('/trip', function(req, res, next) {
  res.render('trip', { isLoggedIn: req.session.isLoggedIn });
});



/* GET experience page. */
router.get('/experience', function(req, res, next) {
  res.render('experience', { isLoggedIn: req.session.isLoggedIn });
});

// HERE ARE THE NAVBAR LINKS



// // HERE ARE THE SIGN-IN & SIGN-UP ROUTES
// router.post('/signin', function(req, res, next) {
//   res.render('search-trip');
// });

router.post('/signin', function(req, res, next) {
 req.session.isLoggedIn = false;
 userModel.find({
   email: req.body.email,
   password: req.body.password
 },
 function(err, users) {
   if (users.length > 0) {
     req.session.user = users[0];
     req.session.isLoggedIn = true;
     tripModel.find(
       function (err, tripList ){
         console.log(users);
         res.render('search-trip', {
           tripList: tripList,
           user: req.session.user,
           isLoggedIn: req.session.isLoggedIn
         });
       }
       )
   } else {
     req.session.isLoggedIn = false;
     console.log("NON CONNECTE")
     res.redirect('home');
   }
    });
    });


// HERE ARE THE SIGN-IN & SIGN-UP ROUTES
//
router.post('/signup', function(req, res, next) {
  req.session.isLoggedIn = false;
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
            req.session.isLoggedIn = true;
            tripModel.find(
              function(err, tripList) {
                console.log(user);
                res.render('search-trip', {
                  tripList: tripList,
                  user: req.session.user,
                  isLoggedIn: req.session.isLoggedIn
                });
              }
            )
          }
        )
      } else {
        req.session.isLoggedIn = false;
        res.render('home', { isLoggedIn: req.session.isLoggedIn });
      }
    }
  )

});

// HERE IS THE LOGOUT ROUTE//
router.get('/logout', function(req, res, next){
 req.session.isLoggedIn = false;
  res.render('home', { isLoggedIn: req.session.isLoggedIn });
});

router.get('/map', function(req, res, next){
  res.render('map', { isLoggedIn: req.session.isLoggedIn });
});



/* GET partner form. */
router.post('/confirmation', function(req, res, next) {
  res.render('confirmation', { isLoggedIn: req.session.isLoggedIn });
});


/* GET partner form. */
router.get('/', function(req, res, next) {
  res.render('squeleton', { isLoggedIn: req.session.isLoggedIn });
});

/* GET partner form. */
router.get('/maptest', function(req, res, next) {
  res.render('maptest', { isLoggedIn: req.session.isLoggedIn });
});





// BOOK ROUTE



router.get('/book', function(req, res, next) {
  var stripe = require("stripe")("sk_test_95zmCFtr3vHOffkw0DEfXiiI");
  const token = req.body.stripeToken;
  const charge = stripe.charges.create({
    amount: 999,
    currency: 'eur',
    description: 'Example charge',
    source: token,
  });
  res.render('pay', { isLoggedIn: req.session.isLoggedIn });
});



router.get('/confirmationemail', function(req, res, next) {

  res.render('confirmationemail', { isLoggedIn: req.session.isLoggedIn });
});


// EMAIL SENDING


var emailContent = '<body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td><td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;"><div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;"><span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Plus information sur votre voyage avec Wailde.</span><table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;"><tr><td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"><h1 style="font-family: sans-serif; font-size: 20; font-weight: normal; margin: 0; Margin-bottom: 15px;">Merci beaucoup pour votre reservation.</h1><img src="https://i.imgur.com/nWffoJ7g.jpg" style="width: 100%;"><p style="font-family: sans-serif; font-size: 18px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Les sentiers de la Vallée de Chevreuse,</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Venez découvrir les sentiers secrets de la vallée de Chevreuse à travers un parcours Trail à effectuer en équipe avec vos collaborateurs. Une expérience enrichissante dans un environnement unique à proximité direct de Paris.</p><table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;"><tbody><tr><td align="left" style="font-family: sans-serif;font-size: 14px;vertical-align: top; padding-bottom: 15px;"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;"> <a href="http://http://localhost:3000/" target="_blank" style="display: inline-block; color: #ffffff; background-color:  #99cccc; border: solid 1px #99cccc; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #99cccc;">Check out Wailde</a> </td></tr></tbody> </table></td></tr></tbody></table><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Location: Dynamic / DIfficulty: Dynamic / Theme: Dynamic.</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Profitez-vous!.</p></td></tr></table></td></tr></table></body>'


/*var emailContentThree = '<body><style></style><div class="col-12 col-lg-6 jumbotron"><h1 class="display-4" style="font-style:'Poppins'">triptitle: Les sentiers de la Vallée de Chevreuse</h1><p class="lead">tripdescription: Venez découvrir les sentiers secrets de la vallée de Chevreuse à travers un parcours Trail à effectuer en équipe avec vos collaborateurs. Une expérience enrichissante dans un environnement unique à proximité direct de Paris.</p><hr class="my-4"><p>location</p><p>theme</p><p>budget : €</p><p>difficulty : <i class="fas fa-fire"></i></p><div class="niveau"><p>No. des Personnes : <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i></p></div></div></body>' */

router.post('/emailsend', function(req, res, next) {

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'waildeproject@gmail.com',
        pass: 'capsule2018'
      }
    });

    var mailOptions = {
      from: 'waildeproject@gmail.com',
      to: 'romy.abbrederis@gmail.com',
      subject: 'Confirmation email',
      html: emailContent
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        res.render('home',{
          tripList: tripList,
          user: req.session.user,
          isLoggedIn: req.session.isLoggedIn
        });
      } else {
        console.log('Email sent: ' + info.response);
        res.render('confirmation', { isLoggedIn: req.session.isLoggedIn });

      }
    });
  });




module.exports = router;
