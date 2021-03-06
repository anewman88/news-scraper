// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies and initializations
// =============================================================
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var path = require("path");

// Require the database models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/NasaNews";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes
// =============================================================

var DebugOn = true;

/*******************************************************************************************************/
// HTML GET Requests
// Below code handles when users "visit" a page.
// ---------------------------------------------------------------------------
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

/*******************************************************************************************************/
// API routes
// ---------------------------------------------------------------------------
//*********************************************************************************
// * Function: app.get("/newscrape", function(req, res))                          *
// * Route for "scraping" the JPL website and returning an array of articles to   *
// * the client                                                                   *
// ********************************************************************************
app.get("/newscrape", function(req, res) {

  var article_array = [];

  // Get the body of the website html with axios
  axios.get("https://www.jpl.nasa.gov/news/")
  .then(function(response) {

    // Load the response.data into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
    // Get every li class="slide" and do the following:
    $(".slide").each(function(i, item) {

      // the date and the summary are combined.  Need to split out 
      var temp = $(".article_teaser_body", item).text();
      var n = temp.search("2019");

      if (n > 0) {
        
        var article = {};     // Create an empty article object

        // Populate the article object with the data
        var date = temp.substr(0, n+4);
        var summary = temp.substring(n+4);
        article.index = i;
        article.date = date;
        article.link = $(this).children("a").attr("href");
        article.title = $(".content_title", item).text().trim();
        article.summary = summary;
        article.image = $(".img img", item).attr("src");
        article.saved = false;

        if (DebugOn) {
          console.log ("For each article ", article);
          console.log ("***************************************")
        }

        // push the article object into the article_array 
        article_array.push(article);

      }  // if (n>0)

    });  // $(".slide").each(function(i, item)

    // return the article array to the client
    res.json(article_array);

    // Send a message to the client that the scrape is complete
    res.send("Scrape Complete");

  });   // axios.get("https://www.jpl.nasa.gov/news/")
  
});  // app.get("/newscrape", function(req, res)

//*********************************************************************************
// * Function: app.post("/savearticle", function(req, res))                       *
// * Route for saving an article to the database                                  *
// ********************************************************************************
app.post("/savearticle", function(req, res) {

    /* Get the array of articles to be saved */
    var Article = req.body;

    // Create a new Article using the `result` object built from scraping
    db.Article.create(Article)
    .then(function(dbArticle) {
      // View the added result in the console
      console.log("Response from DB", dbArticle);
      // If the article was saved successfully return the response back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, log it
      console.log(err);
    });
});  // app.post("/savearticle", function(req, res))
    
//*********************************************************************************
// * Function: app.get("/savedarticles", function(req, res))                      *
// * Route for getting all the articles saved in the database                     *
// ********************************************************************************
app.get("/savedarticles", function(req, res) {
  // Get every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});  // app.get("/savedarticles", function(req, res))

//*********************************************************************************
// * Function: app.get("/getarticle/:id", function(req, res))                     *
// * Route for grabbing a specific Article by id, populate it with it's comment   *
// ********************************************************************************
app.get("/getarticle/:id", function(req, res) {
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
});  //app.get("/getarticle/:id", function(req, res))

//*********************************************************************************
// * Function: app.delete("/deletesaved/:id", function(req, res))                 *
// * Route for deleting an article from the db                                    *
// ********************************************************************************
app.delete("/deletesaved/:id", function(req, res) {
  db.Article.deleteOne({ _id: req.params.id })
  .then(function(removed) {
    res.json(removed);
  }).catch(function(err,removed) {
      // If an error occurred, send it to the client
        res.json(err);
    });
});  // app.delete("/deletesaved/:id", function(req, res)) 

//*********************************************************************************
// * Function: app.delete("/deletesaved", function(req, res))                 *
// * Route for deleting all the saved articles from the db                                    *
// ********************************************************************************
app.delete("/deletesaved", function(req, res) {
  db.Article.deleteMany()
  .then(function(removed) {
    res.json(removed);
  }).catch(function(err,removed) {
      // If an error occurred, send it to the client
        res.json(err);
  });
});  // app.delete("/deletesaved", function(req, res)) 


//*********************************************************************************
// * Function: app.post("/savecomment/:id", function(req, res))                   *
// * Route for saving an Article's associated Comment                             *
// ********************************************************************************
app.post("/savecomment/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        {_id: req.params.id }, 
        { $push: {comment: dbComment._id }}, 
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

});  //app.post("/savecomment/:id", function(req, res))

//*********************************************************************************
// * Function: app.delete("/notes/:noteid/:articleid", function (req, res))       *
// * Route for deleting an Article's associated Comment                           *
// ********************************************************************************
app.delete("/deletecomment/:articleid/:commentid", function (req, res) {
  
  // First "pull" the comment from the article
  db.Article.update({
      "_id": req.params.articleid
    }, {
      "$pull": {
        "comment": req.params.commentid
      }
    },
    function (error, deleted) {
      // Show any errors
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // Now delete the comment from the database
        if (DebugOn) console.log("comment removed from article");
        db.Comment.findByIdAndRemove(req.params.commentid, function (err, removed) {
          if (err)
            res.send(err);
          else
            res.json({
              removed: 'comment Deleted!',
              articleid: req.params.articleid
            });

        });
      }  // else
    }); //function (error, deleted)

}); //  app.delete("/deletecomment/:commentid/:articleid", function (req, res))

/*******************************************************************************************************/

// Start the server
app.listen(PORT, function() {
  console.log ("*****************************************************************");
  console.log("\n\n\n\n\n\nApp running on port " + PORT + "!");
});
