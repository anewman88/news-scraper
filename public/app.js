$(document).ready(function() {

  var article_list = [];   // The article list array from the scrape
  var $ArticleList = $(".article-list");  // The article list for display 
  var DebugOn = true;   // debug flag
  var ItemsPerPage = 8;
  var ArticleIndex = 0;

  // Event listeners for button clicks
  // $(document).on("click", "button.save-article", SaveArticle());
  // $(document).on("click", "button.add-comment", AddComment());
  // $(document).on("click", "button.delete-comment", DeleteComment());
  
  function SaveArticle(event) {
//    event.preventDefault();

  }  // SaveArticle(event)

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

    getArticles();                         // get the article_list and display them
    if (DebugOn) console.log ("Got article_list ", article_list);
  
    DisplayArticles();
  });  // $("#ScrapeBtn").click(function())

  //*********************************************************************************
  // * Function: $("#ClearScrapedBtn")                                              *
  // * Event handler function for the Clear Scraped Articles Button - clears the    *
  // * scraped articles from the page and clears the article-array                  *
  // ********************************************************************************
  $("#ClearScrapedBtn").click(function(){
    if (DebugOn) console.log ("Clear Scraped Button Clicked");

  });  // $("#ClearScrapedBtn").click(function())

  //*********************************************************************************
  // * Function: $("#ShowSavedBtn")                                                 *
  // * Event handler function for the Show Saved Button - lists the saved articles  *
  // * in the database                                                              *
  // ********************************************************************************
  $("#ShowSavedBtn").click(function(){
    if (DebugOn) console.log ("Show Saved Button Clicked");

  });  // $("#ShowSavedBtn").click(function())

  //*********************************************************************************
  // * Function: $("#ClearSavedBtn")                                                *
  // * Event handler function for the Clear Saved Button - deletes the saved        *
  // * articles from the database and clears them from the website display          *
  // ********************************************************************************
  $("#ClearSavedBtn").click(function(){
    if (DebugOn) console.log ("Clear Saved Button Clicked");

  });  // $("#ClearSavedBtn").click(function())


  //************************************************************************************/
  // Get the articles from  the website and diplay them on the page
  getArticles();                         // get the article_list and display them
  if (DebugOn) console.log ("Got article_list ", article_list);

// Grab the saved articles as a json
$.getJSON("/articles", function(data) {


  DisplayArticles();

  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});


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
$(document).on("click", "#savenote", function() {
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
    // * Function: getArticles()                                                      *
    // * This function gets the articles from the website and displays them           *
    // ********************************************************************************
    function getArticles() {
      $.get("/newscrape", function(data) {
        article_list = data;
        ArticleIndex = 0;  // reset the index into the article array

        if (DebugOn) console.log ("in getArticles- .get data", data);
        DisplayArticles();   
      });
    }  //function getArticles()

    //**********************************************************************************
    // * Function: createArticleRow(article)                                           *
    // * This function creates an article row for display on the article list          *
    // *********************************************************************************
    function createArticleRow(article) {

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
                        "<button class='btn btn-success article-item' id='btn_0' value='0'>Save Article</button>",
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
    // * Function: DisplayArticles()                                                  *
    // * This function displays the scraped article on the page                              *
    // ********************************************************************************
    function DisplayArticles() {

      // make sure there are articles in the array to display
      if (article_list.length > 0) {
          
          // Paging Determine which articles in the article_list to display 
          // var firstIndex = ArticleIndex;
          // var lastIndex = ArticleIndex + ItemsPerPage;

          // if (lastIndex >= article_list.length)
          //    lastIndex = article_list.length;
  
          $ArticleList.empty();
          var articlesToAdd = [];

          for (var i = 0; i < article_list.length; i++) {
            articlesToAdd.push(createArticleRow(article_list[i]));
          }

        // populate the articles on the html page
        $ArticleList.append(articlesToAdd);

      }  // if (article_list.length > 0)
  
  }  // DisplayArticles()  



});
