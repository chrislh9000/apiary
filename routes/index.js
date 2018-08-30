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
const Image = models.Image;
//image uploading stuff

//moments js
const moment = require('moment')

const path = require('path');
// const crypto = require('crypto');
const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'apiary-solutions',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profiles')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  },
  fileFilter: (req, file, cb) => {
    if (file.size > 1000000) cb(null, false);
    else cb(null, true);
  }
});

const upload =  multer({ storage: storage });

function hashPassword(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

// Profile stuff
router.get('/users/myProfile', function(req, res, next) {
  let hasImage= true;
  Image.findOne({user: req.user._id})
  .then(image => {
    if (!image) hasImage = false;
    User.findOne({_id: req.user._id})
    .populate({
      path: 'consultant',
      populate: {
        path: 'user'
      }
    })
    .exec()
    .then((user) => {
      console.log('===CONSULTANT====', user.consultant)
        res.render('profile', {
          user: user,
          logged: req.user.username,
          username: req.user.username,
          image: user.image? image.cloudinaryUrl : null,
          owner: true,
          networkToggled: true,
          loggedIn: true,
          consultantSkype: user.consultant ? user.consultant.skype : null,
          consultantPortal: user.userType === 'admin' || user.userType === 'consultant' ? true : false,
          adminPortal: user.userType === 'admin' ? true : false,
          successEdit: req.query.image === 'success' || req.query.edit === 'success' ? 'Successfully Updated Profile!' : null,
          failureEdit: req.query.image === 'fail' || req.query.edit === 'fail' ? 'Error Updating Profile!' : null,
        })
    })
    .catch(error => {
      res.send(error);
    })
  })
  .catch(err => {
    console.error(err)
    res.redirect('/users/myProfile')
  })
})

//editing profile

router.get('/users/edit', function(req, res, next) {
  User.findOne({username: req.user.username})
  .then((user) => {
    console.log('userSchool', user.school);
    res.render('editProfile', {
      user: user,
      firstName: user.name.split(" ")[0],
      lastName: user.name.split(" ")[1],
      networkToggled: true,
      loggedIn: true,
      logged: req.user.username,
      dateOfBirth: req.user.dateOfBirth,
      academicInterests: req.user.academicInterests,
      extracurricularInterests: req.user.academicInterests,
      country: req.user.country,
      intendedMajor: req.user.intendedMajor,
      dreamUni: req.user.dreamUni,
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
    dateOfBirth: req.body.dateOfBirth,
    academicInterests: [req.body.interest0, req.body.interest1, req.body.interest2],
    extracurricularInterests: [req.body.hobby0, req.body.hobby1, req.body.hobby2],
    country: req.body.country,
    intendedMajor: req.body.intendedMajor,
    dreamUni: req.body.dreamUni
  }).exec().then((resp) => {
    console.log('User successfully updated', resp);
    res.redirect('/users/myProfile?edit=success');
  }).catch((error) => {
    console.log('Error', error);
    res.redirect('/users/myProfile?edit=fail');
  })
})

//Viewing other profiles
//viewing all profiles
router.get('/users/all', function(req, res, next) {
  User.findById(req.user._id)
  .populate({
    path: 'consultant',
    populate: {
      path: 'user'
    }
  })
  .exec()
  .then((user) => {
    if (!user || user.userType === 'user') {
      res.render('network-payment-wall', {
        message: 'Apiary Network Members',
        loggedIn: true,
        canPurchase: true,
        networkToggled: true
      })
    } else {
      User.find()
      .populate({
        path: 'consultant image',
        populate: {
          path: 'user'
        }
      })
      .exec()
      .then(users => {
        const networkMembers = _.filter(users, (user) => {
          return user.userType !== 'user';
        })
        res.render('networkProfiles', {
          users: networkMembers,
          logged: req.user.username,
          networkToggled: true,
          consultantSkype: user.consultant ? user.consultant.skype : null,
          loggedIn: true
        })
      }).catch((error) => {
        console.log('Error', error)
        res.send(error);
      })
    }
  }).catch((err) => {
    console.error(err);
  })
})

//view a single profile
router.get('/users/:userid', function(req, res, next) {
  var userId = req.params.userid;
  User.findById(userId)
  .populate('image')
  .exec()
  .then((user) => {
    res.render('profile', {
      user: user,
      logged: req.user.username,
      owner: false,
      consultantSkype: user.skype,
      image: user.image? user.image.cloudinaryUrl : null,
      networkToggled: true,
      loggedIn: true,
    })
  }).catch((error) => {
    console.log('Error', error)
    res.send(error);
  })
})
//Consultant-specific routes
router.get('/consultants/profile', (req, res) => {
  if (req.user.userType === 'client' || req.user.userType === 'user') {
    res.redirect('/');
  } else {
    Consultant.findOne({user: req.user._id})
    .populate({
      path: 'upcomingConsultations pastConsultations',
      populate: {
        path: 'client'
      }
    })
    .exec()
    .then((consultant) => {

      const upcomingTimes = consultant.upcomingConsultations.map(consultation => {
        return  {
          time: String(moment(consultation.time).format('LLLL')),
          duration: consultation.duration,
          name: consultation.client.name,
        }
      })
      const pastTimes = consultant.pastConsultations.map(consultation => {
        return {
          time: String(moment(consultation.time).format('LLLL')),
          duration: consultation.duration,
          name: consultation.client.name,
        }
      })
      res.render('./Consultations/consultant-profile.hbs', {
        upcoming: upcomingTimes,
        past: pastTimes,
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
  .then(consultation => {
    User.findById(consultation.client)
    .populate('upcomingConsultations')
    .then(user => {
      console.log('FILTERID===', cId)
      console.log('CONSULTATIONID===', consultation._id)
      const newSessions = _.filter(user.upcomingConsultations, (consultation) => {
        return String(consultation._id) !== String(cId);
      })
      console.log('====NEW SESSIONS====', newSessions);
      User.findByIdAndUpdate(user._id, {$set: {upcomingConsultations: newSessions}}, {new: true})
      .then(user => {
        User.findByIdAndUpdate(user._id, {$push: {pastConsultations: consultation}}, {new: true})
        .then(user => {
          console.log('====USER UPDATED======', user);
          Consultant.findOne({user: req.user._id})
          .populate('upcomingConsultations')
          .exec()
          .then(consultant => {
            const newConsultations = _.filter(consultant.upcomingConsultations, (consultation) => {
              return String(consultation._id) !== String(cId);
            })
            console.log('====NEW CONSULTATIONS====', newConsultations);
            Consultant.findOneAndUpdate({user: req.user._id},{$set: {upcomingConsultations: newSessions}}, {new: true})
            .then((consultant) => {
              console.log('====CONSULTANT UPDATED======', consultant);
              Consultant.findOneAndUpdate({user: req.user._id}, {$push: {pastConsultations: consultation}}, {new: true})
              .then(consultant => {
                console.log('SUCCESSFULLY UDPATED USER AND CONSULTANT MODELS', consultant);
                res.redirect('/consultants/profile');
              })
            })
            .catch(err => {
              console.error(err);
            })
          })
          .catch(err => {
            console.error(err);
          })
        })
        .catch(err => {
          console.error(err);
        })
      })
    })
    .catch((err) => {
      console.error(err);
    })
  })
  .catch(err => {
    console.error(err);
  })
})

//Manage consultations route

router.get('/sessions', (req, res) => {
  User.findById(req.user._id)
  .populate({
    path: 'upcomingConsultations pastConsultations',
    populate: {
      path: 'consultant'
    }
  })
  .exec().then((user) => {
    console.log('user', user);
    const formattedUpcomingTimes = user.upcomingConsultations.map(consultation => {
      return  {
        time: String(moment(consultation.time).format('LLLL')),
        duration: consultation.duration,
      }
    })

    const formattedPastTimes = user.pastConsultations.map(consultation => {
      return {
        time: String(moment(consultation.time).format('LLLL')),
        duration: consultation.duration,
      }
    })

    console.log('====FORMATTED====', formattedUpcomingTimes);

    res.render('./Consultations/clientSessions', {
      loggedIn: true,
      networkToggled: true,
      user: user,
      upcoming: formattedUpcomingTimes,
      past: formattedPastTimes,
    });
  })
})

//Network database stuff /
router.get('/database/essays', (req, res, next) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Essay Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  } else {
    res.render('essay-database', {
      message: 'Apiary Academic Excellence Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  }
})

router.get('/database/internships', (req, res) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Essay Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  } else {
    res.render('internships', {
      message: 'Apiary Internships Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  }
})

router.get('/database/test-prep', (req, res) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Essay Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  } else {
    res.render('test-prep', {
      message: 'Apiary Test Prep Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  }
})

router.get('/database/classNotes', (req, res, next) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Academic Excellence Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  } else {
    res.render('ib-ap', {
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  }
})

router.get('/database/resumes', (req, res, next) => {
  if (req.user.userType === 'user') {
    res.render('network-payment-wall', {
      message: 'Apiary Resume Database',
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  } else {
    res.render('resumes', {
      loggedIn: true,
      canPurchase: true,
      networkToggled: true
    })
  }
})

//Image UPLOADING
router.get('/uploadimage', (req, res) => {
  res.render('./Profiles/images', {
    networkToggled: true,
    loggedIn: true,
  })
})



router.post('/uploadimage', upload.single('image'), function (req, res, next) {
  const fileType = req.file.mimetype.slice(0,5);
  const imageExt = req.file.mimetype.slice(6,10);
  if (fileType === 'image') {
    Image.findOne({user: req.user._id})
    .then(image => {
      if (!image) {
        const newImage = new Image({
          filename: req.file.filename,
          size: req.file.size,
          type: imageExt,
          user: req.user._id
        })
        newImage.save()
        .then(img => {
          console.log('SUCCESSFULLY UPLOADED IMAGE');
          User.findByIdAndUpdate(req.user._id, {$set: {image: img._id}}, {new: true})
          .then(user => {
            console.log('USER SUCCESSFULLY UPDATED')
            cloudinary.uploader.upload(`public/profiles/${req.file.filename}`, (err, result) => {
              if (err) {
                console.error(err);
                res.redirect('/users/myProfile');
              } else {
                console.log('=====CLOUDINARY IMAGE UPLOADED=====')
                Image.findOneAndUpdate({user: req.user._id}, {cloudinaryUrl: result.url})
                .then(img => {
                  res.redirect('/users/myProfile?image=success');
                })
              }
            });
          })
          .catch(err => {
            console.error(err);
            res.redirect('/users/myProfile?image=fail')
          })
        })
        .catch(err => {
          console.error(err);
        })
      } else {
        Image.findOneAndUpdate({user: req.user._id}, {
          filename: req.file.filename,
          size: req.file.size,
          type: imageExt,
          user: req.user._id,
        })
        .then((newImage) => {
          console.log('UPDATED PROFILE IMAGE');
          User.findByIdAndUpdate(req.user._id, {$set: {image: newImage._id}}, {new: true})
          .then(user => {
            console.log('new image rendered');
            //upload image to cloudinary
            cloudinary.uploader.upload(`public/profiles/${req.file.filename}`, (result) => {
              console.log('=====CLOUDINARY IMAGE UPLOADED=====');
              Image.findOneAndUpdate({user: req.user._id}, {cloudinaryUrl: result.url})
              .then(img => {
                res.redirect('/users/myProfile?image=success');
              })
            });
          })
          .catch(err => {
            console.error(err)
            res.redirect('/users/myProfile?image=fail')
          })
        })
        .catch(err => {
          console.error(err);
          res.redirect('/users/myProfile?image=fail')
        })
      }
    })

  } else {
    res.send('this is not an image');
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

////////////////////////////////////////NEWSFEED/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/network/newsfeed', (req, res) => {
  res.render('./Network/apiary-feed');
});

router.get('/test/newsfeed', (req, res) => {
  res.render('./Network/newsfeed', {
    networkToggled: true,
    loggedIn: true,
  });
})





module.exports = router;
