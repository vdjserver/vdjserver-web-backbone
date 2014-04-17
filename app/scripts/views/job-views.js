define(['app'], function(App) {

    'use strict';

    var Jobs = {};

    Jobs.Submit = Backbone.View.extend({
        template: 'jobs/job-submit-form',
        initialize: function(parameters) {

            this.projectModel = parameters.projectModel;

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
            $('#job-modal').modal('show');
        },
        events: {
            'submit form': 'submitJob',
            'click .remove-file-from-job': 'removeFileFromJob'
        },
        submitJob: function(e) {
            e.preventDefault();

            var that = this;

            var formData = Backbone.Syphon.serialize(this);

            $('#job-modal').modal('hide')
                .on('hidden.bs.modal', function() {
                    var jobNotificationView = new Jobs.Notification({
                        formData: formData, 
                        projectModel: that.projectModel
                    });

                    App.Layouts.footer.insertView('#running-jobs', jobNotificationView);
                    jobNotificationView.render();
                });
        },
        removeFileFromJob: function(e) {
            e.preventDefault();

            var uuid = e.target.id;

            // UI
            $('#' + uuid).parent().remove();

            // data collection
            this.selectedFileListings.remove(uuid);
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
        }
    });

    Jobs.IgBlastForm = Backbone.View.extend({
        template: 'jobs/igblast-form'
    });

    Jobs.VdjPipeForm = Backbone.View.extend({
        template: 'jobs/vdjpipe-form',
        initialize: function() {
            this.inputCounter = {};
        },
        events: {
            'click .job-parameter': 'addJobParameter',
            'click .remove-job-parameter': 'removeJobParameter'
        },
        afterRender: function() {
            $('#vdj-pipe-configuration').sortable({
                axis: 'y',
                cursor: 'move',
                revert: true,
                tolerance: 'pointer'
            });
        },
        addJobParameter: function(e) {
            e.preventDefault();

            var displayName = e.target.name;
            var originalName = e.target.dataset.inputname;

            if (this.inputCounter[originalName]) {
                this.inputCounter[originalName] = this.inputCounter[originalName] + 1;
            }
            else {
                this.inputCounter[originalName] = 1;
            }

            var inputName = originalName + this.inputCounter[originalName];

            var parameterView = new Jobs.VdjPipeCheckbox({
                parameterName: displayName,
                originalName: originalName,
                inputName: inputName
            });

            this.insertView('#vdj-pipe-configuration', parameterView);
            parameterView.render();
        },
        removeJobParameter: function(e) {
            e.preventDefault();
            $(e.currentTarget).closest('.vdj-pipe-parameter').remove();
        }
    });

    Jobs.VdjPipeCheckbox = Backbone.View.extend({
        template: 'jobs/vdjpipe-checkbox',
        initialize: function(parameters) {
            this.parameterName = parameters.parameterName;
            this.originalName = parameters.originalName;
            this.inputName = parameters.inputName;
        },
        serialize: function() {
            if (this.parameterName) {
                return {
                    parameterName: this.parameterName,
                    originalName: this.originalName,
                    inputName: this.inputName
                };
            }
        }
    });

    Jobs.Notification = Backbone.View.extend({
        template: 'jobs/notification',
        initialize: function(parameters) {

            this.jobName = parameters.formData['job-name'];
            this.jobStatus = 'Queued';
            this.projectModel = parameters.projectModel;

        },
        serialize: function() {
            return {
                jobName: this.jobName,
                jobStatus: this.jobStatus,
                projectName: this.projectModel.get('value').name
            };
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
