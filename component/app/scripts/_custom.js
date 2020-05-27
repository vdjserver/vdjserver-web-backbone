$(document).ready(function() {
    console.log("jquery works");

// Summary Card Active States
      $(document).on('click', '.card-link', function() {
          console.log("card clicked");
          $('.card-link').removeClass("card-active");
          $(this).addClass("card-active");
      });
// Click Edit Repertoire button
     $(document).on('click', '#edit-repertoire', function() {
        console.log("clicked from jquery");
        $(this).addClass("hide");
    });
});
