var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
//image upload
const multer = require('multer');
const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'apiary-solutions',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profiles')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
  fileFilter: (req, file, cb) => {
    if (file.size > 1000000) cb(null, false);
    else cb(null, true);
  }
});

const upload =  multer({ storage: storage });
// const methodOverride= require('method-override');
// const GridFsStorage= require('multer-gridfs-storage');
// const Grid = require('gridfs-stream');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const googleRouter = require('./routes/google');
const preloginRouter = require('./routes/prelogin');
const adminRouter = require('./routes/admin');
const paymentRouter = require('./routes/payment');

var models = require('./models/models');
const User = models.User;
const Image = models.Image;
const app = express();
const crypto = require('crypto');

const conn = mongoose.createConnection(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI);

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//cookie and body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Session and Passport stuff
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);

function hashPassword(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

// passport serialization and local strategy
app.use(session({
  secret: 'sample secret',
  store: new MongoStore({mongooseConnection: mongoose.connection}),
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done) {
  // Find the user with the given username
  User.findOne({ username: username }, function (err, user) {
    // if there's an error, finish trying to authenticate (auth failed)
    if (err) {
      console.log(err);
      return done(err);
    } else if (!user) {
      console.log(user);
      return done(null, false);
    } else {
      var hashedPassword = hashPassword(password);
      if (user.hashedPassword !== hashedPassword) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }
  });
}));
//initializing passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use('/', authRouter(passport));

//initializing other routers files as middleware
app.use('/', indexRouter);
app.use('/users', authRouter);
app.use('/', googleRouter);
app.use('/', preloginRouter);
app.use('/', adminRouter);
app.use('/', paymentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
