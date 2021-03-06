var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var passport = require('passport');
var expressValidator = require('express-validator')
var models = require('../models/models')
var User = models.User
const Ambassador = models.Ambassador;
var crypto = require('crypto');

//hashing passwords
function hashPassword(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}


module.exports = function(passport) {

// Signup stuff
router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res, next) {
  if (req.body.password !== req.body.repeatPassword) {
    res.redirect('/ambassadors/register?password_match=false')
  } else if (req.body.email.slice(email_length - 3, email_length) !== 'edu' || !req.body.email.includes('@')) {
    res.redirect('/ambassadors/register?email=false')
  }

  var newUser = new User ({
    username:req.body.username,
    hashedPassword: hashPassword(req.body.password),
    name:req.body.firstName + ' ' + req.body.lastName,
    school: req.body.school,
    email: req.body.email,
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    academicInterests : [req.body.interest1, req.body.interest2, req.body.interest3],
    extracurricularInterests : [req.body.hobbie1, req.body.hobbie2, req.body.hobbie3],
    country: req.body.country,
    intendedMajor: req.body.intendedMajor,
    dreamUni: req.body.dreamUni,
    userType: 'client',
    skype: req.body.skypeName,
    currentGrade: req.body.currentGrade,
    dateJoined: new Date()
  })
  newUser.save()
  .then( (saved) => {
    console.log('new user saved!')
    res.redirect('/login?register=success');
  })
  .catch(function(error) {
    res.send('Error: Unable to save user')
  })
})
//ambassador login post route
router.post('/ambassadors/register', (req, res) => {
  const email_length = req.body.email.length
  if (req.body.password !== req.body.repeatPassword) {
    res.redirect('/ambassadors/register?password_match=false')
  } else if (req.body.email.slice(email_length - 3, email_length) !== 'edu' || !req.body.email.includes('@')) {
    res.redirect('/ambassadors/register?email=false')
  }

  var newUser = new User ({
    username:req.body.username,
    hashedPassword: hashPassword(req.body.password),
    name:req.body.firstName + ' ' + req.body.lastName,
    school: req.body.school,
    email: req.body.email,
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    country: req.body.country,
    intendedMajor: req.body.intendedMajor2 ? req.body.intendedMajor + ' and ' + req.body.intendedMajor2 : req.body.intendedMajor,
    userType: 'ambassador',
    skype: req.body.skypeName,
    currentGrade: req.body.currentGrade,
    dateJoined: new Date(),
  })
  newUser.save()
  .then( (user) => {
    console.log('new user saved!')
    const newAmbassador = new Ambassador({
      user: user._id,
      address: req.body.address,
      postalCode: req.body.postalCost,
      city: req.body.city,
      name: req.body.firstName + ' ' + req.body.lastName,
    })
    newAmbassador.save()
    .then(ambassador => {
      console.log('new ambassador created!')
      res.redirect('/login?register=success')
    })
  })
  .catch(function(error) {
    res.send('Error: Unable to save user')
  })
})
//Login functionality
router.get('/login', (req, res, next) => {
  if (req.query.register === 'success') {
    res.render('login', {
      success: 'successfully registered!'
    })
  } else if (req.query.login === 'failed') {
    res.render('login', {
      failure: 'Invalid Login Information',
    })
  }
  else {
    res.render('login');
  }
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login?login=failed'}), function(req, res) {
  console.log('=====LOGGED IN======')
  res.redirect('/users/all');
});

//logout functionality
router.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/login');
})

return router

}
