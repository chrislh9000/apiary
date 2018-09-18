var tour = {
  id: "apiary-ambassador-network-tour",
  steps: [
    {
      title: "Welcome to the Apiary Ambassadors Page",
      content: "From here you'll have dozens of stellar college students at your disposal!",
      target: "network-ambassador-header",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#network-ambassador-header').addClass('tour-highlight')
      }
    },
    {
      title: "Find Apiary Ambassadors Currently at your Dream School",
      content: 'Click on any of the schools below to find ambassadors who can help you on your application, beef up your resume and credentials, or give you juicy, insider information on your favorite schools.',
      target: "ambassador-page-sidescroll",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#network-ambassador-header').removeClass('tour-highlight')
        $('#ambassador-page-sidescroll').addClass('tour-highlight')
      },
    },
    {
      title: "Let's go to an Apiary Ambassador Page",
      content: 'Click this button or "Done" to go to an ambassador page and begin a conversation with an Apiary Ambassador!',
      target: "view-ambassador-profile-btn",
      placement: "bottom",
      onShow: () => {
        $('#ambassador-page-sidescroll').removeClass('tour-highlight')
        $('#view-ambassador-profile-btn').addClass('tour-highlight')
        $('.hopscotch-next').on('click', (event) => {
          event.preventDefault()
          window.location.href= "/ambassadors/5b9c82608f68f337ad0c8e0c"
        })
      },
    },
  ]
};

// Start the tour!
hopscotch.startTour(tour);
