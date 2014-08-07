define([
    'app',
    'handlebars',
    'backbone.syphon',
    'vdjpipe-utilities',
], function(App, Handlebars) {

    'use strict';

    Handlebars.registerHelper('JobSuccessCheck', function(data, options) {
        if (data.status === 'FINISHED') {
            return options.fn(data);
        }

        return options.inverse(data);
    });

    var Jobs = {};

    Jobs.Submit = Backbone.View.extend({
        template: 'jobs/job-submit-form',
        initialize: function(parameters) {
            this.projectModel = parameters.projectModel;

            this.workflows = new Backbone.Agave.Collection.Jobs.Workflows();
        },
        fetchNetworkData: function() {
            var deferred = $.Deferred();
            this.workflows
                .fetch()
                .done(function() {
                    deferred.resolve();
                });

            return deferred;
        },
        serialize: function() {
            return {
                selectedFileListings: this.selectedFileListings.toJSON(),
                workflows: this.workflows.toJSON(),
            };
        },
        afterRender: function() {
            $('#job-modal').modal('show');
        },
        events: {
            'change #select-workflow':     'showWorkflow',
            'click .remove-file-from-job': 'removeFileFromJob',
            'click #create-workflow': 'createWorkflow',
            'click #edit-workflow':   'editWorkflow',
            'click #delete-workflow': 'deleteWorkflow',
            'submit form': 'submitJob',
        },
        // Event Helpers
        resetDeleteWorkflow: function() {
            $('#delete-workflow').removeClass('btn-danger');
            $('#delete-workflow').addClass('btn-outline-danger');
            $('#delete-workflow').html('&nbsp;Delete');
        },
        // Events
        createWorkflow: function(e) {
            e.preventDefault();

            this.trigger('setupCreateWorkflowView');
        },
        editWorkflow: function(e) {
            e.preventDefault();

            var workflowId = $('#select-workflow').val();
            var workflow = this.workflows.get(workflowId);

            this.trigger('setupEditWorkflowView', workflow);
        },
        deleteWorkflow: function(e) {
            e.preventDefault();

            if ($('#delete-workflow').hasClass('btn-outline-danger')) {
                $('#delete-workflow').removeClass('btn-outline-danger');
                $('#delete-workflow').addClass('btn-danger');
                $('#delete-workflow').html('&nbsp;Confirm Delete');
            }
            else if ($(e.currentTarget).hasClass('btn-danger')) {
                var that = this;

                var workflowId = $('#select-workflow').val();

                var workflow = this.workflows.get(workflowId);

                this.workflows.remove(workflow);

                workflow.destroy()
                    .done(function() {
                        $('#select-workflow').val('');
                        that.removeView('#workflow-staging-area');
                        $('#select-workflow option[value="' + workflowId + '"]').remove();
                        that.resetDeleteWorkflow();
                    })
                    .fail(function() {
                        console.log("workflow delete error");
                    });
            }
        },
        showWorkflow: function(e) {
            e.preventDefault();

            this.resetDeleteWorkflow();

            // Do housekeeping first
            this.removeView('#workflow-staging-area');

            // Setup and insert new workflow views
            var workflowId = e.target.value;

            var workflow = this.workflows.get(workflowId);

            //var defaultWorkflows = Jobs.GetWorkflowConfig();

            var workflowData = workflow.getWorkflowFromConfig();

            //console.log("workflowData is: " + JSON.stringify(workflowData));

            var workflowViews = new App.Views.Helpers.VdjpipeViewHelpers.GenerateVdjpipeWorkflowViews(workflowData);

            /*
                I'd love to use insertViews instead, but as of 24/July/2014
                it seems to work on the parent layout instead of the view
                represented by |this|.

                This behavior might be a bug in layout manager, so the
                following loop is a workaround for now.
            */
            //console.log("selected files are: " + JSON.stringify(this.selectedFileListings));
            for (var i = 0; i < workflowViews.length; i++) {
                var view = workflowViews[i];

                view.isEditable = false;
                view.files = this.selectedFileListings;

                this.insertView('#workflow-staging-area', view);

                view.render();
            }
        },
        submitJob: function(e) {
            e.preventDefault();





/*
            var that = this;

            var formData = Backbone.Syphon.serialize(this);

            console.log("job formData is: " + JSON.stringify(formData));

            var job;
            if (formData.formtype === 'vdjpipe') {
                console.log("formType ok");

                console.log("parent view: selectedFileListings are: " + JSON.stringify(this.selectedFileListings));

                job = new Backbone.Agave.Model.Job.VdjPipe();
                job.set('name', formData['job-name']);
                job.generateVdjPipeConfig(formData, this.selectedFileListings);
                job.setArchivePath(this.projectModel.get('uuid'));

                var tmpFileMetadatas = this.selectedFileListings.pluck('value');
                var filePaths = [];
                for (var i = 0; i < tmpFileMetadatas.length; i++) {
                    console.log('tmpFileMetadatas is: ' + JSON.stringify(tmpFileMetadatas[i]));
                    filePaths.push('/projects/' + tmpFileMetadatas[i].projectUuid + '/files/' + tmpFileMetadatas[i].name);
                }

                job.setFilesParameter(filePaths);

                console.log("job is: " + JSON.stringify(job));
            }

            $('#job-modal').modal('hide')
                .on('hidden.bs.modal', function() {
                    var jobNotificationView = new Jobs.Notification({
                        job: job,
                        projectModel: that.projectModel,
                    });

                    App.Layouts.main.insertView('#running-jobs', jobNotificationView);
                    jobNotificationView.render();
                });
            */
        },
        removeFileFromJob: function(e) {
            e.preventDefault();

            var uuid = e.target.id;

            // UI
            $('#' + uuid).parent().parent().parent().remove();

            // data collection
            this.selectedFileListings.remove(uuid);
        }
    });

    Jobs.WorkflowEditor = Backbone.View.extend({
        template: 'jobs/vdjpipe-form-options',
        initialize: function() {

            this.counter = 0;
            this.editableWorkflow = {};
        },
        setupEditableWorkflow: function(editableWorkflow) {

            var workflowData = editableWorkflow.getWorkflowFromConfig();

            var workflowViews = new App.Views.Helpers.VdjpipeViewHelpers.GenerateVdjpipeWorkflowViews(workflowData);

            //console.log("selected files are: " + JSON.stringify(this.selectedFileListings));

            $('#vdj-pipe-configuration-placeholder').remove();

            for (this.counter = 0; this.counter < workflowViews.length; this.counter++) {
                var view = workflowViews[this.counter];

                view.isEditable = true;
                //view.files = this.selectedFileListings;

                this.insertView('#vdj-pipe-configuration', view);
                view.render();
            }
        },
        afterRender: function() {
            $('#workflow-modal').modal('show');

            $('#vdj-pipe-configuration').sortable({
                axis: 'y',
                cursor: 'move',
                tolerance: 'pointer',
            });

            if (! _.isEmpty(this.editableWorkflow)) {
                this.setupEditableWorkflow(this.editableWorkflow);
            }
        },
        events: {
            'click #workflow-cancel': 'workflowCancel',
            'click #workflow-save': 'workflowSave',

            'click .workflow-options': 'setupWorkflowOptions',

            'click .job-parameter': 'addJobParameter',
            'click .remove-job-parameter': 'removeJobParameter',
        },
        // Event action helpers
        clearPlaceholder: function() {
            var deferred = $.Deferred();

            if ($('#vdj-pipe-configuration-placeholder').length) {

                $('#vdj-pipe-configuration-placeholder').addClass('animated flipOutX');
                $('#vdj-pipe-configuration-placeholder').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $('#vdj-pipe-configuration-placeholder').remove();

                    deferred.resolve();
                });
            }
            else {
                deferred.resolve();
            }

            return deferred;
        },
        // Event actions
        addJobParameter: function(e) {
            e.preventDefault();

            var parameterType = e.target.dataset.parametertype;

            //console.log("parameterType is: " + parameterType);

            this.counter = this.counter + 1;

            var vdjPipeView = App.Views.Helpers.VdjpipeViewHelpers.GetVdjpipeView(
                parameterType,
                this.counter,
                {}
            );

            vdjPipeView.isEditable = true;

            var that = this;

            this.clearPlaceholder()
                .done(function() {
                    that.insertView('#vdj-pipe-configuration', vdjPipeView);
                    vdjPipeView.render();
                });
        },
        removeJobParameter: function(e) {
            e.preventDefault();

            $(e.currentTarget).closest('.vdj-pipe-parameter').addClass('animated flipOutX');

            $(e.currentTarget).closest('.vdj-pipe-parameter').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $(e.currentTarget).closest('.vdj-pipe-parameter').remove();
            });
        },
        setupWorkflowOptions: function(e) {
            e.preventDefault();

            var workflowType = e.target.dataset.id;

            $('.workflow-options-list').hide();
            $('.workflow-options').parent('li').removeClass('active');
            $(e.currentTarget).parent('li').addClass('active');

            $('#workflow-options-' + workflowType + '-list').show();
        },
        workflowCancel: function(e) {
            e.preventDefault();

            this.trigger('setupJobSubmitView');
        },
        workflowSave: function(e) {
            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);

            var serializedConfig = App.Models.Helpers.VdjPipeUtilities.SerializeVdjPipeConfig(formData);

            //console.log("formData is: " + JSON.stringify(formData));
            //console.log("serialized config is: " + JSON.stringify(serializedConfig));

            var jobWorkflow = new Backbone.Agave.Model.Job.Workflow();
            jobWorkflow.setConfigFromFormData(formData);

            //console.log("test is: " + JSON.stringify(jobWorkflow.get('value')));

            var that = this;

            jobWorkflow
                .save()
                .done(function() {
                    that.trigger('setupJobSubmitView');
                })
                .fail(function(e) {
                    // troubleshoot
                    console.log("save error is: " + JSON.stringify(e));
                    console.log("workflow save fail");
                });

        },
    });

    Jobs.Notification = Backbone.View.extend({
        template: 'jobs/notification',
        initialize: function(parameters) {

            this.jobName = this.job.get('name');
            this.jobStatus = 'Queued';
            this.projectModel = parameters.projectModel;

            var that = this;

            var jobWebsocket = new App.Models.JobWebsocket();

            this.job.createArchivePathDirectory(this.projectModel.get('uuid'))
                .then(function() {
                    return that.job.save();
                })
                // Create metadata
                .then(function() {
                    return that.job.createJobMetadata(that.projectModel.get('uuid'));
                })
                // Share job w/ project members
                .then(function() {
                    return that.job.shareJobWithProjectMembers(that.projectModel.get('uuid'));
                })
                .then(function() {
                    var jobNotification = new Backbone.Agave.Model.Notification.Job();
                    jobNotification.set('associatedUuid', that.job.get('id'));
                    return jobNotification.save();
                })
                .done(function() {
                    //var jobWebsocketFactory = new App.Models.JobWebsocket.Factory();
                    //var jobWebsocket = jobWebsocketFactory.getJobWebsocket();
                    jobWebsocket.subscribeToJob(that.job.get('id'));
                })
                .fail(function() {
                    console.log('job submit fail');
                });

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
            this.setView(loadingView);
            loadingView.render();

            var jobUuids = new Backbone.Agave.Collection.Jobs.Listings({projectUuid: this.projectUuid});

            this.jobs = new Backbone.Agave.Collection.Jobs();

            var that = this;
            jobUuids.fetch()
                .done(function() {

                    var jobModels = [];

                    // Create empty job models and set ids for all job listing results
                    for (var i = 0; i < jobUuids.models.length; i++) {
                        var job = new Backbone.Agave.Model.Job.Detail({
                            id: jobUuids.at([i]).get('value').jobUuid,
                        });

                        jobModels.push(job);
                    }

                    // Do a massive async fetch on all individual models
                    var jobFetches = _.invoke(jobModels, 'fetch');

                    $.when.apply($, jobFetches).done(function() {
                        for (var i = 0; i < jobModels.length; i++) {
                            that.jobs.add(jobModels[i]);
                        }

                        loadingView.remove();
                        that.render();
                    });

                })
                .fail(function() {

                });
        },
        serialize: function() {
            return {
                jobs: this.jobs.toJSON(),
                projectUuid: this.projectUuid,
            };
        },
    });

    Jobs.IgBlastForm = Backbone.View.extend({
        template: 'jobs/igblast-form'
    });

    Jobs.GetWorkflowConfig = function(workflow) {
        var workflowConfig;

        switch(workflow) {
            case 'Workflow A':

                workflowConfig = {

                   'single_read_pipe': [
                      { 'quality_stats': { 'out_prefix': 'pre-filter_' } },
                      { 'composition_stats': { 'out_prefix': 'pre-filter_' } },

                      { 'min_quality_window_filter': { 'min_quality': 20, 'min_length': 200 } },
                      { 'ambiguous_window_filter': { 'min_length': 200, 'max_ambiguous': 5 } },
                      {
                        'average_quality_window_filter': {
                           'min_quality': 25, 'window_length': 10, 'min_length': 200
                        }
                      },
                      { 'match':
                        {
                            'reverse': true, 'trimmed': false,
                            'elements': [
                                 {
                                   'start': { 'pos': 14 }, 'length': 8,
                                   'seq_file': 'imid1.fasta',
                                   'min_score': 10, 'value_name': 'iMID',
                                   'score_name': 'iMID_score'
                                 },
                                 {
                                   'end': { 'before': 'iMID', 'pos': -1 }, 'length': 10,
                                   'value_name': 'UMI'
                                 }
                            ]
                        }
                      },
                      { 'histogram': { 'name': 'iMID', 'out_path': 'iMID.csv' } },
/*
                      { 'select': {
                            'match': [ { 'name': 'iMID_UMI_map', 'value': '' } ],
                            'do': [ { 'write_sequence': { 'out_path': 'sample_1.fastq' } } ]
                        }
                      },
*/
                      { 'write_sequence':
                            {
                         'trimmed': false, 'skip_empty': true, 'out_path': 'all_seqs.fastq'
                            }
                      },
                      { 'write_value': {
                            'out_path': 'vals.csv.bz2', 'names': ['read_id', 'iMID', 'UMI']
                        }
                      },
                      { 'write_value': {
                            'out_path': 'vals_{iMID}.csv', 'names': ['read_id', 'iMID', 'UMI']
                        }
                      }

                   ]
                };

                break;

            default:
                break;
        }

        return workflowConfig;
    };

    App.Views.Jobs = Jobs;
    return Jobs;
});
