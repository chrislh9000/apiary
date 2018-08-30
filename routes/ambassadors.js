var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var passport = require('passport');
var expressValidator = require('express-validator')
//models//
var models = require('../models/models');
var User = models.User;
const Ambassador = models.Ambassador;
const Image = models.Image;
const Service = models.Service


var crypto = require('crypto');
//stripe stuff//
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const request = require('request');
const querystring = require('querystring');

//requiring users middleware
function ambassadorRequired (req, res, next) {
  if (!req.user.userType === 'ambassador') {
    return res.redirect('/users/myProfile');
  }
  next();
}


router.get('/register', (req, res) => {
  res.render('./Ambassadors/ambassador-register');
})

router.get('/myProfile', ambassadorRequired, async (req, res) => {
  if (req.user.userType === 'ambassador') {
    let hasImage= true;
    Image.findOne({user: req.user._id})
    .then(image => {
      if (!image) hasImage = false;
      Ambassador.findOne({user: req.user._id})
      .populate('user services')
      .exec()
      .then(async (ambassador) => {
        let balance;
        let availableBalance;
        let pendingBalance;
        console.log('===Services===', ambassador.services[0])
        if (ambassador.stripeAccountId) {
          balance = await stripe.balance.retrieve({ stripe_account: ambassador.stripeAccountId });
          availableBalance = balance.available[0].amount
          pendingBalance = balance.pending[0].amount;
        }
        res.render('./Ambassadors/ambassador-profile', {
          user: ambassador,
          logged: req.user.username,
          username: req.user.username,
          image: ambassador.user.image? image.cloudinaryUrl : null,
          owner: true,
          networkToggled: true,
          loggedIn: true,
          services: ambassador.services,
          availableBalance: balance ? String(availableBalance) : '0.00',
          pendingBalance: balance ? String(pendingBalance) : '0.00',
          consultantPortal: ambassador.user.userType === 'admin' || ambassador.user.userType === 'consultant' ? true : false,
          adminPortal: ambassador.user.userType === 'admin' ? true : false,
          successEdit: req.query.image === 'success' || req.query.edit === 'success' ? 'Successfully Updated Profile!' : null,
          failureEdit: req.query.image === 'fail' || req.query.edit === 'fail' ? 'Error Updating Profile!' : null,
        })
      })
      .catch(error => {
        res.send(error.stack);
        console.log('Error:', error);
      })
    })
    .catch(err => {
      console.error(err)
      res.redirect('/users/myProfile')
    })
  } else {
    res.redirect('/users/myProfile')
  }
})
//Ambassador profile editing routes
router.get('/services/add', (req, res) => {
  res.render('./Ambassadors/ambassador-add-services', {
    loggedIn: true,
    networkToggled: true,
  });
})

router.get('/services/delete/:id', (req, res) => {
  console.log('chill')
  res.redirect('/ambassadors/myProfile')
})

router.post('/services/add', (req, res) => {
  const newService = new Service ({
    user: req.user._id,
    title: req.body.serviceTitle,
    description: req.body.serviceDescription,
    price: Number(req.body.servicePrice),
  })
  newService.save()
  .then(service => {
    Ambassador.findOneAndUpdate({user: req.user._id}, {$push : {services: service._id}}, {new: true})
    .then(ambassador => {
      console.log('successfully added service!')
      res.redirect('/ambassadors/myProfile?serviceadd=success')
    })
  })
  .catch(err => {
    console.error(err)
    res.redirect('/ambassadors/myProfile?serviceadd=fail')
  })
})

//add to ambassador profile
router.get('/edit/ambassadorProfile', (req, res) => {
  res.render('./Ambassadors/ambassador-add-profile')
})

//stripe authorization

router.get('/stripe/authorize', ambassadorRequired, (req, res) => {
  req.session.state = Math.random().toString(36).slice(2);
  let parameters = {
    client_id: process.env.STRIPE_CLIENT_ID,
    state: req.session.state
  };
  // Optionally, Stripe Connect accepts `first_name`, `last_name`, `email`,
  // and `phone` in the query parameters for them to be autofilled.
  parameters = Object.assign(parameters, {
    'stripe_user[business_type]': 'individual',
    'stripe_user[first_name]': req.user.name.split(' ')[0] || undefined,
    'stripe_user[last_name]': req.user.name.split(' ')[1]|| undefined,
    'stripe_user[email]': req.user.email,
    // 'stripe_user[business_name]': req.user.businessName || undefined,
  });
  // Redirect to Stripe to start the Connect onboarding.
  res.redirect(process.env.STRIPE_AUTH_URI + '?' + querystring.stringify(parameters));
})

router.get('/stripe/token', ambassadorRequired, async (req, res) => {
  if (req.session.state != req.query.state) {
    res.redirect('/ambassadors/register');
  }
  // Post the authorization code to Stripe to complete the authorization flow.
  request.post(process.env.STRIPE_TOKEN_URI, {
    form: {
      grant_type: 'authorization_code',
      client_id: process.env.STRIPE_CLIENT_ID,
      client_secret: process.env.STRIPE_SECRET_KEY,
      code: req.query.code
    },
    json: true
  }, (err, response, body) => {
    console.log('====BODY=====', body);
    if (err || body.error) {
      console.log('====RESPONSE====', response);
      console.log('====BODY====', body);
      console.log('====ERR====', err);
      console.log('The Stripe onboarding process has not succeeded.');
      res.redirect('/ambassadors/myProfile?onboarding=failed')
    } else {
      // Update the model and store the Stripe account ID in the datastore.
      // This Stripe account ID will be used to pay out to the pilot.
      console.log('Stripe account official connected with Apiary!');
      Ambassador.findOneAndUpdate({user: req.user._id}, {$set : {stripeAccountId: body.stripe_user_id, stripeVerified: true}}, {new: true})
      .then(ambassador => {
        console.log('Ambassador updated in database!');
        res.redirect('/ambassadors/myProfile?onboarding=success');
      })
      .catch(err => {
        console.error(err)
        res.redirect('/ambassadors/myProfile?onboard=success&database=failed')
      })
    }
  });
})




module.exports =  router
