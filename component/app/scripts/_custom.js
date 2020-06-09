$(document).ready(function() {
    console.log("jquery works");

// Summary Card Active States
    $(document).on("click", ".card-link", function() {
        $(".card-link").removeClass("card-active");
        $(this).addClass("card-active");
    });

// Click Edit Repertoire button
     $(document).on("click", ".edit-repertoire", function() {
        $(this).addClass("no-display");
    });

// Click Save Repertoire button
    $(document).on("click", ".save-repertoire", function() {
       $(this).addClass("no-display");
    });

// Steps for Create a Repertoire
    // Add Repertoire
    $(document).on("click", "#create-rep", function() {
        $(".step").removeClass("selected-step");
        $("#repertoire-step").addClass("selected-step");
    });

    // Add Subject
    $(document).on("click", "#add-subject", function() {
        $(".step").removeClass("selected-step");
        $("#subject-step").addClass("selected-step");
    });

    // Add Diagnosis
    $(document).on("click", "#add-diagnosis", function() {
        $(".step").removeClass("selected-step");
        $("#diagnosis-step").addClass("selected-step");
    });

    // Add Sample
    $(document).on("click", "#add-sample", function() {
        $(".step").removeClass("selected-step");
        $("#sample-step").addClass("selected-step");
    });

    // Add Cell Processing
    $(document).on("click", "#add-cell", function() {
        $(".step").removeClass("selected-step");
        $("#cell-step").addClass("selected-step");
    });

    // Add Nucleic Acid Processing
    $(document).on("click", "#add-nucleic", function() {
        $(".step").removeClass("selected-step");
        $("#nucleic-step").addClass("selected-step");
    });

    // Delete User from a Project
    $(document).on("click", "#delete-user", function() {
        $(".select").removeClass("no-display");
        $(".select").addClass("show");
    });

    // Adding a New User to a Project
    $(document).on("click", "#add-users", function() {
        console.log("clicked add users button");
    });
});
