$(document).ready(function() {
    console.log("jquery works");

//
// TODO: all this should move into view/controller code as some point
//


    // Selecting a project to copy
    // $(document).on("click", "#copy-repertoire", function() {
    //     $(this).("#repertoire-container").toggleClass(".selected-repertoire");
    // });
    if ($('#check-copy-repertoire').is('checked')) {
        console.log("I'm checked!");
    } else {
        console.log("Nah, not checked");
    }

    // Community Projects Filter
    $(document).on("click", "#community-filter-button", function() {
        $("#community-filter").toggle();
    });

});
