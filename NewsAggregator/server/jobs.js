var myJobs = JobCollection('myJobQueue');
var feeds = RssUrls.find().fetch();
var db_politicians = Politicians.find().fetch();

Meteor.methods({
  startJobServer: function () {
    // Start the myJobs queue running
    console.log("Started job server.");
    return myJobs.startJobServer();
  }
});

Meteor.startup(function () {
  // Because this code is on the server, all of it runs unconditionally.
  for(var i = 0; i < feeds.length; i++){
  // Create a job:
    var job = new Job(myJobs, 'rssRequest', // type of job
      // Job data, including anything the job
      // needs to complete.
      {
        website: feeds[i].website,
        url: feeds[i].url
      }
    );

    // Set some properties of the job and then submit it
    job.priority('normal')
      .retry({ retries: 5,
        wait: 10*1000 })  // 10 seconds between attempts
      .delay(5*1000)
      // Allows jobs to run on specified schedule
      /*.repeat({
        schedule: myJobs.later.parse.text('every 30 minutes')
      })*/
      .save();               // Commit it to the server
  }
});

var workers = myJobs.processJobs('rssRequest',
  function (job, cb) {
    console.log("Processing job");
    var jobData = job.data;
    // Get articles from RSS feed request
    var articles = requestRssFromUrl(jobData.website, jobData.url);
    //if(articles !== null){
      //console.log(articles);
    //}
    console.log("Job finished");
    job.done();
    cb();
  }
);

// Request and process RSS feeds
function requestRssFromUrl(website, url){
  console.log("rss request time");
  var cheerio = Meteor.npmRequire('cheerio');
  var articles = [];
  try {
    var result = HTTP.call("GET", url);
    ch = cheerio.load(result.content, {
      xmlMode: true
    });
    ch.xml();
    ch(result.content).find("item").each(function(index, elem) {
      var el = ch(this);

      var title = el.find("title").text();

      function unescapeHTML(str) { //modified from underscore.string and string.js
        var escapeChars = { lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' };
          return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
              var match;
              if ( entityCode in escapeChars) {
                  return escapeChars[entityCode];
              } else if ( match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
                  return String.fromCharCode(parseInt(match[1], 16));
              } else if ( match = entityCode.match(/^#(\d+)$/)) {
                  return String.fromCharCode(~~match[1]);
              } else {
                  return entity;
              }
          });
      }

      title = unescapeHTML(title);

      var url = el.find("guid").text();
      if(url === null || url === ""){
        url = el.find("link").text();
      }

      var description = el.find("description").text();

      var indexOfBreak = description.indexOf("<");
      if(indexOfBreak != -1){
        description = description.substring(0, indexOfBreak);
      }

      var indexOfAmp = description.indexOf("&");
      if(indexOfAmp != -1){
        description = description.substring(0, indexOfAmp);
      }

      var pubDate = new Date(el.find("pubDate").text());

      var article = {
        title: title,
        url: url,
        description: description,
        published: pubDate,
        website: website
      };

      var politicians = getPoliticians(article);
      if(politicians !== null){
        var parties = getParties(politicians);
        // Add politicians and parties
        article.politicians = politicians;
        article.hasRepublicans = parties.republican;
        article.hasDemocrats = parties.democrat;

        articles.push(article);
        try{
          Articles.insert(article);
        }
        catch(e) {
          console.log("Error inserting into Articles DB. Possible duplicate");
          console.log(article);
        }
      }
      else {
        try{
          NotIncludedArticles.insert(article);
        }
        catch(e){
          console.log("Error inserting into NotIncludedArticles DB. Possible duplicate");
        }
      }
    });
    console.log("Passed so far");
  }
  catch (e) {
    // Got a network error, time-out or HTTP error in the 400 or 500 range.
    console.log("error in my method");
    return null;
  }
  return articles;
}

// Returns matching politicans from passed article
function getPoliticians(article){
  var people = Meteor.call("findPeople", article.title + ". " + article.description);
  if(people === null || people.length === 0){
    return null;
  }
  else {
    var matchingPoliticians = [];
    for(var i = 0; i < people.length; i++){
      var name = people[i].text;
      for(var k = 0; k < db_politicians.length; k++){
        var politician = db_politicians[k];
        if(name.indexOf(politician.firstName) !== -1 || name.indexOf(politician.lastName) !== -1){
          matchingPoliticians.push(politician);
        }
      }
    }
  }
  return matchingPoliticians;
}

// Returns parties from policians passed in
function getParties(politicians){
  var parties = {
    democrat: false,
    republican: false
  }
  for(var i = 0; i < politicians.length; i++){
    if(politicians[i].party == "democrat"){
      parties.democrat = true;
    }
    else {
      parties.republican = true;
    }
  }
  return parties;
}
