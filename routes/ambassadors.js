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
const Service = models.Service;
const StripePayment = models.StripePayment;


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
  res.render('./Ambassadors/ambassador-register', {
    loggedIn: req.user? true : false,
  });
})

router.get('/edit', (req, res) => {
  User.findOne({username: req.user.username})
  .then((user) => {
    console.log('userSchool', user.school);
    res.render('./Ambassadors/edit-ambassador', {
      user: user,
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ")[1],
      networkToggled: true,
      loggedIn: true,
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      logged: req.user.username,
      dateOfBirth: req.user.dateOfBirth,
      academicInterests: req.user.academicInterests,
      extracurricularInterests: req.user.academicInterests,
      country: req.user.country,
      intendedMajor: req.user.intendedMajor,
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

router.post('/edit', function(req, res, next) {
  User.findOneAndUpdate({
    username: req.user.username
  }, {
    username: req.body.username,
    name: req.body.firstName + ' ' + req.body.lastName,
    school: req.body.school,
    email: req.body.email,
    gender: req.body.gender,
    biography: req.body.biography,
    academicInterests: [req.body.interest0, req.body.interest1, req.body.interest2],
    extracurricularInterests: [req.body.hobby0, req.body.hobby1, req.body.hobby2],
    intendedMajor: req.body.intendedMajor,
  }).exec().then((resp) => {
    console.log('User successfully updated', resp);
    res.redirect('/ambassadors/myProfile?edit=success');
  }).catch((error) => {
    console.log('Error', error);
    res.redirect('/ambassadors/myProfile?edit=fail');
  })
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
          consultantSkype: req.user.skypeName,
          image: ambassador.user.image? image.cloudinaryUrl : null,
          owner: true,
          ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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

router.get('/:id', (req, res) => {
  if (req.user.userType === 'user' || !req.user) {
    res.redirect('/')
  } else {
    Ambassador.findById(req.params.id)
    .populate({
      path: 'user services',
      populate: {
        path: 'image'
      }
    })
    .exec()
    .then(ambassador => {
      ambassador.services.map((service) => {
        service.stripePrice = service.price * 100;
      })
      res.render('./Ambassadors/ambassador-profile', {
        user: ambassador,
        services: ambassador.services,
        logged: req.user.username,
        ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
        owner: false,
        consultantSkype: ambassador.user.skype,
        image: ambassador.user.image? ambassador.user.image.cloudinaryUrl : null,
        networkToggled: true,
        loggedIn: true,
      })
    }).catch((error) => {
      console.log('Error', error)
      res.redirect('/users/ambassadors')
    })
  }
})



//Ambassador profile editing routes
router.get('/services/add', (req, res) => {
  res.render('./Ambassadors/ambassador-add-services', {
    loggedIn: true,
    networkToggled: true,
    ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
  });
})

router.get('/services/delete/:id', (req, res) => {
  res.redirect('/ambassadors/myProfile')
})

router.post('/services/add', (req, res) => {
  Ambassador.findOne({user: req.user._id})
  .then(ambassador => {
    const newService = new Service ({
      user: req.user._id,
      title: req.body.serviceTitle,
      description: req.body.serviceDescription,
      price: Number(req.body.servicePrice),
      ambassador: ambassador._id
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
      res.redirect('/services/add?addService=fail');
    })
  })
  .catch(err => {
    console.error(err)
    res.redirect('/ambassadors/myProfile?serviceadd=fail')
  })
})

//add to ambassador profile
router.get('/edit/ambassadorProfile', (req, res) => {
  Ambassador.findOne({user: req.user._id})
  .then(ambassador => {
    res.render('./Ambassadors/ambassador-add-profile', {
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      loggedIn: true,
      networkToggled: true,
      ambassador: ambassador,
    })
  })
  .catch(err => {
    console.error(err);
    res.redirect('/ambassadors/myProfile');
  })
})

router.post('/edit/ambassadorProfile', (req, res) => {
  Ambassador.findOneAndUpdate({user: req.user._id}, {
    accomplishments: req.body.accomplishments,
    specialties: req.body.specialties,
    additionalInfo: req.body.additionalInfo,
  }, {new: true})
  .then(ambassador => {
    console.log('===NEW AMBASSADOR===', ambassador);
    res.redirect('/ambassadors/myProfile?ambassadorEdit=success');
  })
  .catch(err => {
    console.error(err);
    res.redirect('/ambassadors/myProfile?ambassadorEdit=fail')
  })
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

router.get('/stripe/transfers', ambassadorRequired, async (req, res) => {
  Ambassador.findOne({user: req.user._id})
  .then(async ambassador => {
    if (!ambassador.stripeAccountId) {
      return res.redirect('/ambassadors/myProfile');
    }
    try {
      // Generate a unique login link for the associated Stripe account.
      const loginLink = await stripe.accounts.createLoginLink(ambassador.stripeAccountId);
      // Retrieve the URL from the response and redirect the user to Stripe.
      return res.redirect(loginLink.url);
    } catch (err) {
      console.log('Failed to create a Stripe login link.');
      return res.redirect('/ambassadors/myProfile');
    }
  })
});

//payment handling

router.post('/checkout/:id', (req, res) => {
  console.log('CHECKOUT PROCESS INITIALIZED');
  console.log('====BODY=====', req.body);
  Service.findById(req.params.id)
  .populate('ambassador')
  .exec()
  .then(service => {
    console.log('===Service====', service);
    console.log('===StripeCustomer====', typeof req.user.stripeCustomerId);
    if (req.user.stripeCustomerId) {
      stripe.customers.retrieve(String(req.user.stripeCustomerId))
      .then(customer => {
        // YOUR CODE: Save the customer ID and other info in a database for later.
        console.log('successfully created customer=====', customer);
        const newCharge = stripe.charges.create({
          amount: service.price*100,
          currency: "usd",
          customer: customer.id,
          source: customer.source,
          description: 'Apiary Network Ambassador Consultation',
          destination: {
            // Send the amount for the pilot after collecting a 20% platform fee.
            // Typically, the `amountForPilot` method simply computes `ride.amount * 0.8`.
            amount: service.price*80,
            // The destination of this charge is the pilot's Stripe account.
            account: service.ambassador.stripeAccountId,
          },
        });
        return newCharge;
      })
      .then(charge => {
        console.log('====charge====', charge);
        const newStripePayment = new StripePayment({
          stripeBrand: charge.source.brand,
          stripeCustomerId: charge.customer,
          stripeExpMonth: charge.source.exp_month,
          paymentAmount: charge.amount,
          stripeExpYear: charge.source.exp_year,
          stripeLast4: charge.source.last4,
          stripeSource: charge.source.id,
          status: charge.status,
          user: req.user._id,
          ambassador: service.ambassador._id,
        });
        newStripePayment.save()
      })
      .then(payment => {
        console.log('===Payment====', payment)
        res.redirect('/users/myProfile?ambassadorPayment=success');
      })
      .catch(err => {
        console.error(err)
        res.redirect('/users/myProfile?ambassadorPayment=fail');
      })
    } else {
      stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        description: `${req.user.name}'s Customer ID for Apiary Solutions'`
      })
      .then(customer => {
        User.findByIdAndUpdate(req.user._id, {$set: {stripeCustomerId: customer.id}}, {new: true})
        .then(user => {
          // YOUR CODE: Save the customer ID and other info in a database for later.
          console.log('successfully created customer=====', customer);
          const newCharge = stripe.charges.create({
            amount: service.price*100,
            currency: "usd",
            customer: customer.id,
            source: customer.source,
            description: 'Apiary Network Ambassador Consultation',
            destination: {
              // Send the amount for the pilot after collecting a 20% platform fee.
              // Typically, the `amountForPilot` method simply computes `ride.amount * 0.8`.
              amount: service.price* 80,
              // The destination of this charge is the pilot's Stripe account.
              account: service.ambassador.stripeAccountId,
            },
          });
          return newCharge;
        })
        .then(charge => {
          console.log('====charge====', charge);
          const newStripePayment = new StripePayment({
            stripeBrand: charge.source.brand,
            stripeCustomerId: charge.customer,
            stripeExpMonth: charge.source.exp_month,
            paymentAmount: charge.amount,
            stripeExpYear: charge.source.exp_year,
            stripeLast4: charge.source.last4,
            stripeSource: charge.source.id,
            status: charge.status,
            user: req.user._id,
            ambassador: service.ambassador._id,
          });
          newStripePayment.save()
        })
        .then(payment => {
          console.log('===Payment====', payment)
          res.redirect('/users/myProfile?ambassadorPayment=success');
        })
      })
      .catch(err => {
        console.error(err)
        res.redirect('/users/myProfile?ambassadorPayment=fail');
      })
    }
  })
})




module.exports =  router
