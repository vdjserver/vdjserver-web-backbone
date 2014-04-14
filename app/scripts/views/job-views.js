define(['app'], function(App) {

    'use strict';

    var Jobs = {};

    Jobs.Submit = Backbone.View.extend({
        template: 'jobs/job-submit-form',
        initialize: function(parameters) {

            var jobFormView;

            switch(parameters.jobType) {
                case 'igblast':
                    jobFormView = new Jobs.IgBlastForm();
                    break;

                case 'vdjpipe':
                    jobFormView = new Jobs.VdjPipeForm();
                    break;

                default:
                    break;
            }

            this.jobFormView = jobFormView;
        },
        serialize: function() {
            return {
                selectedFileListings: this.selectedFileListings.toJSON()
            };
        },
        afterRender: function() {
            console.log("calling afterRender");
            this.insertView('#job-form', this.jobFormView);
            this.jobFormView.render();

            $('#job-modal').modal('show');
        },
        events: {
            'click #submit-job': 'submitJob',
            'click .remove-file-from-job': 'removeFileFromJob'
        },
        submitJob: function() {
            console.log("job submitted");

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

    Jobs.IgBlastForm = Backbone.View.extend({
        template: 'jobs/igblast-form'
    });

    Jobs.VdjPipeForm = Backbone.View.extend({
        template: 'jobs/vdjpipe-form'
    });

    Jobs.Notification = Backbone.View.extend({
        template: 'jobs/notification',
        initialize: function() {

        },
        afterRender: function() {
            $('.job-pending').animate({
                bottom: '0px'
            }, 5000, function() {
                console.log("animation done");
            });
        }
    });

    Jobs.History = Backbone.View.extend({
        template: 'jobs/history',
        initialize: function(parameters) {
            this.projectUuid = parameters.projectUuid;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.insertView(loadingView);
            loadingView.render();

            this.collection = new Backbone.Agave.Collection.JobListings();

            var that = this;
            this.collection.fetch()
                .done(function() {
                    loadingView.remove();
                    that.render();
                })
                .fail(function() {

                });
        }
    });


    App.Views.Jobs = Jobs;
    return Jobs;
});
