var tour = {
  id: "apiary-ambassador-profile-tour",
  steps: [
    {
      title: "Finally an Apiary Ambassador Profile Page!",
      content: "From the ambassador profile page, you can directly message ambassadors, purchase services, and schedule sessions with Apiary Ambassadors",
      target: "ambassador-profile-name",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#ambassador-profile-name').addClass('tour-highlight')
      }
    },
    {
      title: "Viewing Ambassador Credentials",
      content: 'Want to make sure your getting the best possible service? In addition to school prestige, you can also take a look at an ambassador\'s qualifications which can include their resume, links to awards and projects, as well as consulting work they have done in the past',
      target: "ambassador-profile-accomplishments",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#ambassador-profile-name').removeClass('tour-highlight')
        $('#ambassador-profile-accomplishments').addClass('tour-highlight')
      },
    },
    {
      title: "Purchasing Ambassador Services",
      content: 'Click here to view services that an ambassador offers. Apiary Ambassador services can range from college essay reviews to art portfolio builds to college faculty referrals',
      target: "ambassador-profile-services",
      placement: "bottom",
      onShow: () => {
        $('#ambassador-profile-accomplishments').removeClass('tour-highlight')
        $('#ambassador-profile-services').addClass('tour-highlight')
      },
    },
    {
      title: "Interacting with Apiary Users is pretty much the same",
      content: 'There are many Apiary Users who are in the same shoes as you right now: share tips and tricks with them or interact with each other on the Apiary Forums',
      target: "sidebar-users",
      placement: "right",
      onShow: () => {
        $('#ambassador-profile-services').removeClass('tour-highlight')
        $('#sidebar-users').addClass('tour-highlight')
        $('#sidebar-forums').addClass('tour-highlight')
      },
    },
    {
      title: "The End... and Beginning",
      content: 'Hopefully you are ready to take full advantage of the Apiary Platform. If you have any questions don\'t hesitate to reach out!',
      target: "apiary-network-navbar",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#apiary-network-navbar').addClass('tour-highlight')
        $('#sidebar-users').removeClass('tour-highlight')
        $('#sidebar-forums').removeClass('tour-highlight')
        $('.hopscotch-next').on('click', (event) => {
          event.preventDefault()
          //send ajax request to remove tour repetitiveness
          window.location.href= "/users/all"
        })
      },
    },
    //include skype chat button
    // {
    //   title: "Directly message or call with the Apiary Ambassador",
    //   content: 'Want to find out more about an ambassador or his or her services? Click the chat button, sign on to skype and begin corresponding!',
    //   target: "lwc-chat-button",
    //   placement: "top",
    //   onShow: () => {
    //     $('#ambassador-profile-services').removeClass('tour-highlight')
    //   },
    // },
  ]
};

// Start the tour!
hopscotch.startTour(tour);
