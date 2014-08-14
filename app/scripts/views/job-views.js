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

            var that = this;

            this.workflows
                .fetch()
                .done(function() {

                    that.workflows.setPredefinedWorkflows();

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

            // Send a change event to select the first workflow
            //$('#select-workflow').change();
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
            $('#delete-workflow')
                .removeClass('btn-danger')
                .addClass('btn-outline-danger')
                .html('&nbsp;Delete')
            ;
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
                $('#delete-workflow')
                    .removeClass('btn-outline-danger')
                    .addClass('btn-danger')
                    .html('&nbsp;Confirm Delete')
                ;
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

            console.log("past housekeeping");

            // Setup and insert new workflow views
            var workflowId = e.target.value;
                console.log("val is: " + workflowId);

            if (workflowId) {


                var workflow = this.workflows.get(workflowId);
                var workflowData = workflow.getWorkflowFromConfig();

                /*
                var defaultWorkflow = Jobs.GetPredefinedWorkflowConfig(workflowId);
                if (defaultWorkflow) {
                    workflowData = defaultWorkflow;
                }
                else {
                    workflow = this.workflows.get(workflowId);
                    workflowData = workflow.getWorkflowFromConfig();
                }
                */
                console.log("workflow is: " + JSON.stringify(workflow));
                console.log("workflowData is: " + JSON.stringify(workflowData));

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

    Jobs.WorkflowEditor = Backbone.View.extend(
        /** @lends WorkflowEditor.prototype */
        {
            /**
             * This is the workflow editor view for vdjpipe workflows.
             *
             * @augments external:Backbone.View
             * @constructs
             */
            initialize: function() {
                this.counter = 0;
                this.editableWorkflow = {};

                this.workflows = new Backbone.Agave.Collection.Jobs.Workflows();
            },

            /** Layout Manager template */
            template: 'jobs/vdjpipe-form-options',

            /**
             * Fetches remote data that this view requires.
             *
             * @returns {Promise} deferred
             */
            fetchNetworkData: function() {
                var deferred = $.Deferred();
                this.workflows
                    .fetch()
                    .done(function() {
                        deferred.resolve();
                    });

                return deferred;
            },

            /**
             * Creates editable workflow views for the supplied workflow
             * and inserts them into the DOM.
             *
             * @param {Workflow} editableWorkflow
             */
            setupEditableWorkflow: function(editableWorkflow) {

                // Set name on DOM
                $('#workflow-name').val(editableWorkflow.get('value').workflowName);

                // Remove workflow placeholder from DOM
                $('#vdj-pipe-configuration-placeholder').remove();

                //console.log("selected files are: " + JSON.stringify(this.selectedFileListings));

                var workflowData = editableWorkflow.getWorkflowFromConfig();

                var workflowViews = new App.Views.Helpers.VdjpipeViewHelpers.GenerateVdjpipeWorkflowViews(workflowData);

                for (this.counter = 0; this.counter < workflowViews.length; this.counter++) {
                    var view = workflowViews[this.counter];

                    view.isEditable = true;
                    //view.files = this.selectedFileListings;

                    this.insertView('#vdj-pipe-configuration', view);
                    view.render();
                }
            },

            /**
             * 1. Tells bootstrap modal js to show this view.
             * 2. Sets up jquery sortable on the workflow staging area.
             * 3. Sets up an editable workflow if this view has one.
             */
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

            /**
             * DOM events
             */
            events: {
                'click #workflow-cancel': 'workflowCancel',
                'click #workflow-save': 'workflowSave',

                'click .workflow-options': 'toggleWorkflowOptionList',

                'click .job-parameter': 'addJobParameter',
                'click .remove-job-parameter': 'removeJobParameter',
            },

            // Event Helpers

            /**
             * Removes workflow config placeholder DOM element.
             *
             * @returns {Promise} deferred Promise that the placeholder was removed.
             */
            clearPlaceholder: function() {
                var deferred = $.Deferred();

                if ($('#vdj-pipe-configuration-placeholder').length) {

                    $('#vdj-pipe-configuration-placeholder')
                        .addClass('animated flipOutX')
                        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                            $('#vdj-pipe-configuration-placeholder').remove();
                            deferred.resolve();
                        })
                    ;
                }
                else {
                    deferred.resolve();
                }

                return deferred;
            },

            /**
             * Displays errors on the DOM based on form validation.
             *
             * @param {array} formErrors An array of validation error objects.
             */
            displayFormErrors: function(formErrors) {

                // Clear out old errors
                $('.alert-danger').fadeOut(function() {
                    this.remove();
                });

                $('.form-group').removeClass('has-error');

                // Display any new errors
                if (_.isArray(formErrors)) {

                    for (var i = 0; i < formErrors.length; i++) {
                        var message = formErrors[i].message;
                        var type = formErrors[i].type;

                        this.$el.find('.modal-body').prepend($('<div class="alert alert-danger">').text(message).fadeIn());
                        $('#' + type + '-container').addClass('has-error');
                    }
                }
            },

            /**
             * Validates workflow names against the following rules:
             *
             * 1.) Checks if the workflow matches a predefined workflow name.
             * This is not allowed.
             *
             * 2.) Checks if the current workflow name is a duplicate of an existing
             * workflow name besides the one currently being edited.
             *
             * @returns {array|void} error An array that contains an error object.
             */
            validateWorkflowName: function(workflowName) {

                var predefinedWorkflowNames = this.workflows.getPredefinedWorkflowNames();
                var predefinedClash = _.indexOf(predefinedWorkflowNames, workflowName);

                if (predefinedClash >= 0) {
                    return [{
                        'message': 'Custom workflows cannot be named after predefined workflows. Please choose a different name.',
                        'type': 'workflow-name',
                    }];
                }


                if (workflowName !== this.editableWorkflow.get('value').workflowName) {

                    var workflowNames = this.workflows.getWorkflowNames();

                    var duplicateExists = _.indexOf(workflowNames, workflowName);

                    if (duplicateExists >= 0) {
                        return [{
                            'message': 'This workflow name already exists.',
                            'type': 'workflow-name',
                        }];
                    }
                }
            },

            /**
             * Aggregates and returns all form errors. This includes errors
             * from model validation and custom form validation for duplicate
             * workflow names.
             *
             * @returns {array} formErrors
             */
            getFormErrors: function(formData) {
                var jobWorkflow = new Backbone.Agave.Model.Job.Workflow();
                jobWorkflow.setConfigFromFormData(formData);



                var formWorkflowNameErrors = this.validateWorkflowName(formData['workflow-name']) || [];
                var formModelErrors = jobWorkflow.validate() || [];



                var formErrors = [];

                // merge
                formErrors = _.zip(formModelErrors, formWorkflowNameErrors);

                // combine nested arrays
                formErrors = _.flatten(formErrors);

                // get rid of null values
                formErrors = _.compact(formErrors);

                return formErrors;
            },
/*
            validateWorkflowOptions: function() {

                var views = this.getViews('#vdj-pipe-configuration');

                var errors = [];

                for (var i = 0; i < views.length; i++) {
                    var view = views[i];

                    if (true) {}
                    var error = view.validateParameters();
                    errors.push(error);
                }
            },
*/

            // Event Actions

            /**
             * Adds a job parameter to the new workflow and displays it on
             * the DOM.
             *
             * @param {event} e
             */
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

            /**
             * Removes a job parameter from the new workflow and removes it
             * from the DOM.
             *
             * @param {event} e
             */
            removeJobParameter: function(e) {
                e.preventDefault();

                $(e.currentTarget)
                    .closest('.vdj-pipe-parameter')
                    .addClass('animated flipOutX')
                ;

                $(e.currentTarget)
                    .closest('.vdj-pipe-parameter')
                    .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                        $(e.currentTarget).closest('.vdj-pipe-parameter').remove();
                    })
                ;
            },

            /**
             * Shows a list for the selected workflow option type and hides
             * all others.
             *
             * @param {event} e
             */
            toggleWorkflowOptionList: function(e) {
                e.preventDefault();

                var workflowType = e.target.dataset.id;

                $('.workflow-options-list').hide();
                $('.workflow-options').parent('li').removeClass('active');
                $(e.currentTarget).parent('li').addClass('active');

                $('#workflow-options-' + workflowType + '-list').show();
            },

            /**
             * Sends an event signifying that this workflow should be closed
             * without being saved.
             *
             * @param {event} e
             */
            workflowCancel: function(e) {
                e.preventDefault();
                this.trigger(Jobs.WorkflowEditor.events.closeWorkflowEditor);
            },

            /**
             * Validates and optionally saves the current workflow.
             *
             * If errors are present, then they are displayed.
             *
             * Otherwise, the current workflow is saved and an event is sent
             * that signifies that the workflow is ready to be closed.
             *
             * If this workflow is an edit for an existing workflow, then it
             * will be updated. Otherwise, a new workflow will be created in
             * the save process.
             *
             * @param {event} e
             */
            workflowSave: function(e) {
                e.preventDefault();

                var formData = Backbone.Syphon.serialize(this);

                var formErrors = this.getFormErrors(formData);

                if (formErrors.length > 0) {
                    this.displayFormErrors(formErrors);
                }
                else {

                    var jobWorkflow;

                    // Adjust if we're updating an existing workflow instead of saving a new one
                    // Also make sure that we create a new workflow if we're editing a predefined one
                    if (! _.isEmpty(this.editableWorkflow) && !this.editableWorkflow.get('predefined')) {
                        jobWorkflow = this.editableWorkflow;
                    }
                    else {
                        jobWorkflow = new Backbone.Agave.Model.Job.Workflow();
                    }

                    jobWorkflow.setConfigFromFormData(formData);

                    var that = this;

                    jobWorkflow.save()
                        .done(function() {
                            console.log("save done");
                            that.trigger(Jobs.WorkflowEditor.events.closeWorkflowEditor);
                        })
                        .fail(function() {
                            // troubleshoot
                            console.log("save fail");
                        })
                    ;
                }
            },
        },
        /** Static members */
        {
            /**
             * Custom event enum
             */
            events: {
                closeWorkflowEditor: 'closeWorkflowEditorEvent',
            },
        }
    );

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

    Jobs.GetPredefinedWorkflowConfig = function(workflowName) {
        var config;

        switch(workflowName) {
            case 'single-reads':

                config = {
                    'summary_output_path': 'summary.txt',
                    'single_read_pipe': [
                        { 'quality_stats': { 'out_prefix': 'pre-filter_' } },
                        { 'composition_stats': { 'out_prefix': 'pre-filter_' } },
                        {
                            'match': {
                                'reverse': true,
                                'elements': [
                                    { /* barcode element */
                                        'start': { },
                                        'sequence': [
                                            'forward barcode sequence1',
                                            'forward barcode sequence2'
                                        ],
                                        'cut_lower': { 'after': 0 },
                                        'required': true,
                                        'require_best': true,
                                        'value_name': 'MID', 'score_name': 'MID-score'
                                    }
                                ]
                            }
                        },
                        { 'histogram': { 'name': 'MID', 'out_path': 'MID.csv' } },
                        { 'length_filter': { 'min': 200 } },
                        { 'average_quality_filter': 35 },
                        { 'homopolymer_filter': 20 },
                        { 'quality_stats': { 'out_prefix': 'post-filter_' } },
                        { 'composition_stats': { 'out_prefix': 'post-filter_' } },
                        {
                            'find_shared': {
                            'out_unique':'.fasta'
                            }
                        }
                    ]
                };

                break;

            case 'paired-reads':

                break;

            default:
                break;
        }

        return config;
    };

    App.Views.Jobs = Jobs;
    return Jobs;
});
