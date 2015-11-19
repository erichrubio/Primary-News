Template.articleList.helpers({
  articles: function() {
    // Only gets articles from CNN and Reuters
    // var sources = [ "CNN", "Reuters" ];
    // return Articles.find({website: {$in:sources}}, {sort: {published: -1}, limit: 500});

    // Returns all articles
    return Articles.find({}, {sort: {published: -1}, limit: 500});
  }
});
