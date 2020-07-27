$(document).ready(function() {
    console.log("jquery works");

//
// TODO: all this should move into view/controller code as some point
//

// Click Edit Repertoire button
//      $(document).on("click", ".edit-repertoire", function() {
//         $(this).addClass("no-display");
//     });
//
// // Click Save Repertoire button
//     $(document).on("click", ".save-repertoire", function() {
//        $(this).addClass("no-display");
//     });

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

    $(document).on("click", "tr.user-row", function(e) {
        // when you click on an individual row, show the user action buttons
        e.preventDefault();

        $(this).find(".delete-project-user").toggleClass("no-display");
        $(this).find(".delete-project-user").toggleClass("show");

        $(this).find(".edit-project-user").toggleClass("no-display");
        $(this).find(".edit-project-user").toggleClass("show");
    });

    // Adding a New User to a Project
    $(document).on("click", "#add-project-user", function() {
        $(".manage-users").find('tbody').append("<tr class='user-row'><td class='user-name-email'><input type='text' class='form-control col-md-6' id='user-name' placeholder='Username'><input type='email' class='form-control col-md-9' id='user-email' placeholder='Email'></td><td class='user-status'><select class='form-control' id='user-status'><option>Active</option><option>Inactive</option></td><td class='user-actions'><button type='button' class='btn btn-create' id='add-project-user'><i class='fa fa-plus' aria-hidden='true'></i> Add</button> <button type='button' class='btn btn-cancel' id='cancel-project-user'><i class='fa fa-plus' aria-hidden='true'></i> Cancel</button></td></tr>");
    });
});
