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
var sendgrid = require('sendgrid')(process.env.YXUY9bc_RqKShqNh5g5r8w);




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

var path = require('path');
var crypto = require('crypto');
var mongoose = require('mongoose');
var multer = require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// MONGO URI
var mongoURI = 'mongodb://capsule:azerty@ds139459.mlab.com:39459/waildeproject';

// MONGO CONNEXION
var conn = mongoose.createConnection(mongoURI);

// INIT GridFs
var gfs;

conn.once('open', function() {
  // Init Stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
  // all set!
})

// CREATE STORAGE ENGINE
var storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        var filename = buf.toString('hex') + path.extname(file.originalname);
        var fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 3000000
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

// /* GET partner form. */
// router.get('/partner', function(req, res, next) {
//   res.render('partner');
// });

/* GET home page. */
router.get('/partner', function(req, res, next) {
  gfs.files.find().toArray((err, files) => {
    res.render('partner', {
      files: files
    });
  });
});

/* GET home page. */
router.get('/validate-image', function(req, res, next) {
  gfs.files.find().toArray((err, files) => {
    res.render('validate-image', {
      files: files
    });
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
  res.render('add-image');
});

router.post('/upload', function(req, res, next) {

  upload(req, res, (err) => {
    if (err) {
      console.log("Il n'y a pas d'erreur");
      res.redirect('/partner');

      console.log("Il y a une erreur");
    } else {
      // les infos du req.file sont à mettre dans la data base
      if (req.file == undefined) {
        console.log("le fichier n'est pas défini!!");
        res.redirect('/partner');
      } else {
        console.log(req.file.id);
        console.log("ca a marché!!");
        res.redirect('/validate-image');
        // pour resrender l'img, bien ajouter le img tag sur le view!!
      }
    }
  });
});

//ROUTE GET FILES/: filename
router.get('/files/:filename', function(req, res, next) {
  gfs.files.findOne({
    filename: req.params.filename
  }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      console.log("cest ici mon erreur 1");
      return res.status(404).json({
        err: 'No file exist'
      });
    }
    // File Exists
    return res.json(file);
  });
});

// ROUTE GET IMG FILE NAME
router.get('/image/:filename', function(req, res, next) {
  gfs.files.findOne({
    filename: req.params.filename
  }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      console.log("cest ici mon erreur 2");
      return res.status(404).json({
        err: 'No file exist'
      });
    }
    // check if image
    if (file.contentType == 'image/jpeg' || file.contentType == 'image/png' || file.contentType == 'image/jpg') {
      // read output to browser
      var readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

// ROUTE DESC DISPLAY ALL FILES
router.get('/files', function(req, res, next) {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      console.log("cest ici mon erreur 3");
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});


// ROUTE DELECT
router.delete('/files/:id', (req, res) => {
  gfs.remove({
    _id: req.params.id,
    root: 'uploads'
  }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({
        err: err
      });
    } else {
      console.log("il n'y a pas d'erreur!!!!")
      res.redirect('/partner');
    }
  });
});


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
  res.render('home');
});



/* GET search page with ALL CARDS */
router.get('/search-trip', function(req, res, next) {
  tripModel.find(
    function(err, tripList) {
      console.log(tripList);
      res.render('search-trip', {
        tripList, user: req.session.user
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
        res.render('search-trip', {
          tripList, user: req.session.user
        });
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
            res.render('search-trip', {
              tripList, user: req.session.user
            });
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


// BOOK ROUTE



router.get('/book', function(req, res, next) {

  res.render('pay');
});




// EMAIL SENDING
router.get('/emailsend', function(req, res, next) {

  sendgrid.send({
      to: 'romy.abbrederis@gmail.com',
      from: 'noreply@learncode.acedemy',
      subject: 'Hello World',
      text: 'My first email'
    }, function(err, json) {
      if (err) {
        return res.send('Ahhhh!');
      }
      res.send('Wohhooo!');
    });
});





module.exports = router;
