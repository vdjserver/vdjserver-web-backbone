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

            var that = this;
            $('#job-modal').modal('hide')
                .on('hidden.bs.modal', function() {
                    var jobNotificationView = new Jobs.Notification();
                    App.Layouts.footer.insertView('#running-jobs', jobNotificationView);
                    jobNotificationView.render();
                });
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

    Jobs.Notification = Backbone.View.extend({
        template: 'jobs/notification',
        initialize: function() {
        
        },
        afterRender: function() {
            console.log("afteRender...");
            $('.job-pending').animate({
                bottom: '0px'
            }, 5000, function() {
                console.log("animation done");
            });
        }
    });


    App.Views.Jobs = Jobs;
    return Jobs;
});
