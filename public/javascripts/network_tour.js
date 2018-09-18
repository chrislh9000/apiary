// var hopscotch = require('hopscotch')
console.log('HEY GUYS')

var tour = {
  id: "apiary-network-tour",
  steps: [
    {
      title: "Welcome to the Apiary Network",
      content: "This is the Apiary Navbar. Use this to look for users and ambassadors to help you with your college application needs, and also browse the Apiary Database.",
      target: "apiary-network-sidebar",
      placement: "right",
      onShow: () => {
        $('#apiary-network-sidebar-title').addClass('tour-highlight')
      }
    },
    {
      title: "Apiary Ambassadors",
      content: "Ambassadors are college students from the top schools in the country. On the ambassador page, you can freely browse and consult with all apiary ambassadors",
      target: "sidebar-ambassadors",
      placement: "right",
      yOffset: -13,
      onShow: () => {
        $('#apiary-network-sidebar-title').removeClass('tour-highlight')
        $('#sidebar-ambassadors').addClass('tour-highlight')
      },
    },
    {
      title: "Apiary Users",
      content: "Ambassadors are college students from the top schools in the country. On the ambassador page, you can freely browse and consult with all apiary ambassadors",
      target: "sidebar-users",
      placement: "right",
      yOffset: -13,
      onShow: () => {
        $('#sidebar-ambassadors').removeClass('tour-highlight')
        $('#sidebar-users').addClass('tour-highlight')
      },
    },
    {
      title: "The Apiary Forums",
      content: "Ambassadors are college students from the top schools in the country. On the ambassador page, you can freely browse and consult with all apiary ambassadors",
      target: "sidebar-forums",
      placement: "right",
      yOffset: -13,
      onShow: () => {
        $('#sidebar-users').removeClass('tour-highlight')
        $('#sidebar-forums').addClass('tour-highlight')
      },
    },
    {
      title: "The Apiary Database",
      content: "Ambassadors are college students from the top schools in the country. On the ambassador page, you can freely browse and consult with all apiary ambassadors",
      target: "sidebar-database",
      placement: "right",
      yOffset: -13,
      onShow: () => {
        $('#sidebar-forums').removeClass('tour-highlight')
        $('#sidebar-database').addClass('tour-highlight')
      },
    },
    {
      title: "Searching for Users and Ambassadors",
      content: "Use the search bar and dropdown to search for Apiary users and ambassasdors. You can filter your search by school, major, name, and a host of other categories",
      target: "navbar-searchbar",
      placement: "bottom",
      onShow: () => {
        $('#sidebar-database').removeClass('tour-highlight')
        $('#navbar-searchbar').addClass('tour-highlight')
      },
    },
    {
      title: "View and Edit Your Apiary Profile",
      content: "Click done to go to your profile page, where you can view and edit your apiary profile!",
      target: "navbar-myprofile",
      placement: "bottom",
      onShow: () => {
        $('#navbar-searchbar').removeClass('tour-highlight')
        $('#navbar-myprofile').addClass('tour-highlight')
        setTimeout(() => {window.location.href= "/users/myProfile"}, 3000)
      }
    },
  ]
};

// Start the tour!
hopscotch.startTour(tour);
