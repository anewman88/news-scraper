// Route for saving an Article's associated Note
app.post("/notes/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  console.log("/notes/:id to POST a note to an article");
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      // return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        $push: {
          notes: dbNote._id
        }
      }, {
        new: true
      });

    })
    .then(function (data) {
      var results = {
        note: data

      }
      // If we were able to successfully update an Article, send it back to the client
      res.render('article', results);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a One Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    console.log("APP.GET /articles/:id populated");
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({
        _id: req.params.id
      })
  
      // ..and populate all of the notes associated with it
      .populate("notes")
      .then(function (data) {
  
        // If we were able to successfully find an Article with the given id, send it back to the client
        console.log(data);
        var results = {
          article: data,
          note: data.notes
        }
        res.render('article', results);
        // console.log(data);
        // res.json(data);
  
        // res.json(dbArticle);
  
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  

  //route for del of note
app.delete("/notes/:noteid/:articleid", function (req, res) {
    console.log("first removing the note from article");
  
    db.Article.update({
        "_id": req.params.articleid
      }, {
        // Set "read" to false for the book we specified
        "$pull": {
          "notes": req.params.noteid
        }
      },
      function (error, deleted) {
        // Show any errors
        if (error) {
          console.log(error);
          res.send(error);
        } else {
          console.log("note removed from article");
          db.Note.findByIdAndRemove(req.params.noteid, function (err, removed) {
            if (err)
              res.send(err);
            else
              res.json({
                removed: 'note Deleted!'
              });
  
          }); //end findByIdAndRemove
        } //end else
      }); //end DBarticle update
  
  }); //endapp.delete
  