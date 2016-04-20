define([
    'app',
    'moment',
    'backbone.syphon',
    'vdjpipe-view-factory',
], function(
    App,
    moment
) {

    'use strict';

    var WorkflowParametersMixin = {

        /**
         * Removes the specified job parameter from the workflow, and also
         * removes it from the DOM.
         *
         * @param {event} e
         */
        _removeJobParameter: function(e) {
            e.preventDefault();

            $(e.currentTarget)
                .closest('.vdj-pipe-parameter')
                .addClass('animated flipOutX')
            ;

            var deferred = $.Deferred();

            $(e.currentTarget)
                .closest('.vdj-pipe-parameter')
                .one(
                    'webkitAnimationEnd'
                    + ' mozAnimationEnd'
                    + ' MSAnimationEnd'
                    + ' oanimationend'
                    + ' animationend',

                    function() {
                        $(e.currentTarget)
                            .closest('.vdj-pipe-parameter')
                            .remove()
                            .promise()
                            .done(function() {
                                deferred.resolve();
                            })
                            ;
                    }
                )
                ;

            return deferred;
        },

    };

    var Jobs = {};

    Jobs.Submit = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-submit-form',
        initialize: function(parameters) {
            this.projectModel = parameters.projectModel;
            this.generatedJobName = this._generateJobName();
        },
        serialize: function() {
            return {
                selectedFileListings: this.selectedFileListings.toJSON(),
                generatedJobName: this.generatedJobName,
                projectUuid: this.projectModel.get('uuid')
            };
        },
        afterRender: function() {
            $('#job-modal').modal('show');
            $('#job-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },
        events: {
            'click .remove-file-from-job': '_removeFileFromJob',
            'submit form': '_submitJobForm',
            'click #job-submit-exit': '_exitJobForm',
            'click #job-submit-status': '_navigateToJobsListView',
        },

        // Private Methods
        _generateJobName: function() {
            var datetime = moment().format('D-MMM-YYYY h:mm:ss a');

            return 'My Job ' + datetime;
        },
        _exitJobForm: function(e) {
            e.preventDefault();

            var that = this;

            $('#job-modal').one('hidden.bs.modal', function(e) {
                App.router.navigate('project/' + that.projectModel.get('uuid'), {
                    trigger: true,
                });
            });
        },
        _navigateToJobsListView: function(e) {
            e.preventDefault();

            var that = this;

            $('#job-modal').one('hidden.bs.modal', function(e) {
                App.router.navigate('project/' + that.projectModel.get('uuid') + '/jobs', {
                    trigger: true,
                });
            });
        },
        _submitJobForm: function(e) {
            e.preventDefault();

            var that = this;

            var formData = Backbone.Syphon.serialize(this);

            var validationError = this._validateJobForm(formData);

            if (validationError) {
                return;
            }

            this.uiShowJobLoadingView();

            var jobSubview = this.getView('#job-staging-subview');

            jobSubview.stageJob(formData)
                .done(function() {
                })
                .fail(function() {
                    that._uiCancelJobLoadingView();
                })
                ;
        },

        _validateJobForm: function(formData) {
            // Remove old validation warnings
            $('.form-group').removeClass('has-error');

            var validationError = false;

            // Begin Validation
            if (!formData['job-name']) {
                $('#job-name')
                    .closest('.form-group')
                    .addClass('has-error')
                    ;

                // Scroll to top
                document.getElementById('job-modal-label').scrollIntoView();

                validationError = true;
            }

            var jobSubview = this.getView('#job-staging-subview');
            if (jobSubview.validateJobForm()) {
                validationError = true;
            }

            return validationError;
        },

        _removeFileFromJob: function(e) {
            e.preventDefault();

            var uuid = e.target.id;

            // UI
            $('#' + uuid).parent().parent().parent().remove();

            // data collection
            this.selectedFileListings.remove(uuid);
        },

        // UI
        uiShowJobLoadingView: function() {
            // Clear out any previous errors
            $('#job-submit-loading-view').html('');
            $('#job-submit-loading-view').removeClass('alert alert-danger');

            var message = new App.Models.MessageModel({
                'body': 'Your job has been launched!'
            });

            var alertView = new App.Views.Util.Alert({
                options: {
                    type: 'success'
                },
                model: message
            });

            this.setView('#job-submit-loading-view', alertView);
            alertView.render();

            $('#job-submit-exit, #job-submit-status').removeClass('hidden');
            $('.job-form-item, .job-submit-button').addClass('hidden');
        },

        _uiCancelJobLoadingView: function() {
            this.removeView('#job-submit-loading-view');

            $('#job-submit-loading-view').removeClass('alert alert-info');
            $('.job-form-item, .job-submit-button').removeAttr('disabled');

            $('#job-submit-loading-view').addClass('alert alert-danger');
            $('#job-submit-loading-view').append(
                'There was an error launching your job.'
                + '<br/>'
                + 'Please try again.'
            );
        },
    });

    Jobs.StagingBase = Backbone.View.extend({
        startJob: function(jobModel) {

            var that = this;

            var systems = new Backbone.Agave.Collection.Systems();

            return systems.fetch()
                .then(function() {

                    var jobExecutionSystemHostname = jobModel.get('executionSystem');
                    var isSmallSystem = systems.isSmallExecutionSystem(jobExecutionSystemHostname);

                    if (isSmallSystem === false) {
                        var executionSystemName = systems.getLargeExecutionSystem();

                        jobModel.configureLargeExecutionHost(executionSystemName);
                    }
                })
                .then(function() {
                    // DEBUG
                    if (EnvironmentConfig.debug.console) {
                        if (jobModel.has('parameters')) {

                            var tmpDebugJobModelLog = JSON.stringify(jobModel.get('parameters'))
                                                        .replace(/\\"/g, '"')
                                                         //.replace(/^"/, '\'')
                                                         //.replace(/"$/, '\'');
                                                        ;
                            console.log('DEBUG - job parameters are: ' + JSON.stringify(tmpDebugJobModelLog));
                            console.log('DEBUG - job is: ' + JSON.stringify(jobModel));
                        }
                    }

                    if (EnvironmentConfig.debug.disableJobs) {
                        return;
                    }

                    return jobModel.submitJob(that.projectModel.get('uuid'))
                        .then(function() {
                            //return $('#job-modal').modal('hide').promise();
                        })
                        ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Notification.Job().save()');
                    telemetry.set('view', 'Jobs.StagingBase');
                    telemetry.save();
                })
                ;
        },
    });

    Jobs.VdjpipeStaging = Jobs.StagingBase.extend(
        _.extend({}, WorkflowParametersMixin, {

            // Public Methods
            template: 'jobs/vdjpipe-staging',
            initialize: function(parameters) {
                this.projectModel = parameters.projectModel;

                this.workflows = new Backbone.Agave.Collection.Jobs.Workflows();
                this.workflows.setPredefinedWorkflows();
            },
            serialize: function() {
                return {
                    selectedFileListings: this.selectedFileListings.toJSON(),
                    workflows: this.workflows.toJSON(),
                };
            },
            events: {
                'click .remove-job-parameter': '_removeJobEvent',
                'change #select-workflow': '_showWorkflow',
            },
            validateJobForm: function() {

                var validationError = false;

                // Check if read level files are present
                var readLevelFiles = this.selectedFileListings.filter(function(file) {

                    if (file.get('value').fileType === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ) {
                        return file;
                    }
                });

                if (readLevelFiles.length === 0) {

                    $('#input-file-list')
                        .addClass('has-error')
                        ;

                    validationError = true;
                }

                if ($.trim($('#workflow-staging-area').html()) === '') {

                    $('#select-workflow')
                        .closest('.form-group')
                        .addClass('has-error')
                        ;

                    $('#select-workflow')
                        .closest('.form-group')
                        .get(0)
                        .scrollIntoView()
                        ;

                    validationError = true;
                }

                return validationError;
            },
            stageJob: function(formData) {
                var job = new Backbone.Agave.Model.Job.VdjPipe();

                // TODO: refactor this to be called during |Jobs.StagingBase.startJob()|
                var totalFileSize = this.selectedFileListings.getTotalFileSize();
                job.configureExecutionHostForFileSize(totalFileSize);

                var selectedFileListings = _.extend({}, this.selectedFileListings);
                var allFiles = _.extend({}, this.allFiles);

                job.prepareJob(
                    formData,
                    selectedFileListings,
                    allFiles,
                    this.projectModel.get('uuid')
                );

                return this.startJob(job);
            },

            // Private Methods
            _adjustModalHeight: function() {
                var modalHeight = $('.modal-dialog').innerHeight();
                $('.modal-backdrop').css({height: modalHeight + 100});
            },

            // Event Responders
            _removeJobEvent: function(e) {
                e.preventDefault();

                var that = this;

                this._removeJobParameter(e)
                    .done(function() {
                        that._adjustModalHeight();
                    })
                    ;
            },
            _showWorkflow: function(e) {
                e.preventDefault();

                var that = this;

                // Do housekeeping first
                this.removeView('#workflow-staging-area');
                $('#workflow-staging-area').empty();

                // Setup and insert new workflow views
                var workflowId = e.target.value;

                // Only continue if there's actually a workflow selected
                if (workflowId) {

                    var workflow = this.workflows.get(workflowId);

                    var workflowViews = new App.Utilities.VdjpipeViewFactory.GenerateVdjpipeWorkflowViews(
                        workflow.get('value').config
                    );

                    /*
                        I'd love to use insertViews instead, but as of 24/July/2014
                        it seems to work on the parent layout instead of the view
                        represented by |this|.

                        This behavior might be a bug in layout manager, so the
                        following loop is a workaround for now.
                    */

                    // Note: views will change places in the dom as they render asynchronously
                    // So we need to make sure that they're all inserted properly before calling render.

                    var workflowLayout = new Backbone.View();
                    this.insertView('#workflow-staging-area', workflowLayout);

                    for (var i = 0; i < workflowViews.length; i++) {
                        var view = workflowViews[i];

                        view.isRemovable = false;
                        view.isOrderable = false;
                        view.files = this.selectedFileListings;
                        view.allFiles = this.allFiles;
                        view.layoutView = workflowLayout;

                        view.prepareFiles();

                        workflowLayout.insertView(view);
                    }

                    this.listenTo(
                        workflowLayout,
                        'FixModalBackdrop',
                        function() {
                            that._adjustModalHeight();
                        }
                    );

                    // Render all workflow views
                    workflowLayout.render().promise().done(function() {
                        that._adjustModalHeight();
                    });

                    var workflowConfig = workflow.get('value');
                    if (workflowConfig['config']['paired_reads'] === true) {
                        $('#workflow-staging-area').append(
                            '<input type="radio" class="hidden" name="paired_reads" id="paired_reads" checked>'
                        );
                    }
                    else {
                        $('#workflow-staging-area').append(
                            '<input type="radio" class="hidden" name="single_reads" id="single_reads" checked>'
                        );
                    }
                }
            },
        })
    );

    Jobs.IgBlastStaging = Jobs.StagingBase.extend({
        template: 'jobs/igblast-staging',
        stageJob: function(formData) {

            var job = new Backbone.Agave.Model.Job.IgBlast();

            job.prepareJob(
                formData,
                this.selectedFileListings,
                this.allFiles,
                this.projectModel.get('uuid')
            );

            return this.startJob(job);
        },
        events: {
            'change #sequence-type': 'changeSequenceType',
            'change #domain-system': 'changeDomainSystem',
        },
        changeSequenceType: function(e) {
            e.preventDefault();

            $('#domain-system').removeAttr('disabled');

            if (e.currentTarget.value === 'TCR') {
                $('#domain-system').val('imgt');
                $('#domain-system').attr('disabled', 'disabled');
            }
        },
        changeDomainSystem: function(e) {
            e.preventDefault();

            $('#sequence-type').removeAttr('disabled');

            if (e.currentTarget.value === 'kabat') {
                $('#sequence-type').val('Ig');
                $('#sequence-type').attr('disabled', 'disabled');
            }
        },
        validateJobForm: function() {

            var validationError = false;

            if ($('#igblast-species').val() === '') {
                $('#igblast-species-group')
                    .addClass('has-error')
                    ;

                validationError = true;
            }

            if ($('#sequence-type').val() === '') {
                $('#igblast-sequence-group')
                    .addClass('has-error')
                    ;

                validationError = true;
            }

            if ($('#domain-system').val() === '') {
                $('#igblast-domain-group')
                    .addClass('has-error')
                    ;

                validationError = true;
            }

            return validationError;
        },
    });

    App.Views.Jobs = Jobs;
    return Jobs;
});
