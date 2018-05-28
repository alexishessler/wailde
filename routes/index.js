///////////////////////////////
//                           //
//                           //
//           PART 1          //
//                           //
//                           //
///////////////////////////////


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
var passwordHash = require('password-hash');


router.get('/testtwilio', function(req, res, next) {
  // client.sendMessage({
  //   to: '+33787792295',
  //   from: '+33756796332',
  //   body: "Well done !"
  //
  // }, function(err, data){
  //   if(err){
  //     console.log(err);
  //   } else {
  //     console.log(data);
  //   }
  // })

  client.messages.create({
      to: '+33787792295',
      from: '+33756796332',
      body: "Well done !"
  }).then((message) => console.log(message.sid));

res.render('home', { isLoggedIn: req.session.isLoggedIn });


  });





  // res.render('home', { isLoggedIn: req.session.isLoggedIn });
///////////////////////////////
//                           //
//                           //
//           PART 2          //
//                           //
//                           //
///////////////////////////////

// DATABASE CONNECTION & SCHEMA
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

  // 1) Schéma Collection partner

  var partnerSchema = mongoose.Schema({
    email: String,
    password: String,
    salutation: String,
    lastname: String,
    firstname: String,
    company: String,
    phone: String
  });

  var partnerModel = mongoose.model('partners', partnerSchema);
 //

  // 2) Schéma Collection user

  var userSchema = mongoose.Schema({
    email: String,
    password: String,
    salutation: String,
    lastname: String,
    firstname: String,
    company: String,
    phone: String
  });

  var userModel = mongoose.model('users', userSchema);


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
      dbteam: Number,
      phone: String

  });

  var tripModel = mongoose.model('trips', tripSchema);




  ///////////////////////////////
  //                           //
  //                           //
  //           PART 3          //
  //                           //
  //                           //
  ///////////////////////////////


// VAR ERROR
  var error = [];







  ///////////////////////////////
  //                           //
  //                           //
  //           PART 4          //
  //                           //
  //                           //
  ///////////////////////////////

// SIGN IN & SIGN UP

  // SIGN IN
router.post('/signin', function(req, res, next) {
 req.session.isLoggedIn = false;

 userModel.find({
   email: req.body.email
 },

 function(err, users) {
   if (users.length > 0) {

     var hashedPassword = users[0].password;
     if (passwordHash.verify(req.body.password, hashedPassword)){
       req.session.user = users[0];
       req.session.isLoggedIn = true;
       tripModel.find(
         function (err, tripList ){
           console.log(req.session.user)
           console.log(users);
           res.render('search-trip', {
             tripList: tripList,
             user: req.session.user,
             isLoggedIn: req.session.isLoggedIn
           });
         }
         )
     } else {
       // faux password
       error = [...error, 'Votre mot de passe est incorrect !'];
       req.session.isLoggedIn = false;
       console.log("NON CONNECTE")
       res.render('home', {
         isLoggedIn: req.session.isLoggedIn,
         error: error
       });
       error = [];
     }
   } else {
     // faux email
     req.session.isLoggedIn = false;
     console.log("NON CONNECTE")
     res.redirect('home');
   }
    });
    });


    // SIGN UP
