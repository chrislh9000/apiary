const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const _ = require('underscore');
const models = require('../models/models');
const User = models.User;
const OauthToken = models.OauthToken;


const {google} = require('googleapis');
let accessToken;
// const credentials = require('../credentials.json').installed

const scope = 'https://www.googleapis.com/auth/calendar'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_APPLICATION_ID,
  process.env.GOOGLE_APPLICATION_SECRET,
  process.env.REDIRECT_URL,
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

function generateOauthUrl(userId) {
  console.log('open URI: ', oauth2Client.generateAuthUrl({
    access_type: 'offline',
    state: userId,
    scope: [
      'https://www.googleapis.com/auth/calendar'
    ]
  }));
}

oauth2Client.on('tokens', (tokens) => {
});


// FUNCTION TO ADD A SCHEDULING EVENT
function scheduleConsultation(token, event) {
  console.log('=====SCHEDULING CONSULTATION=====');
  oauth2Client.setCredentials(token);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  calendar.events.insert({
    auth: oauth2Client,
    calendarId: 'o3i55kndm0ad3060lv7k230s28@group.calendar.google.com',
    resource: event,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event created: %s', event.htmlLink);
  });
}

function cancelConsultation(token, eventId) {
  console.log('=====CANCELLING CONSULTATION=====');
  oauth2Client.setCredentials(token);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  console.log('=====CALENDAR=====', calendar);
  calendar.events.delete({
    auth: oauth2Client,
    calendarId: 'o3i55kndm0ad3060lv7k230s28@group.calendar.google.com',
    eventId: eventId,
  }, function(err) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('=====Event deleted!======');
  });
}

function updateConsultation(token, eventId, updatedEvent) {
  console.log('=====UPDATING CONSULTATION=====');
  oauth2Client.setCredentials(token);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  console.log('=====CALENDAR=====', calendar);
  calendar.events.update({
    auth: oauth2Client,
    calendarId: 'o3i55kndm0ad3060lv7k230s28@group.calendar.google.com',
    eventId: eventId,
    resource: updatedEvents,
  }, function(err, event) {
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('=====Event Updated======', event);
  });
}

router.get('/scheduleSession', function(req, res, next) {
  if (!req.user) {
    res.redirect('/?logged=false');
  } else {
    User.findById(req.user._id)
    .then((user) => {
      if (!user || user.userType === 'user') {
        res.render('network-payment-wall', {
          loggedIn: true,
          networkToggled: true,
          message: 'Schedule a Session with Your Personal Consultant',
        })
      } else {
        OauthToken.findOne({ user: 'apiaryCalender' })
        .then((user) => {
          if (user && user.refreshToken) {
            oauth2Client.setCredentials({
              access_token: user.accessToken,
              token_type: 'Bearer',
              refresh_token: user.refreshToken,
              expiry_date: 1530585071407,
            });
            calendar.events.list({
              calendarId: 'o3i55kndm0ad3060lv7k230s28@group.calendar.google.com', // Go to setting on your calendar to get Id
              timeMin: (new Date()).toISOString(),
              maxResults: 20,
              singleEvents: true,
              orderBy: 'startTime',
            }, (err, {data}) => {
              if (err) return console.log('The API returned an error: ' + err);
              const events = data.items;
              const availability = _.map(events, (event) => {
                return {
                  'id' : event.id,
                  'calId': event.organizer.email,
                  'start': event.start.dateTime,
                  'end': event.end.dateTime,
                  'startDate': new Date(event.start.dateTime),
                  'endDate': new Date(event.end.dateTime),
                  'formattedStart': String(new Date(event.start.dateTime)).slice(0,21),
                  'formattedEnd': String(new Date(event.end.dateTime)).slice(0,21),
                }
              })
              console.log('===AVAILABILITY====', availability);
              if (events.length) {
                console.log('====EVENTS=====', events);
                res.render('scheduleSession', {
                  loggedIn: true,
                  networkToggled: true,
                  username: req.user.username,
                  availability: availability,
                })
              } else {
                console.log('No upcoming events found.');
              }
            });
          } else {
            res.render('/')
          }
        })
        .catch((err) => {
          console.error(err);
        })
      }
    })
  }
})

//SCHEDULESESSION Route

