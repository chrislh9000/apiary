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
const OauthToken = models.OauthToken;
const Consultant = models.Consultant;
const Consultation = models.Consultation;
//image uploading stuff
const multer = require('multer');
const path = require('path');
// const crypto = require('crypto');
const GridFsStorage= require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride= require('method-override');

function hashPassword(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}


// Profile stuff
router.get('/users/myProfile', function(req, res, next) {
  console.log('====USER====', req.user);
  User.findOne({_id: req.user._id})
  .then((user) => {
    if (user.userType === 'admin') {
      res.render('profile', {
        user: user,
        logged: req.user.username,
        username: req.user.username,
        owner: true,
        networkToggled: true,
        loggedIn: true,
        consultantPortal: true,
        adminPortal: true,
      })
    } else if (user.userType === 'consultant' || user.userType === 'admin') {
      res.render('profile', {
        user: user,
        logged: req.user.username,
        username: req.user.username,
        owner: true,
        networkToggled: true,
        loggedIn: true,
        consultantPortal: true,
      })
    }
    else {
      res.render('profile', {
        user: user,
        logged: req.user.username,
        username: req.user.username,
        owner: true,
        networkToggled: true,
        loggedIn: true,
      })
    };
  })
  .catch((error) => {
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

router.get('/uploadimage', (req, res) => {
  res.render('./Profiles/images')
})

router.post('/uploadimage', (req, res) => {
  console.log('====BODY===', req.body)
  console.log('====BODY===', req.file)
})
//Viewing other profiles
//viewing all profiles
router.get('/users/all', function(req, res, next) {
  User.findById(req.user._id)
  .then((user) => {
    if (!user || user.userType === 'user') {
      res.render('network-payment-wall', {
        message: 'Apiary Network Members',
        loggedIn: true,
        canPurchase: true,
        networkToggled: true,
      })
    } else {
      User.find()
      .exec()
      .then((users) => {
        const networkMembers = _.filter(users, (user) => {
          return user.userType !== 'user';
        })
        res.render('networkProfiles', {
          users: networkMembers,
          logged: req.user.username,
          networkToggled: true,
          loggedIn: true
        })
      })
      .catch((error) => {
        console.log('Error', error)
        res.send(error);
      })
    }
  })
  .catch((err) => {
    console.error(err);
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
//Consultant-specific routes
router.get('/consultants/profile', (req, res) => {
  if(req.user.userType === 'client' || req.user.userType === 'user') {
    res.redirect('/');
  } else {
    Consultant.findOne({user: req.user._id})
    .populate({
      path: 'upcomingConsultations',
      populate: { path: 'client'}
    })
    .exec()
    .then((consultant) => {
      console.log('===CONSULTANT===', consultant)
      res.render('./Consultations/consultant-profile.hbs', {
        upcoming: consultant.upcomingConsultations,
        past: consultant.pastConsultations,
        networkToggled: true,
        loggedIn: true,
      })
    })
  }
})

router.post('/consultation/confirm/:consultationid', (req, res) => {
  //find consultation by id, remove it from upcoming consultations and put it in past consultations
  const cId = req.params.consultationid
  Consultation.findById(cId)
  .populate('client')
  .then((consultation) => {
    console.log('====UPCOMING CONSULTATIONS====', consultation.client._id);
    User.findById(consultation.client)
    .populate('upcomingConsultations')
    .then((user) => {
      const newSessions = _.filter(user.upcomingConsultation,(consultation) => {
        return consultation._id !== cId
      })
    })
    .catch((err) => {
      console.err('error', err);
    })
    User.findByIdAndUpdate(user._id, {$set: {upcomingConsultations: newSessions}}, {new: true})
    .then((user) => {
      Consultant.findOne({user: req.user._id})
      .populate('upcomingConsultations')
      .exec()
      .then((consultation) => {
        const newConsultations = _.filter(user.upcomingConsultation,(consultation) => {
          return consultation._id !== cId
        })
        consultation.set({'upcomingConsultations': newConsultations});
        consultation.save()
        .then(() => {
          res.redirect('/')
        })
        .catch((err) => {
          console.error(err);
        })
      })
    })
  })
  .catch((err) => {
    console.error(err);
  })
})



//Manage consultations route

router.get('/sessions', (req, res) => {
  User.findById(req.user._id)
  .populate('upcomingConsultations')
  .exec()
  .then((user) => {
    console.log('user', user);
    res.render('./Consultations/clientSessions', {
      loggedIn: true,
      networkToggled: true,
      user: user,
      upcoming: user.upcomingConsultations
    });
  })
})



//Network database stuff ///
router.get('/database/essays', (req, res, next) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Essay Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true,
    })
  } else {
    res.render('essay-database', {
      message: 'Apiary Academic Excellence Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true,
    })
  }
})

router.get('/database/classNotes', (req, res, next) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Academic Excellence Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true,
    })
  } else {
    res.render('ib-ap', {
      loggedIn: true,
      canPurchase: true,
      networkToggled: true,
    })
  }
})

router.get('/database/resumes', (req, res, next) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Resume Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true,
    })
  } else {
    res.render('resumes', {
      loggedIn: true,
      canPurchase: true,
      networkToggled: true,
    })
  }
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
