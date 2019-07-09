// *********************************************************************************
// This file defines a set of routes for CRUD to the product table
// *********************************************************************************
var DebugOn = false;

// Dependencies
// =============================================================

// Require the sequelize models
var db = require("../models");

// Routes
// =============================================================
module.exports = function(app) {

    app.get("/scrape", function(req, res) {
        // First, we grab the body of the html with axios
      //  axios.get("https://mars.nasa.gov/news/?page=0&per_page=40&order=publish_date+desc%2Ccreated_at+desc&search=&category=19%2C165%2C184%2C204&blank_scope=Latest").then(function(response) {
        axios.get("https://www.jpl.nasa.gov/news/").then(function(response) {
      
          if (DebugOn) {
            console.log ("Scraped Data ", response.data);
            console.log ("**************************************************************");
          } 
      
          // Then, we load that into cheerio and save it to $ for a shorthand selector
          var $ = cheerio.load(response.data);
          
          // $(".slide").each(function(i, item){
          //   var temp = $(".article_teaser_body", item).text();
          //   var n = temp.search("2019");
          //   var date = temp.substr(0, n+4);
          //   var summary = temp.substring(n+4);
          //   console.log("link: " + $(this).children("a").attr("href"));
          //   console.log("date: " + date);
          //   console.log("title: *" + $(".content_title", item).text().trim() + "*");
          //   console.log("summary: " + summary);
          //   console.log("img: "+  $(".img img", item).attr("src"));
          // });
      
          // Get every li class="slide" and do the following:
          $(".slide").each(function(i, item) {
      
            // the date and the summary are combined.  Need to split out 
            var temp = $(".article_teaser_body", item).text();
            var n = temp.search("2019");
      
            if (n > 0) {
              // Save an empty result object
              var result = {};
      
              var date = temp.substr(0, n+4);
              var summary = temp.substring(n+4);
        
              result.date = date;
              result.link = $(this).children("a").attr("href");
              result.title = $(".content_title", item).text().trim();
              result.summary = summary;
              result.image = $(".img img", item).attr("src");
      
              if (DebugOn) {
                console.log ("For each result ", result);
                console.log ("***************************************")
              }
      
              // add this to the database 
      
            }  // if (n>0)
      
      
      
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
              .then(function(dbArticle) {
                // View the added result in the console
                console.log("Response from DB", dbArticle);
              })
              .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
              });
      
          });  
      
      
          // Send a message to the client
          res.send("Scrape Complete");
        });
      });
      
      // Route for getting all Articles from the db
      app.get("/articles", function(req, res) {
        // Grab every document in the Articles collection
        db.Article.find({})
          .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
          });
      });
      
      // Route for grabbing a specific Article by id, populate it with it's comment
      app.get("/articles/:id", function(req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
          // ..and populate all of the comments associated with it
          .populate("comment")
          .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
          });
      });
      
      // Route for saving/updating an Article's associated Comment
      app.post("/articles/:id", function(req, res) {
        // Create a new comment and pass the req.body to the entry
        db.Comment.create(req.body)
          .then(function(dbComment) {
            // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbComment._id }, { new: true });
          })
          .then(function(dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
          });
      });

};  // module.exports = function(app) {
