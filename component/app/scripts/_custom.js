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
});
