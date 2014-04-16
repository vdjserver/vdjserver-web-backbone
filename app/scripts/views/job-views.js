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


            this.insertView('.modal-body', this.jobFormView);
            this.jobFormView.render();

            var jobConfigurationView = new Jobs.Configuration();
            this.insertView('#job-configuration', jobConfigurationView);
            jobConfigurationView.render();

            var fileListView = new Jobs.FileList({selectedFileListings: this.selectedFileListings});
            this.insertView('#job-file-list', fileListView);
            fileListView.render();
        },
        afterRender: function() {
/*
            $('.vdj-pipe-parameter').draggable({
                snap: '#vdj-pipe-configuration',
                snapMode: 'inner',
                cursor: 'move',
                containment: ['#vdj-pipe-configuration', '#vdj-pipe-parameters']
            });
*/
            $('#job-modal').modal('show');
        },
        events: {
            'click #submit-job': 'submitJob',
            'click .remove-file-from-job': 'removeFileFromJob',
            'click .job-parameter': 'addJobParameter'
        },
        submitJob: function(e) {
            console.log("job submitted");

            e.preventDefault();

            //var formData = Backbone.Syphon.serialize('#job-form');
            //console.log("formData is: " + JSON.stringify(formData));


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
        },
        addJobParameter: function(e) {
            e.preventDefault();

            var displayName = e.target.name;

            var parameterView = new Jobs.VdjPipeCheckbox({parameterName: displayName});
            this.insertView('#vdj-pipe-configuration', parameterView);
            parameterView.render();
            /*
            console.log("displayName is: " + displayName);
            console.log("add job param");

            $('#vdj-pipe-configuration').append(
                '<div class="form-group">'
                    + '<label>' + displayName + '</label> '
                    + '<input class="job-form-item" name="" type="checkbox">'
                    + '<span class="label label-danger">&times;</span>'
                + '</div>'
            );
            */

        }
    });

    Jobs.Configuration = Backbone.View.extend({
        template: 'jobs/job-configuration-form'
    });

    Jobs.FileList = Backbone.View.extend({
        template: 'jobs/job-file-list',
        serialize: function() {
            return {
                selectedFileListings: this.selectedFileListings.toJSON()
            };
        },
    });

    Jobs.IgBlastForm = Backbone.View.extend({
        template: 'jobs/igblast-form'
    });

    Jobs.VdjPipeForm = Backbone.View.extend({
        template: 'jobs/vdjpipe-form'
    });

    Jobs.VdjPipeCheckbox = Backbone.View.extend({
        template: 'jobs/vdjpipe-checkbox',
        initialize: function(parameters) {
            console.log("parameter is: " + JSON.stringify(parameters));
            this.parameterName = parameters.parameterName;
        },
        serialize: function() {
            if (this.parameterName) {
                return {
                    parameterName: this.parameterName
                };
            }
        }
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
