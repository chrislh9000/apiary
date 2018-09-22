var tour = {
  id: "apiary-myprofile-tour",
  steps: [
    {
      title: "Welcome to your Apiary Profile",
      content: "You will learn how to edit and customize your profile for others to see!",
      target: "myprofile-header",
      placement: "bottom",
      xOffset: 'center',
      onShow: () => {
        $('#myprofile-header').addClass('tour-highlight')
      },
    },
    {
      title: "Your Apiary Profile Picture",
      content: 'Add a profile picture so people can reach out to a friendly face! Simply click the "Update Profile Picture" button below to add your profile picture.',
      target: "myprofile-image",
      placement: "right",
      yOffset: 'center',
      showPrevButton: true,
      onShow: () => {
        $('#myprofile-header').removeClass('tour-highlight')
        $('#myprofile-image').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#myprofile-header').addClass('tour-highlight')
        $('#myprofile-image').removeClass('tour-highlight')
      },
    },
    {
      title: "Your Apiary Bigraphy and Interests",
      content: 'Click here to look at your Apiary biography and interests. This will give Apiary ambassadors more information about you before you start consultations, and give other Apiary users an idea of who they are reaching out to.',
      target: "myprofile-bio",
      placement: "top",
      showPrevButton: true,
      onShow: () => {
        $('#myprofile-image').removeClass('tour-highlight')
        $('#myprofile-bio').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#myprofile-image').addClass('tour-highlight')
        $('#myprofile-bio').removeClass('tour-highlight')
      },
    },
    {
      title: "Edit your Apiary Profile",
      content: 'Click here to make changes to your Apiary biography, interests, and other information',
      target: "myprofile-edit",
      placement: "top",
      showPrevButton: true,
      onShow: () => {
        $('#myprofile-bio').removeClass('tour-highlight')
        $('#myprofile-edit').addClass('tour-highlight')
      },
      onPrev: () => {
        $('#myprofile-bio').addClass('tour-highlight')
        $('#myprofile-edit').removeClass('tour-highlight')
      },
    },
    {
      title: "Let's Interact with some Apiary Ambassadors",
      content: "Apiary ambassadors are some of the most accomplished college students in the country. Let\'s find out how to connect with them! Click \"Done\" to go to the Apiary Ambassador Page.",
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
