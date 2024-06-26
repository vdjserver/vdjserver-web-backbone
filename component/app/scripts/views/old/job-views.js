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
            //e.preventDefault();

            $(e.target)
                .closest('.job-parameter')
                .addClass('animated flipOutX')
            ;

            var deferred = $.Deferred();

            $(e.target)
                .closest('.job-parameter')
                .one(
                    'webkitAnimationEnd'
                    + ' mozAnimationEnd'
                    + ' MSAnimationEnd'
                    + ' oanimationend'
                    + ' animationend',

                    function() {

                        $(e.target)
                            .closest('.job-parameter')
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
            this.appSubview = parameters.appSubview;
        },
        serialize: function() {
            return {
                selectedFileListings: this.selectedFileListings.toJSON(),
                generatedJobName: this.generatedJobName,
                projectUuid: this.projectModel.get('uuid'),
                appName: this.appSubview.job.get('appName'),
                appId: this.appSubview.job.get('appId'),
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
            'click #submit-job': '_submitJobForm',
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

            var formData = Backbone.Syphon.serialize($('#job-form')[0]);

            var validationError = this._validateJobForm(formData);

            if (validationError) {
                return;
            }

            this.uiShowJobLoadingView();

            var jobSubview = this.getView('#job-staging-subview');

            jobSubview.stageJob(formData)
                .done(function() {
                })
                .fail(function(error) {
                    that._uiCancelJobLoadingView(error);
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

        _uiCancelJobLoadingView: function(error) {
            this.removeView('#job-submit-loading-view');

            $('#job-submit-loading-view').removeClass('alert alert-info');
            $('.job-form-item, .job-submit-button').removeAttr('disabled');

            $('#job-submit-loading-view').addClass('alert alert-danger');
            var msg = 'There was an error launching your job.<br/>';
            if (error) msg += error + '<br/>';
            msg += 'Please try again.';
            $('#job-submit-loading-view').append(msg);
        },
    });

    Jobs.Rename = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-rename',
        initialize: function(parameters) {
            this.job = parameters.job;
            this.jobMetadata = parameters.jobMetadata;
            this.parentView = parameters.parentView;

            // TODO: no jobMetadata so cannot be renamed

        },
        events: {
            'click #submit-rename': '_submitRenameForm',
        },
        serialize: function() {
            var jobData = this.job.toJSON();
            jobData.displayName = jobData.name;
            if (this.jobMetadata) {
                var value = this.jobMetadata.get('value');
                if (value.displayName) jobData.displayName = value.displayName;
            }

            return {
                job: jobData,
            };
        },
        afterRender: function() {
            $('#rename-modal').modal('show');
            $('#rename-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },
        _submitRenameForm: function(e) {
            e.preventDefault();

            var that = this;
            var name = $('#job-name').val();
            if (this.jobMetadata) {
                var value = this.jobMetadata.get('value');
                value.displayName = name;
                this.jobMetadata.set('value', value);
                this.jobMetadata.save(undefined, { url: this.jobMetadata.getSaveUrl() })
                    .always(function() {
                        $('#rename-modal')
                          .modal('hide')
                          .on('hidden.bs.modal', function() {
                              that.parentView.doneRenameJob();
                          })
                    })
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.setError(error);
                        telemetry.set('method', '_submitRenameForm()');
                        telemetry.set('view', 'Jobs.Rename');
                        telemetry.save();
                    })
                    ;
            }
        },
    });

    Jobs.History = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-history',
        initialize: function(parameters) {
            this.job = parameters.job;

            this.jobHistory = new Backbone.Agave.JobHistory({ jobUuid: this.job.get('id'), communityMode: App.Routers.communityMode });

            var that = this;
            this.jobHistory.fetch()
            .then(function() {
                //console.log(that.jobHistory.get('result'));
                that.render();
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', 'Backbone.Agave.JobHistory.fetch()');
                telemetry.set('view', 'Jobs.History');
                telemetry.save();
            })
            ;
        },
        serialize: function() {
            return {
                job: this.job.toJSON(),
                jobHistoryItems: this.jobHistory.get('result'),
            };
        },
        afterRender: function() {
            $('#job-modal').modal('show');
            $('#job-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },
    });

    Jobs.Info = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-info',
        initialize: function(parameters) {
            this.job = parameters.job;
        },
        serialize: function() {
            return {
                job: this.job.toJSON(),
                jobInfo: JSON.stringify(this.job, null, 2),
            };
        },
        afterRender: function() {
            $('#info-modal').modal('show');
            $('#info-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },
    });

    Jobs.Archive = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-archive',
        initialize: function(parameters) {
            this.job = parameters.job;
            this.jobMetadata = parameters.jobMetadata;
            this.parentView = parameters.parentView;
        },
        events: {
            'click #submit-archive': '_submitArchiveForm',
            'click #archive-exit': '_exitForm',
        },
        serialize: function() {
            return {
                job: this.job.toJSON(),
            };
        },
        afterRender: function() {
            $('#archive-modal').modal('show');
            $('#archive-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },

        _exitForm: function(e) {
            e.preventDefault();

            var that = this;
            $('#archive-modal').on('hidden.bs.modal', function(e) {
                // force reload of page
                Backbone.history.loadUrl(Backbone.history.fragment);
            });
        },

        _submitArchiveForm: function(e) {
            e.preventDefault();

            $('.archive-submit-button').addClass('disabled');

            var that = this;
            this.job.archiveJob()
                .then(function() {
                    that._uiDoneArchiveJobView();
                })
                .fail(function(error) {
                    if (error.responseText) that._uiDoneArchiveJobView(error.responseText);
                    else that._uiDoneArchiveJobView('Unknown server error.');

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', '_submitArchiveForm()');
                    telemetry.set('view', 'Jobs.Archive');
                    telemetry.save();
                })
                ;
        },

        _uiDoneArchiveJobView: function(error) {
            this.removeView('#archive-processing-view');

            $('#archive-processing-view').removeClass('alert alert-info');
            $('.archive-submit-button').addClass('hidden');
            $('#archive-exit').removeClass('hidden');

            if (error) {
                $('#archive-processing-view').addClass('alert alert-danger');
                var msg = 'There was an error archiving the job.<br/>';
                msg += error + '<br/>';
                $('#archive-processing-view').append(msg);
            } else {
                var message = new App.Models.MessageModel({
                    'body': 'Archive was successful!'
                });

                var alertView = new App.Views.Util.Alert({
                    options: {
                        type: 'success'
                    },
                    model: message
                });

                this.setView('#archive-processing-view', alertView);
                alertView.render();
            }
        },

    });

    Jobs.Unarchive = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-unarchive',
        initialize: function(parameters) {
            this.job = parameters.job;
            this.jobMetadata = parameters.jobMetadata;
            this.parentView = parameters.parentView;
        },
        events: {
            'click #submit-unarchive': '_submitUnarchiveForm',
            'click #unarchive-exit': '_exitForm',
        },
        serialize: function() {
            return {
                job: this.job.toJSON(),
            };
        },
        afterRender: function() {
            $('#unarchive-modal').modal('show');
            $('#unarchive-modal').on('shown.bs.modal', function() {
                $('#job-name').focus();
            });
        },

        _exitForm: function(e) {
            e.preventDefault();

            var that = this;
            $('#unarchive-modal').on('hidden.bs.modal', function(e) {
                // force reload of page
                Backbone.history.loadUrl(Backbone.history.fragment);
            });
        },

        _submitUnarchiveForm: function(e) {
            e.preventDefault();

            $('.unarchive-submit-button').addClass('disabled');

            var that = this;
            this.job.unarchiveJob()
                .then(function() {
                    that._uiDoneUnarchiveJobView();
                })
                .fail(function(error) {
                    if (error.responseText) that._uiDoneUnarchiveJobView(error.responseText);
                    else that._uiDoneUnarchiveJobView('Unknown server error.');

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', '_submitUnarchiveForm()');
                    telemetry.set('view', 'Jobs.Unarchive');
                    telemetry.save();
                })
                ;
        },

        _uiDoneUnarchiveJobView: function(error) {
            this.removeView('#unarchive-processing-view');

            $('#unarchive-processing-view').removeClass('alert alert-info');
            $('.unarchive-submit-button').addClass('hidden');
            $('#unarchive-exit').removeClass('hidden');

            if (error) {
                $('#unarchive-processing-view').addClass('alert alert-danger');
                var msg = 'There was an error unarchiving the job.<br/>';
                msg += error + '<br/>';
                $('#unarchive-processing-view').append(msg);
            } else {
                var message = new App.Models.MessageModel({
                    'body': 'Unarchive was successful!'
                });

                var alertView = new App.Views.Util.Alert({
                    options: {
                        type: 'success'
                    },
                    model: message
                });

                this.setView('#unarchive-processing-view', alertView);
                alertView.render();
            }
        },
    });

    Jobs.SelectedFiles = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-selected-files',
        initialize: function(parameters) {
        },
        serialize: function() {
            return {
                selectedFileListings: this.selectedFileListings.toJSON(),
            };
        },
        events: {
            'click .remove-file-from-job': '_removeFileFromJob',
        },

        // Private Methods
        _removeFileFromJob: function(e) {
            e.preventDefault();

            var uuid = e.target.id;

            // UI
            $('#' + uuid).parent().parent().parent().remove();

            // data collection
            this.selectedFileListings.remove(uuid);
        },

    });

    Jobs.SelectedMetadata = Backbone.View.extend({
        // Public Methods
        template: 'jobs/job-selected-metadata',
        initialize: function(parameters) {
            var that = this;

            this.hasMetadata = false;
            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('', loadingView);
            loadingView.render();

            this.hasJobs = false;
            this.workJobs = new Backbone.Agave.Collection.Jobs();
            this.workJobs.projectUuid = that.projectModel.get('uuid');

            this.jobListings = new Backbone.Agave.Collection.Jobs.Listings({projectUuid: that.projectModel.get('uuid')});
            this.archivedJobs = new Backbone.Agave.Collection.Jobs.Archived({projectUuid: that.projectModel.get('uuid')});

            this.workSamples = new Backbone.Agave.Collection.Metadata.NucleicAcidProcessing({projectUuid: this.projectModel.get('uuid')});
            this.workSamples.fetch()
            .then(function() {

                if (that.workSamples.length > 0) that.hasMetadata = true;

                return that.workJobs.fetch();
            })
            .then(function() {
                return that.jobListings.fetch();
            })
            .then(function() {
                that.jobListings.linkToJobs(that.workJobs);
                return that.archivedJobs.fetch();
            })
            .then(function() {
                that.workJobs.remove(that.archivedJobs.jobUuids());

                that.workJobs = that.workJobs.getFinishedVDJAssignmentJobs();

                if (that.workJobs.length > 0) that.hasJobs = true;

                loadingView.remove();
                that.render();
            })
            .fail(function(error) {
                var telemetry = new Backbone.Agave.Model.Telemetry();
                telemetry.setError(error);
                telemetry.set('method', 'Backbone.Agave.Collection.Metadata.Sample.fetch()');
                telemetry.set('view', 'Jobs.SelectedMetadata');
                telemetry.set('project', that.projectModel.get('uuid'));
                telemetry.save();
            })
            ;

        },
        serialize: function() {
            return {
                workSamples: this.workSamples.toJSON(),
                workJobs: this.workJobs.toJSON(),
                hasMetadata: this.hasMetadata,
                hasJobs: this.hasJobs,
            };
        },
        events: {
            //'change .workJobs': '_changeWorkJob',
        },

    });

    Jobs.StagingBase = Backbone.View.extend({
        startJob: function(jobModel) {

            var that = this;

            var systems = new Backbone.Agave.Collection.Systems();

            return systems.fetch()
                .then(function() {
                    jobModel.configureExecutionHost(systems);
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

                this.workflows = new Backbone.Agave.Collection.Jobs.VdjpipeWorkflows();
                this.workflowList = this.workflows.getWorkflows();
                this.hasPairedReads = this.selectedFileListings.hasPairedReads();

                this.job = new Backbone.Agave.Model.Job.VdjPipe();
            },
            serialize: function() {
                return {
                    selectedFileListings: this.selectedFileListings.toJSON(),
                    workflows: this.workflowList,
                    hasPairedReads: this.hasPairedReads,
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
            stageJob: function(generalFormData) {

                // Mix in general form data with single read form data
                var singleReadForm = Backbone.Syphon.serialize($('#vdjpipe-single-read-form')[0]);
                singleReadForm = _.extend(generalFormData, singleReadForm);

                // Mix in paired read form data
                if (this.hasPairedReads === true) {
                    var pairedReadForm = Backbone.Syphon.serialize($('#vdjpipe-paired-read-form')[0]);
                    _.extend(pairedReadForm, { 'paired_reads': true });

                    singleReadForm = _.extend(generalFormData, pairedReadForm);
                }

                //var job = new Backbone.Agave.Model.Job.VdjPipe();

                this.job.set('totalFileSize', this.selectedFileListings.getTotalFileSize());

                var selectedFileListings = _.extend({}, this.selectedFileListings);
                var allFiles = _.extend({}, this.allFiles);

                this.job.prepareJob(
                    singleReadForm,
                    selectedFileListings,
                    allFiles,
                    this.projectModel.get('uuid')
                );

                return this.startJob(this.job);
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

                    var workflow = this.workflows.workflowWithName(workflowId);

                    var workflowViews = new App.Utilities.VdjpipeViewFactory.GenerateVdjpipeWorkflowViews(
                        workflow['steps']
                    );

                    // Note: views will change places in the dom as they render asynchronously
                    // So we need to make sure that they're all inserted properly before calling render.

                    var workflowLayout = new Backbone.View();
                    this.insertView('#workflow-staging-area', workflowLayout);

                    for (var i = 0; i < workflowViews.length; i++) {
                        var view = workflowViews[i];
                        view.allFiles = this.allFiles;

                        if (typeof view.prepareFiles === 'function') {
                            view.prepareFiles();
                        }

                        workflowLayout.insertView(view);
                    }

                    if (this.hasPairedReads === true) {
                        this.removeView('#paired-read-workflow-staging-area');
                        $('#paired-read-workflow-staging-area').empty();

                        var pairedReadWorkflow = this.workflows.getMergePairedReadsConfig();
                        var pairedReadWorkflowViews = new App.Utilities.VdjpipeViewFactory.GenerateVdjpipeWorkflowViews(
                            pairedReadWorkflow['steps']
                        );

                        var pairedReadWorkflowLayout = new Backbone.View();
                        this.insertView('#paired-read-workflow-staging-area', pairedReadWorkflowLayout);

                        for (var i = 0; i < pairedReadWorkflowViews.length; i++) {
                            var pairedReadView = pairedReadWorkflowViews[i];

                            pairedReadView.isRemovable = false;
                            pairedReadView.isOrderable = false;
                            pairedReadView.files = this.selectedFileListings;
                            pairedReadView.allFiles = this.allFiles;
                            pairedReadView.layoutView = workflowLayout;

                            pairedReadView.prepareFiles();

                            pairedReadWorkflowLayout.insertView(pairedReadView);
                        }

                        pairedReadWorkflowLayout.render();
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

                    if (this.hasPairedReads === true) {
                        $('#paired-read-workflow-staging-area').append(
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
        initialize: function(parameters) {
            this.job = new Backbone.Agave.Model.Job.IgBlast();
        },
        stageJob: function(generalFormData) {

            var igblastForm = Backbone.Syphon.serialize($('#igblast-form')[0]);
            igblastForm = _.extend(generalFormData, igblastForm);

            //var job = new Backbone.Agave.Model.Job.IgBlast();

            this.job.set('totalFileSize', this.selectedFileListings.getTotalFileSize());

            this.job.prepareJob(
                igblastForm,
                this.selectedFileListings,
                this.allFiles,
                this.projectModel.get('uuid')
            );

            return this.startJob(this.job);
        },
        events: {
            'change #igblast-species': 'changeSpecies',
            'change #igblast-sequence-type': 'changeSequenceType',
            //'change #domain-system': 'changeDomainSystem',
        },
        changeSpecies: function(e) {
            e.preventDefault();

            if (e.currentTarget.value === '') {
                $('#igblast-strain').val('').change();
                $('#igblast-strain').prop('disabled', true);
                $('#igblast-sequence-type').val('').change();
                $('#igblast-sequence-type').prop('disabled', false);
            }
            if (e.currentTarget.value === 'human') {
                $('#igblast-strain').val('').change();
                $('#igblast-strain').prop('disabled', true);
                $('#igblast-sequence-type').val('').change();
                $('#igblast-sequence-type').prop('disabled', false);
            }
            if (e.currentTarget.value === 'mouse') {
                $('#igblast-strain').val('').change();
                $('#igblast-strain').prop('disabled', true);
                $('#igblast-sequence-type').val('').change();
                $('#igblast-sequence-type').prop('disabled', false);
            }
            if (e.currentTarget.value === 'macaque') {
                $('#igblast-strain').prop('disabled', false);
                $('#igblast-sequence-type').val('Ig').change();
                $('#igblast-sequence-type').prop('disabled', true);
            }
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

            if ($('#igblast-species').val() === 'macaque') {
                if ($('#igblast-strain').val() === '') {
                    $('#igblast-strain-group').addClass('has-error');

                    validationError = true;
                }
            }

            if ($('#igblast-sequence-type').val() === '') {
                $('#igblast-sequence-group')
                    .addClass('has-error')
                    ;

                validationError = true;
            }
/*
            if ($('#domain-system').val() === '') {
                $('#igblast-domain-group')
                    .addClass('has-error')
                    ;

                validationError = true;
            }
*/
            return validationError;
        },
    });

    Jobs.PrestoStaging = Jobs.StagingBase.extend(
        _.extend({}, WorkflowParametersMixin, {

            template: 'jobs/presto-staging',
            initialize: function(parameters) {
                this.workflows = new Backbone.Agave.Collection.Jobs.PrestoWorkflows();

                this.job = new Backbone.Agave.Model.Job.Presto();
            },
            stageJob: function(formData) {

                var prestoForm = Backbone.Syphon.serialize($('#presto-form')[0]);
                prestoForm = _.extend(formData, prestoForm);

                //var job = new Backbone.Agave.Model.Job.Presto();

                this.job.set('totalFileSize', this.selectedFileListings.getTotalFileSize());

                this.job.prepareJob(
                    prestoForm,
                    this.selectedFileListings,
                    this.allFiles,
                    this.projectModel.get('uuid')
                );

                return this.startJob(this.job);
            },
            events: {
                //'change #select-workflow': '_showWorkflow',
                'click .remove-job-parameter': '_removeJobEvent',
            },
            afterRender: function() {
                this._showWorkflow();
            },
            validateJobForm: function() {

                var validationError = false;

                // TODO: add form validation here

                return validationError;
            },
            // Private Methods
            _removeJobEvent: function(e) {
                e.preventDefault();

                var that = this;

                this._removeJobParameter(e)
                    .done(function() {
                        that._adjustModalHeight();
                    })
                    ;
            },
            _adjustModalHeight: function() {
                var modalHeight = $('.modal-dialog').innerHeight();
                $('.modal-backdrop').css({height: modalHeight + 100});
            },
            _showWorkflow: function(/*e*/) {
                //e.preventDefault();

                var that = this;

                // Do housekeeping first
                this.removeView('#workflow-staging-area');
                $('#workflow-staging-area').empty();

                // Setup and insert new workflow views
                //var workflowId = e.target.value;

                // Only continue if there's actually a workflow selected

                // TODO: replace this with selected workflow
                var workflow = this.workflows.getWorkflows()[0];

                var workflowViews = new App.Utilities.PrestoViewFactory.GenerateWorkflowViews(
                    workflow['steps']
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
                    view.allFiles = this.allFiles;

                    if (typeof view.prepareFiles === 'function') {
                        view.prepareFiles();
                    }

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
            },
        })
    );

    Jobs.RepCalcStaging = Jobs.StagingBase.extend(
        _.extend({}, WorkflowParametersMixin, {

            template: 'jobs/repcalc-staging',
            initialize: function(parameters) {
                this.workflows = new Backbone.Agave.Collection.Jobs.RepCalcWorkflows();

                this.job = new Backbone.Agave.Model.Job.RepCalc();
                //this.workflowNames = this.workflows.getWorkflowNames();
            },
            serialize: function() {
                return {
                    //workflows: this.workflowNames,
                };
            },
            stageJob: function(formData) {

                var repcalcForm = Backbone.Syphon.serialize($('#repcalc-form')[0]);
                repcalcForm = _.extend(formData, repcalcForm);

                // collect files from selected job
                this.collection = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: repcalcForm['job-selected']});

                this.jobProcessMetadata = new Backbone.Agave.Model.Job.ProcessMetadata({jobId: repcalcForm['job-selected']});

                var that = this;

                return this.collection.fetch()
                  .then(function() {
                      return that.jobProcessMetadata.fetch();
                  })
                  .then(function() {
                      // check for process metadata
                      that.processMetadata = that.jobProcessMetadata.get('value');

                      if (that.processMetadata.groups) {
                          // gather list of output files
                          var outputFiles = [];
                          var logFile = null;
                          for (var group in that.processMetadata.groups) {
                              for (var gtype in that.processMetadata.groups[group]) {
                                  if (that.processMetadata.groups[group][gtype].type == 'output')
                                      outputFiles.push(that.processMetadata.groups[group][gtype].files);
                                  if (that.processMetadata.groups[group][gtype].type == 'log')
                                      logFile = that.processMetadata.groups[group][gtype].files;
                              }
                          }

                          // get VDJML and summary files from output list
                          that.AIRRFiles = that.selectedFileListings.clone();
                          that.AIRRFiles.reset();
                          that.ChangeOFiles = that.selectedFileListings.clone();
                          that.ChangeOFiles.reset();
                          for (var i = 0; i < outputFiles.length; ++i) {
                              if (that.processMetadata.files[outputFiles[i]].airr) {
                                  that.AIRRFiles.add(that.collection.getFileByName(that.processMetadata.files[outputFiles[i]].airr.value));
                              }
                              if (that.processMetadata.files[outputFiles[i]]['airr-makedb']) {
                                  that.ChangeOFiles.add(that.collection.getFileByName(that.processMetadata.files[outputFiles[i]]['airr-makedb'].value));
                              }
                          }
                          var archiveOutput = that.selectedFileListings.clone();
                          archiveOutput.reset();
                          if (that.processMetadata.files[logFile].output_archive) {
                            archiveOutput.add(that.collection.getFileByName(that.processMetadata.files[logFile].output_archive.value));
                          }

                          //var job = new Backbone.Agave.Model.Job.RepCalc();

                          var fileSize = 0;
                          var zipfile = that.collection.getFileByName(repcalcForm['job-selected'] + '.zip');
                          if (zipfile) {
                            var value = zipfile.get('value');
                            fileSize += value['length'];
                          }
                          //fileSize += that.AIRRFiles.getTotalFileSize();
                          //fileSize += that.ChangeOFiles.getTotalFileSize();
                          that.job.set('totalFileSize', fileSize);

                          that.job.prepareJob(
                              repcalcForm,
                              that.AIRRFiles,
                              that.ChangeOFiles,
                              archiveOutput,
                              that.allFiles,
                              that.projectModel.get('uuid')
                          );

                          return that.startJob(that.job);
                      } else {
                          return $.Deferred().reject('Job is missing process metadata.');
                      }
                  })
            },
            events: {
                //'change #select-workflow': '_showWorkflow',
                'click .remove-job-parameter': '_removeJobEvent',
            },
            afterRender: function() {
                this._showWorkflow();
            },
            validateJobForm: function() {

                var validationError = false;

                // TODO: add form validation here

                return validationError;
            },
            // Private Methods
            _removeJobEvent: function(e) {
                e.preventDefault();

                var that = this;

                this._removeJobParameter(e)
                    .done(function() {
                        that._adjustModalHeight();
                    })
                    ;
            },
            _adjustModalHeight: function() {
                var modalHeight = $('.modal-dialog').innerHeight();
                $('.modal-backdrop').css({height: modalHeight + 100});
            },
            _showWorkflow: function(e) {
                //e.preventDefault();

                var that = this;

                // Do housekeeping first
                this.removeView('#workflow-staging-area');
                $('#workflow-staging-area').empty();

                // Setup and insert new workflow views
                //var workflowId = e.target.value;

                // Only continue if there's actually a workflow selected

                // TODO: replace this with selected workflow
                var workflow = this.workflows.getWorkflows()[0];
                //var workflow = this.workflows.workflowWithName(workflowId);

                var workflowViews = new App.Utilities.RepCalcViewFactory.GenerateWorkflowViews(
                    workflow['steps']
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
                    view.allFiles = this.allFiles;

                    if (typeof view.prepareFiles === 'function') {
                        view.prepareFiles();
                    }

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
            },
        })
    );

    App.Views.Jobs = Jobs;
    return Jobs;
});