router.post('/signup', function(req, res, next) {
  req.session.isLoggedIn = false;
  userModel.find({
      email: req.body.email
    },
    function(err, users) {
      if (users.length == 0) {

        var hashedPassword = passwordHash.generate(req.body.password);

        console.log(users)
        var newUser = new userModel({
          email: req.body.email,
          password: hashedPassword,
          salutation: req.body.salutation,
          lastname: req.body.lastname,
          firstname: req.body.firstname,
          company: req.body.company,
          phone: "+33" + req.body.phone

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

  // HERE IS THE LOGOUT ROUTE
router.get('/logout', function(req, res, next){
 req.session.isLoggedIn = false;
  res.render('home', { isLoggedIn: req.session.isLoggedIn });
});









///////////////////////////////
//                           //
//                           //
//           PART 5          //
//                           //
//                           //
///////////////////////////////

// UPLOAD IMAGE
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







///////////////////////////////
//                           //
//                           //
//           PART 6          //
//                           //
//                           //
///////////////////////////////

// TRIPS

/* GET partner form. */
router.get('/partner', function(req, res, next) {
  res.render('partner', { isLoggedIn: req.session.isLoggedIn });
});

/* GET home page. */
router.post('/add-image', function(req, res, next) {
  var budget
  var team
  var newTrip = new tripModel({
    salutation: req.session.user.salutation,
    lastName: req.session.user.lastname,
    firstName: req.session.user.firstname,
    company: req.session.user.company,
    phone: req.session.user.phone,
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
    user: req.session.user,
    file: '/images/' + req.session.picture,
    file: '/images/' + picturechoice,
    isLoggedIn: req.session.isLoggedIn
  });
});

/* GET home page. */
router.get('/validate-image', function(req, res, next) {
  res.render('validate-image', {
    file: '/images/' + req.session.picture,
    file: '/images/' + picturechoice,
    isLoggedIn: req.session.isLoggedIn
  });
});

router.get('/delete-image', function(req, res, next) {
  console.log("TEST");
  console.log(req.query.id);

  tripModel.remove({
      _id: req.query.id
    },
    function(error) {
      res.redirect('/partner');
    }
  );

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
      req.session.trip = tripList[0];
      console.log(req.session.trip);
      res.render('trip', {
        trip: req.session.trip,
        tripList: tripList,
        user: req.session.user,
        isLoggedIn: req.session.isLoggedIn
      });
    }
  )

});

/* GET trip page with ONE CARD (selected trip) */
router.get('/trip', function(req, res, next) {
  res.render('trip', { isLoggedIn: req.session.isLoggedIn });
});

// BOOK ROUTE
// DEFINE TRIPTITLE: REQ.QUERY.TIRIPTITLE. TRIPTITLE IS REFERENCED TO THE HIDDEN INPUT ON TRIP.EJS IN THE ROUTE GET
router.post('/book', function(req, res, next) {

  tripModel.find(
      {
        _id: req.body.id
      } ,

      function (err, trip) {
          console.log("DEUXIEME TEST")
          console.log(req.session.trip);
          req.session.trip = trip[0];

          console.log("TROISIEME TEEEEEEST");

          console.log(req.session.trip);
          console.log(req.session.trip.budget);

          req.session.totalCmd = req.session.trip.budget;

          console.log(req.session.totalCmd);


          res.render('pay', { isLoggedIn: req.session.isLoggedIn,
            totalCmd: req.session.totalCmd,
            trip: req.session.trip,
            user: req.session.user,
            isLoggedIn: req.session.isLoggedIn

          });
      }
  )






});

router.get('/confirmationemail', function(req, res, next) {

  res.render('confirmationemail', { isLoggedIn: req.session.isLoggedIn });
});


// EMAIL SENDING
var emailContent = '<body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td><td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;"><div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;"><span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Plus information sur votre voyage avec Wailde.</span><table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;"><tr><td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"><h1 style="font-family: sans-serif; font-size: 20; font-weight: normal; margin: 0; Margin-bottom: 15px;">Merci beaucoup pour votre reservation.</h1><img src="https://i.imgur.com/nWffoJ7g.jpg" style="width: 100%;"></body>'

var emailContentParagraph = '<body><p></p></body>'

var emailContentTwo = '<body></p><table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;"><tbody><tr><td align="left" style="font-family: sans-serif;font-size: 14px;vertical-align: top; padding-bottom: 15px;"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;"> <a href="http://http://localhost:3000/" target="_blank" style="display: inline-block; color: #ffffff; background-color:  #99cccc; border: solid 1px #99cccc; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #99cccc;">Check out Wailde</a> </td></tr></tbody> </table></td></tr></tbody></table><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Location:</body>'


var emailContentThree ='<body> / Difficulty: </body>'

var emailContentFour ='<body> / Theme: </body>'

var emailContentFive = '<body></p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Profitez-vous!.</p></td></tr></table></td></tr></table></body>'


/*var emailContentThree = '<body><style></style><div class="col-12 col-lg-6 jumbotron"><h1 class="display-4" style="font-style:'Poppins'">triptitle: Les sentiers de la Vallée de Chevreuse</h1><p class="lead">tripdescription: Venez découvrir les sentiers secrets de la vallée de Chevreuse à travers un parcours Trail à effectuer en équipe avec vos collaborateurs. Une expérience enrichissante dans un environnement unique à proximité direct de Paris.</p><hr class="my-4"><p>location</p><p>theme</p><p>budget : €</p><p>difficulty : <i class="fas fa-fire"></i></p><div class="niveau"><p>No. des Personnes : <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i> <i class="fas fa-male"></i> <i class="fas fa-female"></i></p></div></div></body>' */

var accountSid = 'AC8501d1bbe8f311176ec2d40bb5af3f2b';
var authToken = '988880b71acb90832e591992edbbe2cd';
var client = require('twilio')(accountSid, authToken);

router.get('/addOne', function(req, res, next) {

  req.session.totalCmd = req.session.totalCmd + req.session.trip.budget;

  res.render('pay',
  {
    totalCmd: req.session.totalCmd,
    trip: req.session.trip,
    user: req.session.user,
    isLoggedIn: req.session.isLoggedIn
  });
});

router.get('/deleteOne', function(req, res, next) {

  req.session.totalCmd = req.session.totalCmd - req.session.trip.budget;

  res.render('pay',
  {
    totalCmd: req.session.totalCmd,
    trip: req.session.trip,
    user: req.session.user,
    isLoggedIn: req.session.isLoggedIn
  });
});





// ROUTE EMAILSEND ON THE PAY.EJS. HIDDEN INPUTS HAVE TO BE ADDED IN ORDER FOR THE PAGE TO ACCESS ALL THE INFORMATION FROM THE PREVIOUS PAGE. THE HTML IS BEING SEPERATEDINTO SEVERAL BLOCKS AND ADDED TOGETHER IN ORDER TO MAKE EACH PART DYNAMIC.

router.post('/emailsend', function(req, res, next) {

  tripModel.find(
    {
      _id: req.body.id
    },

    function(err, tripList) {

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'waildeproject@gmail.com',
          pass: 'capsule2018'
        }
      });

    var mailOptions = {
      from: 'waildeproject@gmail.com',
      to: req.session.user.email,
      subject: 'Confirmation email',
      html: emailContent + req.body.triptitle + emailContentParagraph + req.body.tripdesc + emailContentTwo + req.body.triplocation + emailContentThree + req.body.tripdifficulty + emailContentFour + req.body.triptheme + emailContentFive
    };



    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {

        console.log(error);
        res.render('home',{
          totalCmd: req.session.totalCmd,
          tripList: tripList,
          user: req.session.user,
          isLoggedIn: req.session.isLoggedIn
        });
      } else {

        // ENVOI DU SMS
        client.messages.create({
            to: req.session.trip.phone,
            from: '+33756796332',
            body: req.session.trip.firstName + " " + req.session.trip.lastName + ", un voyage vient d'être réservé par l'entreprise " + req.session.user.company + " !"

        }).then((message) => console.log(message.sid));

        const token = req.body.stripeToken;
        const charge = stripe.charges.create({
          amount: req.session.totalCmd * 100,
          currency: 'eur',
          description: 'Example charge',
          source: token,
        });

        console.log('Email sent: ' + info.response);



        console.log(req.session.trip.phone);

        res.render('confirmation', {
          totalCmd: req.session.totalCmd,
          tripList: tripList,
          user: req.session.user,
          isLoggedIn: req.session.isLoggedIn
        }
      );

      }
    });
  });
  });

