$(document).ready(function() {

  var article_list = [];   // The article list array from the scrape
  var $ArticleList = $(".article-list");  // The article list for display 
  var DebugOn = true;   // debug flag
  var ItemsPerPage = 8;
  var ArticleIndex = 0;

  // Event listeners for button clicks
  // $(document).on("click", "button.add-comment", AddComment());
  // $(document).on("click", "button.delete-comment", DeleteComment());

  //******************************* Executed Code *************************************/
  // Scrape the articles from the website and display them on the page
  scrapeArticles();      

  //************************************ Functions ***********************************/

  function AddComment(event) {
//    event.preventDefault();

  }  // AddComment(event)

  function DeleteComment(event) {
//    event.preventDefault();

  }  // DeleteComment(event)

  //*********************************************************************************
  // * Function: $("#ScrapeBtn")                                                    *
  // * Event handler function for the Scrape Button - initiates a scrape of the     *
  // * website and then displays the array of articles returned                     *
  // ********************************************************************************
  $("#ScrapeBtn").click(function(){
    if (DebugOn) console.log ("Scrape Button Clicked");

    scrapeArticles();  // get the article_list and display them
    if (DebugOn) console.log ("Got article_list ", article_list);

  });  // $("#ScrapeBtn").click(function())

  //*********************************************************************************
  // * Function: $("#ClearScrapedBtn")                                              *
  // * Event handler function for the Clear Scraped Articles Button - clears the    *
  // * scraped articles from the page and clears the article-array                  *
  // ********************************************************************************
  $("#ClearScrapedBtn").click(function(){
    if (DebugOn) console.log ("Clear Scraped Button Clicked");
    // Clear the article display
    $ArticleList.empty();

    // Clear the article_list 
    article_list = [];

  });  // $("#ClearScrapedBtn").click(function())

  //*********************************************************************************
  // * Function: $("#ShowSavedBtn")                                                 *
  // * Event handler function for the Show Saved Button - lists the saved articles  *
  // * in the database.  The function is separated out so that the ShowSavedArticles*     *
  // * function can be called within the application without a button click         *                                                           *
  // ********************************************************************************
  $("#ShowSavedBtn").click(ShowSavedArticles);
  function ShowSavedArticles(){
    if (DebugOn) console.log ("Show Saved Button Clicked");

    $.ajax({
      method: "GET",
      url: "/savedarticles"
    })
    .then(function(data) {
      if (DebugOn) console.log("Got saved articles", data);

      DisplaySavedArticles(data);

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
  }  // $("#ShowSavedBtn").click(function())

  //*********************************************************************************
  // * Function: $("#ClearSavedBtn")                                                *
  // * Event handler function for the Clear Saved Button - deletes the saved        *
  // * articles from the database and clears them from the website display          *
  // ********************************************************************************
  $("#ClearSavedBtn").click(function(){
    if (DebugOn) console.log ("Clear Saved Button Clicked");

  });  // $("#ClearSavedBtn").click(function())


  //*********************************************************************************
  // * Function: $(document).on("click", ".article-delete", function())             *
  // * Event handler function for the Delete Article Button - deletes a single      *
  // * saved article from the database and clears them from the website display     *
  // ********************************************************************************
  $(document).on("click", ".article-delete", function() {
    
    if (DebugOn) console.log ("Delete Article Button Clicked");
    
    // Get the index associated with the article from the save button
    var ArticleId = this.value;
       
    if (DebugOn) console.log ("Article to be deleted: " + ArticleId);
  
    $.ajax({
      method: "DELETE",
      url: "/deletesaved/" + ArticleId
    })
    .then(function(data) {
      
      if (DebugOn) console.log(data);  // Log the response
      
      // Re-display the saved articles
      ShowSavedArticles();
    });
  });  //$(document).on("click", ".article-delete", function())

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#note-save", function() {

  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

  //*********************************************************************************
  // * Function: $(document).on("click", "#article-save", function())               *
  // * Event handler function for the Article Save Button - saves the article       * 
  // * associated with the clicked Save button in the database                      *
  // ********************************************************************************
  $(document).on("click", "#article-save", function() {

    // Get the index associated with the article from the save button
    var ArticleIndex = parseInt(this.value);   
    
    if (DebugOn) console.log ("Saving article number " + ArticleIndex);

    // Run a POST request to save the article
    $.ajax({
      method: "POST",
      url: "/savearticle",
      data: {
        title: article_list[ArticleIndex].title,
        link: article_list[ArticleIndex].link,
        summary: article_list[ArticleIndex].summary,
        date: article_list[ArticleIndex].date,
        image: article_list[ArticleIndex].image,
      }
    })
    .then(function(data) {
        console.log("response from /savearticle: ", data);
        
        // Set the saved flag to true and re-display the article list.
        article_list[ArticleIndex].saved = true;
        DisplayScrapedArticles();
    });  // ajax call

  });  //  $(document).on("click", "#article-save", function())


    //*********************************************************************************
    // * Function: scrapeArticles()                                                   *
    // * This function gets the articles from the website and displays them           *
    // ********************************************************************************
    function scrapeArticles() {
      $.get("/newscrape", function(data) {
        article_list = data;
        ArticleIndex = 0;  // reset the index into the article array

        if (DebugOn) console.log ("in scrapeArticles- .get data", data);
        DisplayScrapedArticles();   
      });
    }  //function scrapeArticles()

    //**********************************************************************************
    // * Function: createArticleRow(article)                                           *
    // * This function creates an article row for display on the article list          *
    // *********************************************************************************
    function createArticleRow(article, index) {
      
      var $newRow = $(
      [
          "<div class='row article-box'>",
              "<div class='col-3'>",
                 "<img src='", article.image, "' alt='test image' class='img-thumbnail' width='300' height='200'>",
              "</div>",
              "<div class='col-9'>",
                "<div class='row'>",
                    "<div class='col-10'>",
                      "<h5>", article.date, "</h5>",
                    "</div>",
                    "<div class='col-2'>",
                        "<button class='btn btn-success article-save' id='article-save' value='", index,"'>Save Article</button>",
                    "</div>",
                "</div>",
                "<div class='row'>",
                  "<h4><a href='", article.link, "' target='_blank'>", article.title,"</a></h4>",
                "</div>",
                "<div class='row'>",
                    "<p>", article.summary, "</p>",
                "</div>",
              "</div>",
          "</div>"   
      ].join("")
      ); 
      
      return $newRow;
    }   // function createArticleRow(article)


    // ********************************************************************************
    // * Function: DisplayScrapedArticles()                                           *
    // * This function displays the scraped articles on the page                      *
    // ********************************************************************************
    function DisplayScrapedArticles() {

      if (DebugOn) console.log ("In DisplayScrapedArticles array_length: " + article_list.length);
      
      // make sure there are articles in the array to display
      if (article_list.length > 0) {
          
          $ArticleList.empty();
          var articlesToAdd = [];

          for (var i = 0; i < article_list.length; i++) {
            // Display it only if the article has NOT been saved
            if (article_list[i].saved != true) {
              articlesToAdd.push(createArticleRow(article_list[i], i));
            }
          }

        // populate the articles on the html page
        $ArticleList.append(articlesToAdd);

      }  // if (article_list.length > 0)
  
  }  // DisplayScrapedArticles()  

  //**********************************************************************************
  // * Function: createSavedArticleRow(article)                                      *
  // * This function creates a save article row for display on the article list      *
  // *********************************************************************************
  function createSavedArticleRow(article, index) {
    
    var $newRow = $(
    [
        "<div class='row article-box'>",
            "<div class='col-3'>",
                "<img src='", article.image, "' alt='test image' class='img-thumbnail' width='300' height='200'>",
            "</div>",
            "<div class='col-9'>",
              "<div class='row'>",
                  "<div class='col-8'>",
                    "<h5>", article.date, "</h5>",
                  "</div>",
                  "<div class='col-2'>",
                      "<button class='btn btn-primary article-notes' id='article-notes' value='", article._id,"'>Article Notes</button>",
                  "</div>",
                  "<div class='col-2'>",
                      "<button class='btn btn-danger article-delete' id='article-delete' value='", article._id,"'>Delete Article</button>",
                  "</div>",
              "</div>",
              "<div class='row'>",
                "<h4><a href='", article.link, "' target='_blank'>", article.title,"</a></h4>",
              "</div>",
              "<div class='row'>",
                  "<p>", article.summary, "</p>",
              "</div>",
            "</div>",
        "</div>"   
    ].join("")
    ); 
    
    return $newRow;
  }   // function createSavedArticleRow(article)

  // ********************************************************************************
  // * Function: DisplaySavedArticles()                                             *
  // * This function displays the saved articles on the page                        *
  // ********************************************************************************
  function DisplaySavedArticles(saved_list) {

    if (DebugOn) console.log ("In DisplaySavedArticles array_length: " + saved_list.length);
    
    // make sure there are articles in the array to display
    if (saved_list.length > 0) {
        
        $ArticleList.empty();
        var articlesToAdd = [];

        for (var i = 0; i < saved_list.length; i++) {
          if (DebugOn) console.log ("Display saved article ", saved_list[i]);
          articlesToAdd.push(createSavedArticleRow(saved_list[i], i));
        }

      // populate the articles on the html page
      $ArticleList.append(articlesToAdd);

    }  // if (article_list.length > 0)

  }  // DisplaySavedArticles()  



});  // $(document).ready(function())
