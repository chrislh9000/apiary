// var hopscotch = require('hopscotch')
console.log('HEY GUYS')

var tour = {
  id: "hello-hopscotch",
  steps: [
    {
      title: "My Header",
      content: "This is the header of my page.",
      target: "hello",
      placement: "bottom"
    },
    {
      title: "My content",
      content: "Here is where I put my content.",
      target: 'hei',
      placement: "bottom"
    }
  ]
};

// Start the tour!
hopscotch.startTour(tour);
