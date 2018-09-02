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
const Ambassador = models.Ambassador;
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

//Apiary forum routes
router.get('/network/forum', (req, res) => {
  res.render('./Forum/forum', {
    loggedIn: true,
    networkToggled: true,
    ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
  })
})

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
      res.render('profile', {
        user: user,
        logged: req.user.username,
        username: req.user.username,
        image: user.image? image.cloudinaryUrl : null,
        owner: true,
        ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
        ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
          return user.userType !== 'user' || 'ambassador';
        })
        res.render('networkProfiles', {
          users: networkMembers,
          logged: req.user.username,
          networkToggled: true,
          ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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

router.get('/users/ambassadors', (req, res) => {
  if (req.user.userType === 'user' || !req.user.userType) {
    res.render('network-payment-wall', {
      message: 'Apiary Network Ambassadors',
      loggedIn: true,
      canPurchase: true,
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      networkToggled: true
    })
  } else {
    Ambassador.find()
    .populate({
      path: 'user',
      populate: {
        path: 'image'
      }
    })
    .exec()
    .then(ambassadors => {
      res.render('./Ambassadors/ambassador-network-profiles', {
        ambassadors: ambassadors,
        logged: req.user.username,
        ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
        networkToggled: true,
        loggedIn: true
      })
    })
    .catch(err => {
      console.error(err);
      res.redirect('/users/myProfile');
    })
  }
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
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      networkToggled: true
    })
  } else {
    res.render('essay-database', {
      message: 'Apiary Academic Excellence Database',
      loggedIn: true,
      canPurchase: true,
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      networkToggled: true
    })
  } else {
    res.render('internships', {
      message: 'Apiary Internships Database',
      loggedIn: true,
      canPurchase: true,
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      networkToggled: true
    })
  } else {
    res.render('test-prep', {
      message: 'Apiary Test Prep Database',
      loggedIn: true,
      canPurchase: true,
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
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
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      networkToggled: true
    })
  } else {
    res.render('resumes', {
      loggedIn: true,
      canPurchase: true,
      ambassadorProfile: req.user.userType === 'ambassador' ? true : false,
      networkToggled: true
    })
  }
})

//File UPLOADING

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

// router.post('/images/information', (req, res) => {
//   console.log('===========CALLBACK IMAGE INITIATED=======');
//   console.log('===USER====', req.user._id);
//   console.log('SENT INFO', req.body);
// })

router.post('/images/information', (req, res) => {
  console.log('===========CALLBACK IMAGE INITIATED=======', req.body);
  // check if user already has previously uploaded an image
  Image.findOne({user: req.user._id})
  .then(image => {
    console.log('=====IMAGE SEARCH INITIATED=====');
    if (!image) {
      //case 1: user is uploading an image for the first time: create a new image and link it to the user model
      console.log('=====IMAGE NOT FOUND CREATING IN DB=====');
      const newImage = new Image ({
        filename: req.body.filename,
        size: req.body.size,
        type: req.body.type,
        user: req.user._id,
        cloudinaryUrl: req.body.cloudinaryUrl,
        cloudinaryThumbnail: req.body.cloudinaryThumbnail,
      })
      newImage.save()
      .then(img => {
        //new image created, now update the user model to link the two together
        console.log('====IMAGE SAVED===')
        User.findByIdAndUpdate(req.user._id, {$set: {image: img._id}}, {new: true})
        .then(user => {
          console.log('USER SUCCESSFULLY LINKED TO IMAGE');
          res.redirect('/ambassadors/myProfile?image=success');
        })
      })
      .catch(err => {
        console.error(err)
        res.redirect('/ambassadors/myProfile?image=fail');
      })
    } else {
      console.log('=====IMAGE FOUND UPDATING EXISTING MODEL=====');
      Image.findOneAndUpdate({user: req.user._id}, {
        filename: req.body.filename,
        size: req.body.size,
        type: req.body.type,
        user: req.user._id,
        cloudinaryUrl: req.body.cloudinaryUrl,
        cloudinaryThumbnail: req.body.cloudinaryThumbnail,
      }, {new: true})
      .then(newImage => {
        console.log('===SUCCESSFULLY UPDATED NEW IMAGE===')
        res.redirect('/ambassadors/myProfile?image=success')
      })
      .catch(err => {
        console.error(err)
        res.redirect('/ambassadors/myProfile?image=fail')
      })
      //case 2: user has already uploaded image, in which case just modify the image and user models
    }
  })
  .catch(err => {
    console.error(err)
    res.send("ERROR FINDING IMAGE")
  })
})

