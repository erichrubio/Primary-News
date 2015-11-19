Template.jobCollectionTemplate.events({
  "click": function (event, template) {
    Meteor.call("startJobServer", function(error, response) {
      console.log('response:', response);
    });
  }
});

Template.addButtonTemplate.events({
  "click": function (event, template) {
    Router.go("/add");
  }
});

Template.articlesButtonTemplate.events({
  "click": function (event, template) {
    Router.go("/");
  }
});

Template.rssUrlAddTemplate.events({
  'submit form': function(event) {
    event.preventDefault();

    // Get values from form
    var url = event.target.newRssUrl.value;
    var website = event.target.websiteName.value;
    console.log(url);
    console.log(website);

    // Add to database
    RssUrls.insert({
      insertedAt: new Date(),
      url: url,
      website: website
    });

    // Clear form
    event.target.newRssUrl.value = "";
    event.target.websiteName.value = "";
  }
});

Template.politicianAddTemplate.events({
  'submit form': function(event) {
    event.preventDefault();

    // Get values from form
    var first = event.target.politicianFirstName.value;
    var last = event.target.politicianLastName.value;
    var party = event.target.party.value;
    console.log(first + " " + last);

    // insert Politician into DB
    Politicians.insert({
      firstName: first,
      lastName: last,
      party: party
    });

    // Clear form
    event.target.politicianFirstName.value = "";
    event.target.politicianLastName.value = "";
  }
});