router.post('/scheduleSession/:eventid', (req, res, next) => {
  const eventId = req.params.eventid;
  console.log('STARTDATE', req.body.startDate);
  User.findByIdAndUpdate(req._id)
  .then((user) => {
    res.redirect('/scheduleSession')
  })
  .catch((err) => {
    console.error(err);
  })
  // const startDate = new Date(req.body.date);
  // const endDate = new Date(req.body.date);
  // const timeSlot = req.body.timeslot;
  // const timeHours = Number(timeSlot.slice(0, 2));
  // const timeMinutes = Number(timeSlot.slice(3, 5));
  // const currDay = startDate.getDate() //if there's some sort of timezone issue
  // startDate.setHours(timeHours);
  // startDate.setMinutes(timeMinutes);
  // endDate.setHours(timeHours + 1);
  // OauthToken.findOne({ user: 'apiaryCalender' })
  // .then((user) => {
  //   console.log('CALLING TEST', user)
  //   if (user && user.refreshToken) {
  //     oauth2Client.setCredentials({
  //       refresh_token: user.refreshToken,
  //       access_token: user.accessToken
  //     });
  //     const newConsultation = {
  //       'summary': `Consultation Session with ${req.user.name}` ,
  //       'location': 'New York, NY, 10069',
  //       'description': 'Consultation with Apiary Solutions',
  //       'start': {
  //         'dateTime': startDate.toISOString(),
  //         'timeZone': 'America/Los_Angeles',
  //       },
  //       'end': {
  //         'dateTime': endDate.toISOString(),
  //         'timeZone': 'America/Los_Angeles',
  //       },
  //       'attendees': [
  //         {'email': req.user.email},
  //       ],
  //       'reminders': {
  //         'useDefault': false,
  //         'overrides': [
  //           {'method': 'email', 'minutes': 24 * 60},
  //           {'method': 'popup', 'minutes': 10},
  //         ],
  //       },
  //     };
  //     console.log('client token', oauth2Client.credentials.access_token);
  //     console.log('=====NEW CONSULTATION=====', newConsultation);
  //     scheduleConsultation({
  //       access_token: oauth2Client.credentials.access_token,
  //       token_type: 'Bearer',
  //       refresh_token: oauth2Client.credentials.refresh_token,
  //       expiry_date: 1530585071407,
  //     }, newConsultation);
  //     res.redirect('/scheduleSession?success=true')
  //   } else {
  //     console.log('no token found!');
  //     generateOauthUrl('apiaryCalender');
  //   }
  // })
  // .catch((err) => {
  //   // res.status(501).send('error: ', err)
  //   console.log('ERROR', err);
  // });
});

router.get('/sessions', (req, res) => {
  res.render('./Consultations/clientSessions', {
    loggedIn: true,
    networkToggled: true,
  });
})

//TEST ROUTE TO CALL ABOVE FUNCTION
router.get('/test', (req, res, next) => {
  OauthToken.findOne({ user: 'apiaryCalender' })
  .then((user) => {
    console.log('CALLING TEST', user)
    if (user && user.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: user.refreshToken,
        access_token: user.accessToken
      });
      console.log('client token', oauth2Client.credentials.access_token);
      listEvents({
        access_token: oauth2Client.credentials.access_token,
        token_type: 'Bearer',
        refresh_token: oauth2Client.credentials.refresh_token,
        expiry_date: 1530585071407,
      });
      res.send('set credentials')
    } else {
      console.log('no token found!');
      generateOauthUrl('apiaryCalender');
    }
  })
  .catch((err) => {
    res.status(500).send('error: ', err)
  });
});


router.get(process.env.REDIRECT_URL.replace(/https?:\/\/.+\//, '/'), (req, res) => {
  oauth2Client.getToken(req.query.code, function (err, token) {
    if (err) return console.error(err.message)
    const userId = req.query.state
    console.log('=====TOKENACCESS', token)
    //create a user right here
    const newToken = new OauthToken ({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      user: userId
    })
    console.log('saving user', newToken)
    newToken.save()
    .then(() => {
      console.log('successfully created new user')
    })
    .catch((err) => {
      console.log('Error: ', err)
    })
    console.log('token', token, 'req.query:', req.query) // req.query.state <- meta-data
    res.send('ok');
  })
})

module.exports = router;
