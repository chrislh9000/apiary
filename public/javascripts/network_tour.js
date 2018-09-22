// var hopscotch = require('hopscotch')
var tour = {
  id: "apiary-network-tour",
  steps: [
    {
      title: "Welcome to the Apiary Network!",
      content: "Welcome to the Apiary Network. This tour will take you through some of Apiary's key features. After this tour, you will be familiar with building your Apiary profile, interacting with other Apiary users through the Apiary platform, and working with Apiary's exceptional ambassadors.",
      target: "apiary-network-navbar",
      xOffset: 'center',
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      placement: "bottom",
    },
    {
      title: "The Apiary Network Sidebar",
      content: "This is the Apiary Navigation Sidebar. Find users and ambassadors to help you with your college application needs, browse our database and forums, or schedule and manage your consultations.",
      target: "apiary-network-sidebar",
      showPrevButton: true,
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      placement: "right",
      onShow: () => {
        $('#apiary-network-sidebar-title').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#apiary-network-sidebar-title').removeClass('tour-highlight')
      },
      onClose: () => {
        $('#apiary-network-sidebar-title').removeClass('tour-highlight')
        console.log('working!!!')
      },
    },
    {
      title: "Apiary Ambassadors",
      content: "Ambassadors are college students from the top schools in the country. On the ambassador page, you can freely browse and consult with any Apiary ambassador",
      target: "sidebar-ambassadors",
      placement: "right",
      showPrevButton: true,
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      yOffset: -13,
      onShow: () => {
        $('#apiary-network-sidebar-title').removeClass('tour-highlight')
        $('#sidebar-ambassadors').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#apiary-network-sidebar-title').addClass('tour-highlight')
        $('#sidebar-ambassadors').removeClass('tour-highlight')
      },
      onClose: () => {
        $('#sidebar-ambassadors').removeClass('tour-highlight')
        console.log('HEYYYY')
      },
    },
    {
      title: "Apiary Users",
      content: "Apiary users are also a great resource. Pool together your knowledge and work with one another on the 'Apiary Users' page.",
      target: "sidebar-users",
      placement: "right",
      showPrevButton: true,
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      yOffset: -13,
      onShow: () => {
        $('#sidebar-ambassadors').removeClass('tour-highlight')
        $('#sidebar-users').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#sidebar-ambassadors').addClass('tour-highlight')
        $('#sidebar-users').removeClass('tour-highlight')
      },
    },
    {
      title: "The Apiary Forums",
      content: "The Apiary Forums are an oppurtnity for you to pose questions to the Apiary community. Apiary ambassadors frequently check and respond to questions on the forum.",
      target: "sidebar-forums",
      placement: "right",
      showPrevButton: true,
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      yOffset: -13,
      onShow: () => {
        $('#sidebar-users').removeClass('tour-highlight')
        $('#sidebar-forums').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#sidebar-users').addClass('tour-highlight')
        $('#sidebar-forums').removeClass('tour-highlight')
      },
    },
    {
      title: "The Apiary Database",
      content: "The Apiary database is a collection of essays, resumes and other documents contributed by Apiary ambassadors. The essays and documents in the Apiary database are the hard and honest work of past students who have enjoyed tremendous success with the college process.",
      target: "sidebar-database",
      placement: "right",
      showPrevButton: true,
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      yOffset: -13,
      onShow: () => {
        $('#sidebar-forums').removeClass('tour-highlight')
        $('#sidebar-database').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#sidebar-forums').addClass('tour-highlight')
        $('#sidebar-database').removeClass('tour-highlight')
      },
    },
    {
      title: "Managing your Consultations and Services",
      content: "Manage and schedule your upcoming consultations with Apiary ambassadors here. We'll get into how to look for services later on in the tour.",
      target: "sidebar-consultations",
      placement: "right",
      showPrevButton: true,
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      yOffset: -13,
      onShow: () => {
        $('#sidebar-database').removeClass('tour-highlight')
        $('#sidebar-consultations').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#sidebar-database').addClass('tour-highlight')
        $('#sidebar-consultations').removeClass('tour-highlight')
      },
    },
    {
      title: "Searching for Users and Ambassadors",
      content: "Use the 'Search By' dropdown to filter Apiary ambassadors or users by school, major, name, and a host of other categories.",
      target: "navbar-searchbar",
      showPrevButton: true,
      showCTAButton: true,
      ctaLabel: 'Close and Never Show',
      onCTA: () => {
        window.location.href= "/users/tour/toggle"
      },
      placement: "bottom",
      onShow: () => {
        $('#sidebar-consultations').removeClass('tour-highlight')
        $('#navbar-searchbar').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#sidebar-consultations').addClass('tour-highlight')
        $('#navbar-searchbar').removeClass('tour-highlight')
      },
    },
    {
      title: "View and Edit Your Apiary Profile",
      content: "That's the Apiary Network page! Click 'Done' to go to your profile page, where you can view and edit your apiary profile!",
      target: "navbar-myprofile",
      showPrevButton: true,
      placement: "bottom",
      onShow: () => {
        $('#navbar-searchbar').removeClass('tour-highlight')
        $('#navbar-myprofile').addClass('tour-highlight')
        $('.hopscotch-next').on('click', (event) => {
          event.preventDefault()
          window.location.href= "/users/myProfile"
        })
      },
      onPrev: () => {
        $('#navbar-searchbar').addClass('tour-highlight')
        $('#navbar-myprofile').removeClass('tour-highlight')
      },
    },
  ]
};

// Start the tour!
hopscotch.startTour(tour);
