$(document).ready(function() {
    console.log("jquery works");

// Summary Card Active States
      $(".card-link").click(function(){
          console.log("card clicked");
          $(this).addClass("card-active");
      });
// Click Edit Repertoire button
    $("#edit-repertoire").click(function() {
        console.log("clicked from jquery");
        $(this).addClass("hide");
    });
});
