const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const models = require('../models/models');
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
  console.log('tokens========', tokens)
  // if (tokens.refresh_token) {
  //   User.findOneAndUpdate({tokens.access_toke})
  //   .then(() => {
  //     console.log('successfully saved token')
  //   })
  //   .catch((err) => {
  //     console.log('Error: ', err)
  //   });
});


//TEST FUNCTION TO MAKE CALENDAR API CALL
function makeCalendarAPICall(token) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_APPLICATION_ID,
    process.env.GOOGLE_APPLICATION_SECRET,
    process.env.REDIRECT_URL,
  );
  oauth2Client.setCredentials(token);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  calendar.events.list({
    calendarId: 'primary', // Go to setting on your calendar to get Id
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, {data}) => {
    console.log('data', data)
    if (err) return console.log('The API returned an error: ' + err);
    const events = data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

// FUNCTION TO ADD A SCHEDULING EVENT
function scheduleConsultation(token, event) {
  console.log('=====SCHEDULING=====')
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_APPLICATION_ID,
    process.env.GOOGLE_APPLICATION_SECRET,
    process.env.REDIRECT_URL,
  );
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

router.get('/scheduleSession', function(req, res, next) {
  if(req.user) {
    res.render('scheduleSession', {
      loggedIn: true,
      networkToggled: true,
      username: req.user.username
    })
  } else {
      res.redirect('/')
    }
})

//SCHEDULESESSION Route
router.post('/scheduleSession', (req, res, next) => {
  OauthToken.findOne({ user: 'apiaryCalender' })
  .then((user) => {
    console.log('CALLING TEST', user)
    if (user && user.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: user.refreshToken,
        access_token: user.accessToken
      });
      const newConsultation = {
        'summary': `Consultation Session with ${req.user.name}` ,
        'location': 'New York, NY, 10069',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
          'dateTime': '2018-08-15T09:00:00-07:00',
          'timeZone': 'America/Los_Angeles',
        },
        'end': {
          'dateTime': '2018-08-17T17:00:00-08:00',
          'timeZone': 'America/Los_Angeles',
        },
        'attendees': [
          {'email': req.user.email},
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10},
          ],
        },
      };
      console.log('client token', oauth2Client.credentials.access_token);
      console.log('=====NEW CONSULTATION=====', newConsultation);
      scheduleConsultation({
        access_token: oauth2Client.credentials.access_token,
        token_type: 'Bearer',
        refresh_token: oauth2Client.credentials.refresh_token,
        expiry_date: 1530585071407,
      }, newConsultation);
      res.redirect('/scheduleSession')
    } else {
      console.log('no token found!');
      generateOauthUrl('apiaryCalender');
    }
  })
  .catch((err) => {
    // res.status(501).send('error: ', err)
    console.log('ERROR', err);
  });
});



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
      makeCalendarAPICall({
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
