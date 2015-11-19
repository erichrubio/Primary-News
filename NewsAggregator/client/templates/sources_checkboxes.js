Template.sourceCheckboxListTemplate.helpers({
  sources: function() {
    // Only gets articles from CNN and Reuters
    // var sources = [ "CNN", "Reuters" ];
    // return Articles.find({website: {$in:sources}}, {sort: {published: -1}, limit: 500});

    // Returns all articles
    return RssUrls.find({}, {limit: 50});
  }
});