router.get('/documents/information', (req, res) => {
  res.send('DOCUMENTS')
})

router.post('/documents/information', (req, res) => {
  Ambassador.findOne({user: req.user._id})
  .then(ambassador => {
    const newDocument = new Image ({
      filename: req.body.filename,
      size: req.body.size,
      type: req.body.type,
      user: req.user._id,
      ambassador: ambassador._id,
      cloudinaryUrl: req.body.cloudinaryUrl,
      cloudinaryThumbnail: req.body.cloudinaryThumbnail,
    })
    newDocument.save()
    .then(doc => {
      console.log('=====DOCUMENT UPLOADED TO DATABASE=====');
      Ambassador.findOneAndUpdate({user: req.user._id}, {$push: {documents: doc}}, {new: true})
      .then(ambassador => {
        console.log('SUCCESSFULLY UPLOADED NEW DOCUMENT')
        res.send('SUCCESS!')
      })
      .catch(err => {
        console.err(err)
      })
    })
    .catch(err => {
      console.error(err)
    })
  })
  .catch(err => {
    console.error(err);
  })
})


// router.post('/images/information', (req, res) => {
//   console.log('===========CALLBACK IMAGE INITIATED=======', req.body);
//   console.log('====TEST IMAGE LOG=====');
//   Image.findOne({user: req.user._id})
//   .then(image => {
//     console.log('=====IMAGE SEARCH INITIATED=====');
//     if (!image) {
//       console.log('=====IMAGE NOT FOUND CREATING IN DB=====');
//       const newImage = new Image({
//         filename: req.body.original_filename,
//         size: req.body.bytes,
//         type: req.body.format,
//         user: req.user._id,
//         cloudinaryUrl: req.body.url,
//       })
//       newImage.save()
//       .then(img => {
//         console.log('=====IMAGE SAVED=====');
//         User.findByIdAndUpdate(req.user._id, {$set: {image: img._id}}, {new: true})
//         .then(user => {
//           console.log('USER SUCCESSFULLY UPDATED');
//           console.log('=====CLOUDINARY IMAGE UPLOADED=====');
//           res.redirect('/ambassadors/myProfile');
//         })
//         .catch(err => {
//           console.error(err);
//           res.redirect('/ambassadors/myProfile?image=fail');
//         })
//       })
//       .catch(err => {
//         console.error(err);
//         res.redirect('/ambassadors/myProfile?image=fail');
//       })
//     } else {
//       console.log('=====IMAGE FOUND UPDATING EXISTING MODEL=====');
//       Image.findOneAndUpdate({user: req.user._id}, {
//         filename: req.body.filename,
//         size: req.body.bytes,
//         type: req.body.format,
//         user: req.user._id,
//         cloudinaryUrl: req.body.url,
//       })
//       .then((newImage) => {
//         console.log('UPDATED PROFILE IMAGE');
//         User.findByIdAndUpdate(req.user._id, {$set: {image: newImage._id}}, {new: true})
//         .then(user => {
//           res.redirect('/ambassadors/myProfile?image=success');
//         })
//         .catch(err => {
//           console.error(err)
//           res.redirect('/ambassadors/myProfile?image=fail')
//         })
//       })
//       .catch(err => {
//         res.send('Error:', err);
//         console.error(err);
//         res.redirect('/users/myProfile?image=fail')
//       })
//     }
//   })
// })

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
// router.get('/network/newsfeed', (req, res) => {
//   res.render('./Network/apiary-feed');
// });
//
// router.get('/test/newsfeed', (req, res) => {
//   res.render('./Network/newsfeed', {
//     networkToggled: true,
//     loggedIn: true,
//   });
// })





module.exports = router;
