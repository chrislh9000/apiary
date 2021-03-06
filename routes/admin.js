const express = require('express');
const router = express.Router();
const passport = require('passport');
const models = require('../models/models');
const User = models.User;
const Consultant = models.Consultant;
const Ambassador = models.Ambassador;
const Service = models.Service;

const bodyParser = require('body-parser')
const _ = require('underscore');

//Permissions middleware management page
router.get('/admin', (req, res, next) => {
  if (req.user.userType !== 'admin') {
    res.redirect('/users/all');
  } else {
    next();
  }
})

//user management page
router.get('/admin', (req, res) => {
  User.find()
  .exec()
  .then((users) => {
    const filteredUsers = _.filter(users, (user) => {
      return user.userType !== 'admin';
    })
    const consultants = _.filter(users, (user) => {
      return user.userType === 'consultant';
    })
    res.render('admin', {
      users: users,
      logged: req.user.username,
      consultants: consultants,
      networkToggled: true,
      loggedIn: true,
    })
  })
  .catch((err) => {
    res.status(500).send(err);
    res.redirect('/');
  })
})

//ambassador management page
router.get('/admin/ambassadors', (req, res) => {
  req.user.userType !== 'admin' ?
  res.redirect(404, '/?permissions=false')
  :
  Ambassador.find()
  .populate('user services')
  .exec()
  .then(ambassadors => {
    res.render('./Admin/admin-ambassadors', {
      loggedIn: true,
      networkToggled: true,
      ambassadors: ambassadors,
    })
  })
})

// approve an ambassador from being displayed
router.get('/admin/ambassadors/approve/:id', (req, res) => {
  Ambassador.findByIdAndUpdate(req.params.id, {$set: {approved: true}}, {new: true})
  .then(ambassador => {
    console.log('successful approval');
    res.redirect('/admin/ambassadors');
  })
})

//unapprove an ambassador from being displayed
router.get('/admin/ambassadors/block/:id', (req, res) => {
  Ambassador.findByIdAndUpdate(req.params.id, {$set: {approved: false}}, {new: true})
  .then(ambassador => {
    console.log('successful unapproval');
    res.redirect('/admin/ambassadors');
  })
})

//clear all of an ambassador's posted services
router.get('/admin/ambassadors/services/clear/:id', (req, res) => {
  Ambassador.findByIdAndUpdate(req.params.id, {$set: {services: []}}, {new: true})
  .then(ambassador => {
    Service.deleteMany({ambassador: ambassador._id})
    .then(resp => {
      console.log('deleted ambassador services');
      res.redirect('/admin/ambassadors');
    });
  })
  .catch(err => {
    console.error(err);
    res.redirect('/');
  })
})

//Clients and consultants

// Update consultant modal with a google calendar id
router.post('/consultants/assignCalendarId/:userid', (req, res) => {
  if (req.user.userType !== 'admin') {
    res.redirect(404, '/?permissions=false');
    console.log("error: you don't have permissions to access this page")
  } else {
    const userId = req.params.userid;
    console.log('==USERID===', req.params.userid)
    console.log('==CalendarUrl===', req.body.calendarUrl)
    User.findByIdAndUpdate(userId, {$set: {calendarId: req.body.calendarUrl}}, {new: true})
    .then((resp) => {
      console.log('====SUCCESSFULLY ADDED CALENDAR URL TO CONSULTANT======', resp);
      res.redirect('/admin?success=true');
    })
    .catch((err) => {
      console.error(err);
    });
  }
})

//assign a consultant a client
router.get('/consultants/assign/:userid', (req, res) => {
  const userId = req.params.userid;
  User.find().then((users) => {
    const consultants = _.filter(users, (user) => {
      return (user.userType === 'consultant' || user.userType === 'admin');
    });
    User.findById(userId)
    .then(client => {
      const formAction = '/admin/assign/' + client._id;
      res.render('assign-consultant', {
        user: client,
        consultants: consultants,
        postRoute: formAction,
        networkToggled: true,
        loggedIn: true,
      })
    })
  })
})

router.post('/consultants/assign/:userid', (req, res) => {
  const userId = req.params.userid;
  //assign and update a consultant object and also update the calendar url
  User.findByIdAndUpdate(userId, { $set : {consultant: req.body.consultant, calendarId: req.body.calendarUrl} }, {new: true})
  .then((resp) => {
    console.log('====SUCCESSFULLY ADDED CONSULTANT=====');
    res.redirect('/admin')
  })
  .catch((err) => {
    console.error('error: ', err);
    res.redirect('/admin?error=true');
  })
})

