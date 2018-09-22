var tour = {
  id: "apiary-ambassador-network-tour",
  steps: [
    {
      title: "Welcome to the Apiary Ambassadors Page",
      content: "From here you'll have dozens of stellar college students at your disposal!",
      target: "apiary-network-navbar",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#apiary-network-navbar').addClass('tour-highlight')
      }
    },
    {
      title: "Find Apiary Ambassadors Currently attending your Dream School",
      content: 'Click on any of the schools below to find school-specific ambassadors who can advise you on your application, beef up your resume, or give you the juicy inside scoop on your favorite schools.',
      target: "ambassador-page-sidescroll",
      placement: "bottom",
      xOffset: 'center',
      showPrevButton: true,
      onShow: () => {
        $('#network-ambassador-header').removeClass('tour-highlight')
        $('#ambassador-page-sidescroll').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#network-ambassador-header').addClass('tour-highlight')
        $('#ambassador-page-sidescroll').removeClass('tour-highlight')
      },
    },
    {
      title: "Let's go to an Apiary Ambassador Page",
      content: 'Click "View Profile" or "Done" to go to an ambassador page and learn how to reach out to an Apiary ambassador!',
      target: "view-ambassador-profile-btn",
      placement: "bottom",
      showPrevButton: true,
      onShow: () => {
        $('#ambassador-page-sidescroll').removeClass('tour-highlight')
        $('#view-ambassador-profile-btn').addClass('tour-highlight')
        $('.hopscotch-next').on('click', (event) => {
          event.preventDefault()
          window.location.href= "/ambassadors/5b9c82608f68f337ad0c8e0c"
        })
      },
      onPrev: () => {
        $('#ambassador-page-sidescroll').addClass('tour-highlight')
        $('#view-ambassador-profile-btn').removeClass('tour-highlight')
      },
    },
  ]
};

// Start the tour!
hopscotch.startTour(tour);
