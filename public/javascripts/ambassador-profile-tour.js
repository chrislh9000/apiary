var element = document.getElementsByClassName('lwc-chat-button');
var skypeChat = element[0];

console.log('skypeChat', skypeChat)

var tour = {
  id: "apiary-ambassador-profile-tour",
  steps: [
    {
      title: "Finally an Apiary Ambassador Profile Page!",
      content: "From the ambassador profile page, you can directly message Apiary ambassadors as well as purchase services and schedule sessions with them.",
      target: "ambassador-profile-name",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#ambassador-profile-name').addClass('tour-highlight')
      }
    },
    {
      title: "Viewing Ambassador Credentials",
      content: 'Want to make sure your getting the best possible service? You can also examine an ambassador\'s qualifications, which can include their resume, links to awards and projects, as well as consulting work they have done in the past.',
      target: "ambassador-profile-accomplishments",
      placement: "bottom",
      xOffset: 'center',
      showPrevButton: true,
      onShow: () => {
        $('#ambassador-profile-name').removeClass('tour-highlight')
        $('#ambassador-profile-accomplishments').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#ambassador-profile-name').addClass('tour-highlight')
        $('#ambassador-profile-accomplishments').removeClass('tour-highlight')
      },
    },
    {
      title: "Purchasing Ambassador Services",
      content: 'Click here to view services that an ambassador offers. Apiary ambassador services can range from college essay edits and brainstorms to art portfolio reviews to college professor referrals.',
      target: "ambassador-profile-services",
      placement: "bottom",
      showPrevButton: true,
      onShow: () => {
        $('#ambassador-profile-accomplishments').removeClass('tour-highlight')
        $('#ambassador-profile-services').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#ambassador-profile-accomplishments').addClass('tour-highlight')
        $('#ambassador-profile-services').removeClass('tour-highlight')
      },
    },
    {
      title: "Directly message or call with any Apiary ambassador",
      content: 'Want to find out more about an ambassador or his or her services? Click the chat button on the bottom right corner of the screen, sign on to skype, and start talking!',
      target: "ambassador-profile-services",
      placement: "right",
      showPrevButton: true,
      onShow: () => {
        $('#ambassador-profile-services').removeClass('tour-highlight')
      },
      onPrev: () => {
        $('#ambassador-profile-services').addClass('tour-highlight')
      },
    },
    {
      title: "Interacting with Apiary users is pretty much the same",
      content: 'There are many Apiary users who are in the same shoes as you right now. Share tips and tricks with them or interact with each other on the Apiary Forums.',
      target: "sidebar-users",
      placement: "right",
      showPrevButton: true,
      onShow: () => {
        $('#ambassador-profile-services').removeClass('tour-highlight')
        $('#sidebar-users').addClass('tour-highlight')
        $('#sidebar-forums').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#ambassador-profile-services').addClass('tour-highlight')
        $('#sidebar-users').removeClass('tour-highlight')
        $('#sidebar-forums').removeClass('tour-highlight')
      },
    },
    {
      title: "The End... and Beginning",
      content: 'Hopefully you are ready to take full advantage of the Apiary Platform. If you have any questions don\'t hesitate to reach out!',
      target: "apiary-network-navbar",
      placement: "bottom",
      xOffset: 'center',
      showPrevButton: true,
      onPrev: () => {
        $('#ambassador-profile-services').addClass('tour-highlight')
        $('#sidebar-users').removeClass('tour-highlight')
        $('#sidebar-forums').removeClass('tour-highlight')
      },
      onShow: () => {
        $('#apiary-network-navbar').addClass('tour-highlight')
        $('#sidebar-users').removeClass('tour-highlight')
        $('#sidebar-forums').removeClass('tour-highlight')
        $('.hopscotch-next').on('click', (event) => {
          event.preventDefault()
          //send ajax request to remove tour repetitiveness
          window.location.href= "/users/tour/toggle"
        })
      },
    },
    //include skype chat button
  ]
};

// Start the tour!
hopscotch.startTour(tour);