//Changing permissions for Apiary users
router.post('/admin/consultant/:userid', (req, res) => {
  User.findByIdAndUpdate(req.params.userid, {userType: 'consultant'})
  .exec()
  .then((resp) => {
    console.log('user successfully has been made consultant');
    const newConsultant = new Consultant({
      user: req.params.userid,
    });
    newConsultant.save()
    })
    .then((user) => {
      console.log('consultant model created!');
      res.redirect('/admin');
    })
    .catch((err) => {
    console.error('error updating user to consultant');
  })
})

//making a user an admin
router.post('/admin/admin/:userid', (req, res) => {
    User.findByIdAndUpdate(req.params.userid, {userType: 'admin'})
    .then((resp) => {
      console.log('user successfully has been made admin');
      res.redirect('/admin');
    })
    .catch((err) => {
      console.log('ERROR: error updating user status');
      res.redirect('/admin?error=true');
    })
})

//make a user a client (for consulting purposes)
router.post('/admin/client/:userid', (req, res) => {
    User.findByIdAndUpdate(req.params.userid, {userType: 'client'}).exec().then((resp) => {
      console.log('user successfully has been made client');
      res.redirect('/admin');
    }).catch((err) => {
      console.log('ERROR: error updating user status');
  })
})

//make a user an ambassador and create an ambassador schema for him
router.post('/admin/ambassador/:userid', (req, res) => {
    User.findByIdAndUpdate(req.params.userid, {userType: 'ambassador'})
    .then((resp) => {
      console.log('user successfully has been made ambassador');
      const newAmbassador = new Ambassador({
        user: req.params.userid,
      })
      newAmbassador.save()
      .then((user) => {
        console.log('ambassador model created!')
        res.redirect('/admin');
      })
      console.log('user successfully has been made client');
      res.redirect('/admin');
    })
    .catch((err) => {
      console.error(err, "error creating ambassador modal");
  })
})

// make a consultant or ambassador a user
router.post('/admin/user/:userid', (req, res) => {
    User.findByIdAndUpdate(req.params.userid, {userType: 'user'})
    .exec()
    .then((resp) => {
      console.log('user successfully has been made user');
      res.redirect('/admin');
    })
    .catch((err) => {
      console.error(err, 'ERROR: error updating user status');
  })
})

// Clearing Past and Upcoming User Consultations
router.post('/admin/user/clearUpcomingConsultations/:userid', (req, res) => {
    User.findByIdAndUpdate(req.params.userid, {$set: {upcomingConsultations: []}}, {new: true})
    .then((resp) => {
      console.log('user successfully has cleared consultations');
      res.redirect('/admin');
    })
    .catch((err) => {
      console.log('ERROR: error updating user status');
    })
})

router.post('/admin/user/clearPastConsultations/:userid', (req, res) => {
    User.findByIdAndUpdate(req.params.userid, {$set: {pastConsultations: []}}, {new: true})
    .then((resp) => {
      console.log('user successfully has cleared consultations');
      res.redirect('/admin?clearConsultations=success');
    }).catch((err) => {
      console.error('ERROR: error updating user status');
      res.redirect('/admin?clearConsultations=failure');
    })
})

//clear past and upcoming Consultant Consultations
router.post('/admin/consultant/clearUpcomingConsultations/:userid', (req, res) => {
    Consultant.findOneAndUpdate({user: req.params.userid}, {$set: {upcomingConsultations: []}}, {new: true})
    .then((resp) => {
      console.log('user successfully has cleared consultations');
      res.redirect('/admin');
    }).catch((err) => {
      console.error('ERROR: error updating user status');
      res.redirect('/admin');
  })
})

router.post('/admin/consultant/clearPastConsultations/:userid', (req, res) => {
    Consultant.findOneAndUpdate({user: req.params.userid}, {$set: {pastConsultations: []}}, {new: true})
    .then((resp) => {
      console.log('user successfully has cleared consultations');
      res.redirect('/admin');
    }).catch((err) => {
      console.error('ERROR: error updating user status');
      res.redirect('/admin');
    })
})

// assign a setmoreId to an ambassador for scheduling
router.post('/admin/ambassadors/assignSetmore/:ambassadorid', (req, res) => {
  Ambassador.findByIdAndUpdate(req.params.ambassadorid, {$set : {
    setmoreUrl: req.body.setmoreUrl}
  })
  .then(ambassador => {
    console.log('ambassador setmore url set!');
    res.redirect('/admin/ambassadors?setmore=success');
  })
  .catch(err => {
    console.error(err);
    res.redirect('/admin/ambassadors?setmore=fail');
  })
})

module.exports = router;
