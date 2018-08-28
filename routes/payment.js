const express = require('express');
const router = express.Router();
const passport = require('passport');
const models = require('../models/models');
const User = models.User;
const Payment = models.Payment;
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
      res.render('payment')
    })
    .catch(err => {
      res.redirect('/checkout?success=false');
    })
  } else {
    res.redirect('/checkout?success=false');
  }
})

// {
//   "id": "WH-COC11055RA711503B-4YM959094A144403T",
//   "create_time": "2018-04-16T21:21:49.000Z",
//   "resource_type": "checkout-order",
//   "event_type": "CHECKOUT.ORDER.COMPLETED",
//   "summary": "Checkout Order Completed",
//   "resource": {
//     "update_time": "2018-04-01T21:20:49Z",
//     "create_time": "2018-04-01T21:18:49Z",
//     "purchase_units": [
//       {
//         "reference_id": "d9f80740-38f0-11e8-b467-0ed5f89f718b",
//         "amount": {
//           "currency_code": "USD",
//           "value": "100.00"
//         },
//         "payee": {
//           "email_address": "seller@example.com"
//         },
//         "shipping": {
//           "method": "United States Postal Service",
//           "address": {
//             "address_line_1": "2211 N First Street",
//             "address_line_2": "Building 17",
//             "admin_area_2": "San Jose",
//             "admin_area_1": "CA",
//             "postal_code": "95131",
//             "country_code": "US"
//           }
//         },
//         "payments": {
//           "captures": [
//             {
//               "id": "3C679366HH908993F",
//               "status": "COMPLETED",
//               "amount": {
//                 "currency_code": "USD",
//                 "value": "100.00"
//               },
//               "seller_protection": {
//                 "status": "ELIGIBLE",
//                 "dispute_categories": [
//                   "ITEM_NOT_RECEIVED",
//                   "UNAUTHORIZED_TRANSACTION"
//                 ]
//               },
//               "final_capture": true,
//               "seller_receivable_breakdown": {
//                 "gross_amount": {
//                   "currency_code": "USD",
//                   "value": "100.00"
//                 },
//                 "paypal_fee": {
//                   "currency_code": "USD",
//                   "value": "3.00"
//                 },
//                 "net_amount": {
//                   "currency_code": "USD",
//                   "value": "97.00"
//                 }
//               },
//               "create_time": "2018-04-01T21:20:49Z",
//               "update_time": "2018-04-01T21:20:49Z",
//               "links": [
//                 {
//                   "href": "https://api.paypal.com/v2/payments/captures/3C679366HH908993F",
//                   "rel": "self",
//                   "method": "GET"
//                 },
//                 {
//                   "href": "https://api.paypal.com/v2/payments/captures/3C679366HH908993F/refund",
//                   "rel": "refund",
//                   "method": "POST"
//                 }
//               ]
//             }
//           ]
//         }
//       }
//     ],
//     "links": [
//       {
//         "href": "https://api.paypal.com/v2/checkout/orders/5O190127TN364715T",
//         "rel": "self",
//         "method": "GET"
//       }
//     ],
//     "id": "5O190127TN364715T",
//     "gross_amount": {
//       "currency_code": "USD",
//       "value": "100.00"
//     },
//     "intent": "CAPTURE",
//     "payer": {
//       "name": {
//         "given_name": "John",
//         "surname": "Doe"
//       },
//       "email_address": "buyer@example.com",
//       "payer_id": "QYR5Z8XDVJNXQ"
//     },
//     "status": "COMPLETED"
//   },
//   "links": [
//     {
//       "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-COC11055RA711503B-4YM959094A144403T",
//       "rel": "self",
//       "method": "GET",
//       "encType": "application/json"
//     },
//     {
//       "href": "https://api.sandbox.paypal.com/v1/notifications/webhooks-events/WH-COC11055RA711503B-4YM959094A144403T/resend",
//       "rel": "resend",
//       "method": "POST",
//       "encType": "application/json"
//     }
//   ],
//   "event_version": "1.0",
//   "zts": 1494957670,
//   "resource_version": "2.0"
// }



module.exports = router;
