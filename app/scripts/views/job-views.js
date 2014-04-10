define(['app'], function(App) {

    'use strict';

    var Jobs = {};

    Jobs.Submit = Backbone.View.extend({
        template: 'jobs/job-submit-form',
        initialize: function() {
        
        },
        serialize: function() {
            return {
                selectedFileListings: this.selectedFileListings.toJSON()
            };
        },
        afterRender: function() {
            $('#job-modal').modal('show');
        },
        events: {
            'click #submit-job': 'submitJob',
            'click .remove-file-from-job': 'removeFileFromJob'
        },
        submitJob: function() {
            console.log("job submitted");
        },
        removeFileFromJob: function(e) {
            e.preventDefault();

            var uuid = e.target.id;

            console.log("uuid is: " + uuid);

            // UI
            $('#' + uuid).parent().remove();

            // data collection
            this.selectedFileListings.remove(uuid);

            console.log("done");
        }
    });

    App.Views.Jobs = Jobs;
    return Jobs;
});
