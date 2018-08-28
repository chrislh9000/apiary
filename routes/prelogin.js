const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  if (req.query.networkToggled=== 'false') {
    res.render('index', {
      username: req.user.username,
      name: req.user.name,
      loggedIn: true,
    });
  } else if (req.user) {
    res.render('index', {
      username: req.user.username,
      name: req.user.name,
      loggedIn: true,
      networkToggled: false
    });
  } else {
    res.render('index', {loggedIn: false})
  }
});

router.get('/about', function(req, res, next) {
  if (req.user) {
    res.render('about', {
      loggedIn: true,
      username: req.user.username
    })
  } else {
    res.render('about')
  }
})

router.get('/apply', function(req, res, next) {
  if (req.user) {
    res.render('apply', {
      loggedIn: true,
      username: req.user.username
    })
  } else {
    res.render('apply')
  }
})

router.get('/services', function(req, res, next) {
  if (req.user) {
    res.render('our-services', {
      loggedIn: true,
      username: req.user.username
    })
  } else {
    res.render('our-services')
  }
})

router.get('/products', function(req, res, next) {
  if (req.user) {
    res.render('products', {
      loggedIn: true,
      username: req.user.username,
      canPurchase: true,
      networkToggled: true
    })
  } else {
    res.redirect('/')
  }
})

router.get('/network', function(req, res, next) {
  if (req.user) {
    res.render('alpine-network-pre', {
      loggedIn: true,
      username: req.user.username,
      canPurchase: true,
      message: 'APIARY NETWORK'
    })
  } else {
    res.render('alpine-network-pre', {
      message: 'APIARY NETWORK',
      loggedIn: true,
    })
  }
})

module.exports = router;
