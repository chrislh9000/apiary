var tour = {
  id: "apiary-myprofile-tour",
  steps: [
    {
      title: "Welcome to your Apiary Profile",
      content: "Edit and customize your profile on this page for others to see!",
      target: "myprofile-header",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#myprofile-header').addClass('tour-highlight')
      }
    },
    {
      title: "Your Apiary Profile Picture",
      content: 'Add a profile picture for people to see so people can reach out to a friendly face! Simply click the "Update Profile Picture" button below to add your profile picture.',
      target: "myprofile-image",
      placement: "right",
      yOffset: 'center',
      onShow: () => {
        $('#myprofile-header').removeClass('tour-highlight')
        $('#myprofile-image').addClass('tour-highlight')
      },
    },
    {
      title: "Your Apiary Bio",
      content: 'Click here to take a look at your Apiary biography and interests. Other Apiary users will be able to see this and connect with you',
      target: "myprofile-bio",
      placement: "top",
      onShow: () => {
        $('#myprofile-image').removeClass('tour-highlight')
        $('#myprofile-bio').addClass('tour-highlight')
        $('#myprofile-bio').addClass('in')
      },
    },
    {
      title: "Edit your Apiary Profile",
      content: 'Click here to make changes to your apiary profile',
      target: "myprofile-edit",
      placement: "top",
      onShow: () => {
        $('#myprofile-bio').removeClass('tour-highlight')
        $('#myprofile-edit').addClass('tour-highlight')
      },
    },
    {
      title: "Interacting with Apiary Ambassadors",
      content: "Apiary\'s ambassadors are some of the most accomplished college students in the country. Let\'s find out how to connect with them! Click \"Done\" to go to the Apiary Ambassador Page",
      target: "sidebar-ambassadors",
      placement: "right",
      onShow: () => {
        $('#myprofile-edit').removeClass('tour-highlight')
        $('#sidebar-ambassadors').addClass('tour-highlight')
        $('.hopscotch-next').on('click', (event) => {
          event.preventDefault()
          window.location.href= "/ambassadors/all"
        })
      },
    },
  ]
};

// Start the tour!
hopscotch.startTour(tour);
