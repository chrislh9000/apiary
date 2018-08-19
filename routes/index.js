const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const _ = require('underscore');
const stripePackage = require('stripe')
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY)
//MONGOOSE MODELS
const models = require('../models/models');
const User = models.User;
const Payment = models.Payment;
const Product = models.Product
const OauthToken = models.OauthToken

function hashPassword(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}


// Profile stuff
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

////////////////////////////////////////Payment Route/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

//MUST CHANGE TO ACCOUNT FOR PACKAGE SCHEMA
router.get('/checkout', function(req, res, next) {
  console.log('query', req.query.package)
  if (req.user) {
    if (req.query.package === 'basic') {
      res.render('checkout', {
        username: req.user.username,
        name: req.user.name,
        networkToggled: true,
        loggedIn: true,
        cartSecret: process.env.STRIPE_SECRET_KEY,
        cartPublish: process.env.STRIPE_PUBLISH_KEY,
        package: {
          pName: 'BASIC PLAN',
          pPrice: '$9',
          pDesc: '3-hours with consultants, Essays from 10+ colleges, 5 essay-reviews'
        }
      });
    } else if (req.query.package === 'silver') {
      res.render('checkout', {
        username: req.user.username,
        name: req.user.name,
        networkToggled: true,
        loggedIn: true,
        cartSecret: process.env.STRIPE_SECRET_KEY,
        cartPublish: process.env.STRIPE_PUBLISH_KEY,
        package: {
          pName: 'SILVER PLAN',
          pPrice: '$19',
          pDesc: '3-hours with consultants, Essays from 10+ colleges, 5 essay-reviews'
        }
      });
    } else if (req.query.package === 'gold') {
      res.render('checkout', {
        username: req.user.username,
        name: req.user.name,
        networkToggled: true,
        loggedIn: true,
        cartSecret: process.env.STRIPE_SECRET_KEY,
        cartPublish: process.env.STRIPE_PUBLISH_KEY,
        package: {
          pName: 'GOLD PLAN',
          pPrice: '$39',
          pDesc: '3-hours with consultants, Essays from 10+ colleges, 5 essay-reviews'
        }
      });
    } else {
      res.redirect('/products')
    }
  } else {
    res.redirect('/')
  }
})

//Payment processing and saving
router.post('/checkout', function(req, res, next) {
  console.log('checkout request initialized');
  var token = req.body.stripeToken;
  var email = req.body.stripeEmail;
  stripe.customers.create({email: email, source: token}).then(function(customer) {
    // YOUR CODE: Save the customer ID and other info in a database for later.
    console.log('successfully created customer')
    var newCharge = stripe.charges.create({amount: 300, currency: "usd", customer: customer.id});
    return newCharge;
    console.log('charge successfully created');
  }).then(function(charge) {
    console.log('charge', charge)
    //Create new payment for database
    var newPayment = new Payment({
      stripeBrand: charge.source.brand,
      stripeCustomerId: charge.customer,
      stripeExpMonth: charge.source.exp_month,
      paymentAmount: charge.amount,
      stripeExpYear: charge.source.exp_year,
      stripeLast4: charge.source.last4,
      stripeSource: charge.source.id,
      status: charge.status,
      _userid: req.user._id,
      name: req.user.name,
      email: req.user.email
    })
    newPayment.save(function(err, charge) {
      if (err) {
        console.log('error saving new payment');
      } else {
        res.render('payment', {charge: charge})
      }
    })
  });
})
////////////////////////////////////////Consulting/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/users/consultants/:userid', function(req, res, next) {
  //consultant profile page
})
//sample consultant profile with google calendars API (maybe a skype API of some sort?)
//test route for google calendar API
router.get('/calendar', function(req, res, next) {
  res.render('calendar')
})

module.exports = router;