/* GET partner form. */
router.post('/confirmation', function(req, res, next) {
  res.render('confirmation', { isLoggedIn: req.session.isLoggedIn });
});










///////////////////////////////
//                           //
//                           //
//           PART 7          //
//                           //
//                           //
///////////////////////////////


// OTHER ROUTES
/* GET partner form. */
router.get('/', function(req, res, next) {
  res.render('home', { isLoggedIn: req.session.isLoggedIn });
});

router.get('/home', function(req, res, next) {
  res.render('home', {
    isLoggedIn: req.session.isLoggedIn,
    error: error
  });
});

/* GET experience page. */
router.get('/experience', function(req, res, next) {
  res.render('home', { isLoggedIn: req.session.isLoggedIn });
});





// router.get('/map', function(req, res, next){
//   res.render('map', { isLoggedIn: req.session.isLoggedIn });
// });
//
// /* GET partner form. */
// router.get('/maptest', function(req, res, next) {
//   res.render('maptest', { isLoggedIn: req.session.isLoggedIn });
// });

  // // HERE ARE THE SIGN-IN & SIGN-UP ROUTES
  // router.post('/add-trip', function(req, res, next) {
  //
  //
  //   var newTrip = new tripModel({
  //     salutation: "dynamicEmail@gmail.com",
  //     lastName: "dynamicNom",
  //     firstName: "dynamicPrenom",
  //     company: "dynamicNomEntreprise",
  //     triptitle: req.body.triptitle,
  //     tripdesc: req.body.tripdesc,
  //     location: req.body.location,
  //     theme: req.body.theme,
  //     difficulty: String,
  //     budget: Number,
  //     duration: String,
  //     startdate: String,
  //     enddate: String,
  //     team: Number,
  //     file: String,
  //     file2: String,
  //
  //   });
  //   newTrip.save(
  //     function(error, trip) {
  //       console.log(trip);
  //     }
  //   );
  //
  //   res.redirect('/add-trip');
  // });


module.exports = router;
