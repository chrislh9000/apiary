const express = require('express');
const router = express.Router();
const passport = require('passport')
var models = require('../models/models')
var User = models.User
var bodyParser = require('body-parser')


router.get('/users/myProfile', function(req, res, next) {
  User.findOne({username: req.user.username}).exec().then((user) => {
    console.log('user', user);
    res.render('profile', {
      user: user,
      logged: req.user.username,
      username: req.user.username,
      owner: true,
      networkToggled: true,
      loggedIn: true
    })
  }).catch((error) => {
    res.send(error);
  })
})

//editing profile

router.get('/users/edit', function(req, res, next) {
  User.findOne({username: req.user.username}).exec().then((user) => {
    console.log('userSchool', user.school);
    res.render('editProfile', {
      user: user,
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ")[1],
      logged: req.user.username,
      genderMale: req.user.gender === 'Male'
        ? 'checked'
        : null,
      genderFemale: req.user.gender === 'Female'
        ? 'checked'
        : null,
      genderOther: req.user.gender === 'Other'
        ? 'checked'
        : null
    })
  }).catch((error) => {
    res.send(error);
  })
})

router.post('/users/edit', function(req, res, next) {
  User.findOneAndUpdate({
    username: req.user.username
  }, {
    username: req.body.username,
    name: req.body.firstName + ' ' + req.body.lastName,
    school: req.body.school,
    email: req.body.email,
    gender: req.body.gender,
    biography: req.body.biography,
    imageUrl: req.body.imageUrl
  }).exec().then((resp) => {
    console.log('User successfully updated', resp);
    res.redirect('/users/myProfile');
  }).catch((error) => {
    console.log('Error', error);
    res.send(error);
  })
})

//Viewing other profiles
//viewing all profiles
router.get('/users/all', function(req, res, next) {
  User.find().exec().then((users) => {
    res.render('networkProfiles', {
      users: users,
      logged: req.user.username,
      networkToggled: true,
      loggedIn: true
    })
  }).catch((error) => {
    console.log('Error', error)
    res.send(error);
  })
})
//view a single profile
router.get('/users/:userid', function(req, res, next) {
  var userId = req.params.userid;
  User.findById(userId).exec().then((user) => {
    res.render('profile', {
      user: user,
      logged: req.user.username,
      owner: false,
      networkToggled: true
    })
  }).catch((error) => {
    console.log('Error', error)
    res.send(error);
  })
})

module.exports = router;
