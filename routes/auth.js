var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var passport = require('passport');
var expressValidator = require('express-validator')
var models = require('../models/models')
var User = models.User
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
  // must check to see if email or username is already in use
  var newUser = new User ({
    username:req.body.username,
    hashedPassword: hashPassword(req.body.password),
    name:req.body.firstName + ' ' + req.body.lastName,
    school: req.body.school,
    email: req.body.email,
    gender: req.body.gender,
    userType: 'user',
    calendarUrl: 'abc',
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
//Login functionality
router.get('/login', (req, res, next) => {
  if (req.query.register === 'success') {
    res.render('login', {
      success: 'successfully registered!'
    })
  } else {
    res.render('login');
  }
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login?login=failed'}), function(req, res) {
  res.redirect('/?loggedIn=success');
  console.log('logged in !')
});

//logout functionality
router.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/login');
})

return router

}
