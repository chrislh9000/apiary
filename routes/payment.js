const express = require('express');
const router = express.Router();
const passport = require('passport');
const models = require('../models/models');
const User = models.User;
const StripePayment = models.StripePayment;
const PaypalPayment = models.PaypalPayment
const bodyParser = require('body-parser')
const _ = require('underscore');
const stripePackage = require('stripe');
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);


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

router.get('/payment-test', (req, res) => {
  res.render('./Payment/test-payment');
})

router.post('/paypal/payment', (req, res) => {
  const genInfo = req.body.resource.purchase_units[0]
  const paymentInfo = req.body.resource.purchase_units[0].payments.captures[0];
  console.log('====GEN INFO====', genInfo)
  console.log('====Payment INFO====', paymentInfo)
  // console.log('====PURCHASE UNITS=====', req.body.resource.payer.purchase_units[0])
  if (paymentInfo.status === 'COMPLETED') {
    const newPayment = new PaypalPayment({
      customerEmail: genInfo.payee.email_address,
      paymentId: genInfo.reference_id,
      price: Number(genInfo.amount.value),
      productId: paymentInfo.id,
      user: req.user._id,
    })
    newPayment.save()
    .then(payment => {
      res.render('payment', {
        amount: genInfo.amount.value,
        productId: paymentInfo.id,
        paymentId: genInfo.reference_id,
        email: genInfo.payee.email_address,
        user: req.user
      })
    })
    .catch(err => {
      res.redirect('/checkout?success=false');
    })
  } else {
    res.redirect('/checkout?success=false');
  }
})



module.exports = router;
