$(document).ready(function() {

  var article_list = [];   // The article list array from the scrape
  var $ArticleList = $(".article-list");  // The article list for display 
  var $CommentList = $(".comment-list");  // Comment Modal
  var $CommentTitle = $(".modal-title");  // Comment Modal Header

  var DebugOn = false;   // debug flag

  //**********************************************************************************/
  // Scrape the articles from the website and display them on the page
  if (DebugOn) console.log ("In app.js. About to do initial scrapeArticles()");
  scrapeArticles();      

  //************************************ Functions ***********************************/

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

        if (DebugOn) console.log ("All articles to be deleted");
      
        $.ajax({
          method: "DELETE",
          url: "/deletesaved"
        })
        .then(function(data) {
          
          if (DebugOn) console.log(data);  // Log the response
          $ArticleList.empty();
          article_list = [];
        });
    

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
                  "<div class='col-7'>",
                    "<h5>", article.date, "</h5>",
                  "</div>",
                  "<div class='col-3'>",
                      "<button class='btn btn-success article-comments' id='article-comments' value='", article._id,"'>Article Comments</button>",
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
    
    $ArticleList.empty();
    
    // make sure there are articles in the array to display
    if (saved_list.length > 0) {
        
        var articlesToAdd = [];

        for (var i = 0; i < saved_list.length; i++) {
          if (DebugOn) console.log ("Display saved article ", saved_list[i]);
          articlesToAdd.push(createSavedArticleRow(saved_list[i], i));
        }

      // populate the articles on the html page
      $ArticleList.append(articlesToAdd);

    }  // if (article_list.length > 0)

  }  // DisplaySavedArticles()  

  //*********************************************************************************
  // * Function: $(document).on("click", ".article-comments", function())           *
  // * This event handler function shows the modal for displaying and entering an   *
  // * article's comments                                                           *
  // ********************************************************************************
  $(document).on("click", ".article-comments", function() {
  
    if (DebugOn) console.log ("Article Comments Button Clicked");
  
    // Get the index associated with the article from the article comments button
    var ArticleId = this.value;
    
    GetCommentList(ArticleId);
  });  // $(document).on("click", ".article.comments", function())

  //**********************************************************************************
  // * Function: function GetCommentList(ArticleId)                                  *
  // * This function gets the article's comments from the database and displays them *
  // * in the Article comments modal                                                 *
  // *********************************************************************************
function GetCommentList(ArticleId) {

    // Display the Comment modal and wait for submit or dismiss button
    $("#CommentModal").modal("show");             

    $CommentTitle.text("Comments for Article " + ArticleId);

    // Assign the ArticleId to the value from the submit button 
    $("#comment-submit").val(ArticleId);

    if (DebugOn) console.log ("Article Comments Id: " + ArticleId);
    
    $.ajax({
      method: "GET",
      url: "/getarticle/" + ArticleId
    })
    .then(function(data) {
    
      if (DebugOn) console.log("in show comments", data);  // Log the response
      if (DebugOn) console.log("num comments is: ", data.comment.length); 

      // if there are comments, then show the comments
      if (data.comment.length>0) {
        ListArticleComments(data.comment, ArticleId);
      }
      else {
        $CommentList.text("There are no comments for this article");
      }
      
    });
  }  // function GetCommentList(ArticleId)
  

  //**********************************************************************************
  // * Function: function ListArticleComment(comments, articleId)                    *
  // * This function lists the article's comments in the Comment Modal               *
  // *********************************************************************************
  function ListArticleComments(comments, articleId) {

    if (DebugOn) console.log ("In ListArticleComments for article: " + articleId, comments);
    
    $CommentList.empty();

    var commentsToAdd = [];

    for (var i=0; i<comments.length; i++) {
       if (DebugOn) console.log ("Comment: " + comments[i]);
       commentsToAdd.push(createCommentRow(comments[i], articleId));
    }

    // populate the articles on the Comment Modal
    $CommentList.append(commentsToAdd);

  }  // function ListArticleComments(comments, articleId)

  //**********************************************************************************
  // * Function: createCommentRow(comment)                                           *
  // * This function creates a comment row                                           *
  // *********************************************************************************
  function createCommentRow(comment, ArticleId) {
    
    var ArticleComment = ArticleId+"/"+comment._id;

    if (DebugOn) console.log ("in createCommentRow article/comment " + ArticleComment);
    
    var $newRow = $(
    [
        "<div class='row comment-box'>",
            "<div class='col-2'>",
                "<p>",comment.username,":</p>",
            "</div>",
            "<div class='col-9'>",
                "<p>",comment.text,"</p>",
            "</div>",
            "<div class='col-1'>",
                "<button class='btn btn-danger comment-delete' id='comment-delete' value='", ArticleComment, "'>X</button>",
            "</div>",
        "</div>"   
    ].join("")
    ); 
    
    return $newRow;
  }   // function createCommentRow(comment, id)

  //**********************************************************************************
  // * Function: $(document).on("click", ".comment-delete", function())              *
  // * This event handler function deletes the selected comment from the database    *
  // *********************************************************************************
  $(document).on("click", ".comment-delete", function() {
//  $("#comment-delete").on("click", function() {  
    if (DebugOn) console.log ("in comment-delete");
 
    // Get the index associated with the article from the save button
    var ArticleComment = this.value;
    
    if (DebugOn) console.log ("Article/Comment to be deleted: " + ArticleComment);
 
    $.ajax({
      method: "DELETE",
      url: "/deletecomment/" + ArticleComment
    })
    .then(function(data) {
      
      if (DebugOn) console.log(data);  // Log the response
      
      GetCommentList(data.articleid);
    });


  });  // $(document).on("click", ".comment-delete", function())


  //**********************************************************************************
  // * Function: $("#comment-submit").on("click", function())                        *
  // * This event handler function saves the input comment information for current   *
  // * article when the Comment Submit button is clicked.                            *
  // *********************************************************************************
  $("#comment-submit").on("click", function() {  
    if (DebugOn) console.log ("in comment-submit");

    // Turn off the Comment Modal
    $("#CommentModal").modal("hide");  
    
    // Only save the comment if there is text in the comment section 
    if ($("#UserComment").val()) {

      // Get the input comment information
      var  Comment = {
        username: $("#UserName").val(),
        text: $("#UserComment").val(),
      };

      // Get the index associated with the article from the comment submit button
      var ArticleId = this.value;

      if (DebugOn) console.log ("Input Comment: ", Comment);
      if (DebugOn) console.log ("for article id: " + ArticleId);
      
      $.ajax({
        method: "POST",
        url: "/savecomment/" + ArticleId,
        data: {
          username: Comment.username,
          text: Comment.text
        }
      })
      .then(function(data) {
        // Log the response
        console.log(data);
      });  

      // Clear the values entered in the input comment entry
      $("#UserName").val("");
      $("#UserComment").val("");
      
  } // if ($("#UserComment").val())

  });  // $("#comment-submit").on("click", function()


});  // $(document).ready(function())

