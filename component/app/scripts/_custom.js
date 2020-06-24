$(document).ready(function() {
    console.log("jquery works");

//
// TODO: all this should move into view/controller code as some point
//

// Click Edit Repertoire button
     $(document).on("click", ".edit-repertoire", function() {
        $(this).addClass("no-display");
    });

// Click Save Repertoire button
    $(document).on("click", ".save-repertoire", function() {
       $(this).addClass("no-display");
    });

    // Delete User from a Project

            // When checkbox is clicked, show delete and edit buttons

    // function manageusers() {
    //     if ($('input#user-select').is('checked')) {
    //         $("#delete-user").removeClass("no-display");
    //         $("#delete-user").addClass("show");
    //         $("#edit-user").removeClass("no-display");
    //         $("#edit-user").addClass("show");
    //     } else {
    //         console.log("nah, not checked");
    //     }
    // }
    //
    //     $("input#user-select").click(manageusers);

    $(document).on("click", ".user-name", function() {
        $(".select").toggleClass("no-display");
        $(".select").toggleClass("show");
    });

    $(document).on("click", ".user-status", function() {
        $(".select").toggleClass("no-display");
        $(".select").toggleClass("show");
    });

    $(document).on("click", "input#user-select", function() {
        $("#delete-user").toggleClass("no-display");
        $("#delete-user").toggleClass("show");
        $("#edit-user").toggleClass("no-display");
        $("#edit-user").toggleClass("show");
    });

    $(document).on("click", "#delete-user", function() {
        console.log("clicked delete users button");
    });

    // Adding a New User to a Project
    $(document).on("click", "#add-users", function() {
        console.log("clicked add users button");
    });

    $(document).on("click", "#add-users", function() {
        $(".manage-users").find('tbody').append("<tr class='user-row form-row'><td class='user-name col-md-3'><input type='text' class='form-control' id='user-name' placeholder='Name'></td><td class='user-email col-md-3'><input type='email' class='form-control' id='user-email' placeholder='Email'></td><td class='user-status col-md-2'><select class='form-control' id='user-status'><option>Active</option><option>Inactive</option></td><td class='user-actions col-md-3'><button type='button' class='btn btn-create' id='add-new-user'><i class='fa fa-plus' aria-hidden='true'></i> Add</button></td></tr>");
    });
});
