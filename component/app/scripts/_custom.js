$(document).ready(function() {
    console.log("jquery works");

//
// TODO: all this should move into view/controller code as some point
//

    // Selecting a project to copy
    if ($('#check-copy-repertoire').is('checked')) {
        console.log("I'm checked!");
    } else {
        console.log("Nah, not checked");
    }

    $(window).scroll(function() {
        if ($(this).scrollTop() > 100){
            $('#community-query-stats').addClass("query-stats-border");
        }
        else{
            $('#community-query-stats').removeClass("query-stats-border");
        }
    });
});
