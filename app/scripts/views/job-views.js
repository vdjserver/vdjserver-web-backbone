define([
    'app',
    'environment-config',
    'moment',
    'backbone.syphon',
    'vdjpipe-view-factory',
], function(App, EnvironmentConfig, moment) {

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
        },

        // Private Methods
        _generateJobName: function() {
            var datetime = moment().format('D-MMM-YYYY h:mm:ss a');

            return 'My Job ' + datetime;
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
                .fail(function() {
                    that._uiCancelJobLoadingView();
                });
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

            // Setup new loading view
            var loadingView = new App.Views.Util.Loading({
                displayText: 'Launching Job...',
                keep: true,
            });

            this.setView('#job-submit-loading-view', loadingView);
            loadingView.render();

            $('#job-submit-loading-view').addClass('alert alert-info');
            $('.job-form-item, .job-submit-button').attr('disabled', 'disabled');

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

    Jobs.WorkflowEditor = Backbone.View.extend(
        _.extend({}, WorkflowParametersMixin,
            {
                // Public Methods

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
                template: 'jobs/vdjpipe/vdjpipe-workflow-parameters',

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

                    if (!_.isEmpty(this.editableWorkflow)) {
                        this._setupEditableWorkflow(this.editableWorkflow);
                    }
                },

                /**
                 * DOM events
                 */
                events: {
                    'click #workflow-cancel': '_workflowCancel',
                    'click #workflow-save': '_workflowSave',

                    'click .workflow-options': '_toggleWorkflowOptionList',

                    'click .job-parameter': '_addJobParameter',
                    'click .remove-job-parameter': '_removeJobParameter',
                },

                // Private Methods

                /**
                 * Creates editable workflow views for the supplied workflow
                 * and inserts them into the DOM.
                 *
                 * @param {Workflow} editableWorkflow
                 */
                _setupEditableWorkflow: function(editableWorkflow) {

                    // Do custom view data serialization
                    this._customSerialize(editableWorkflow);

                    // Remove workflow placeholder from DOM
                    $('#vdj-pipe-configuration-placeholder').remove();

                    var workflowViews = new App.Utilities.VdjpipeViewFactory.GenerateVdjpipeWorkflowViews(
                        editableWorkflow.get('value').config
                    );

                    for (this.counter = 0; this.counter < workflowViews.length; this.counter++) {
                        var view = workflowViews[this.counter];

                        view.isOrderable = true;
                        view.isRemovable = true;
                        //view.files = this.selectedFileListings;

                        this.insertView('#vdj-pipe-configuration', view);
                        view.render();
                    }
                },

                /**
                 * Serialize data onto view template.
                 *
                 * @returns {array}
                 */
                _customSerialize: function(editableWorkflow) {

                    // Set name on DOM
                    $('#workflow-name').val(editableWorkflow.get('value').workflowName);

                    // Set read direction
                    if (editableWorkflow.get('value').config['steps']) {
                        $('#single-reads').attr('checked', 'checked');
                        $('#single-reads').closest('label').addClass('active');
                    }
                    /*
                    else if (editableWorkflow.get('value').config['paired_read_pipe']) {
                        $('#paired-reads').attr('checked', 'checked');
                        $('#paired-reads').closest('label').addClass('active');
                    }
                    */
                },

                /**
                 * Removes workflow config placeholder DOM element.
                 *
                 * @returns {Promise} deferred Promise that the placeholder was removed.
                 */
                _clearPlaceholder: function() {
                    var deferred = $.Deferred();

                    if ($('#vdj-pipe-configuration-placeholder').length) {

                        $('#vdj-pipe-configuration-placeholder')
                            .addClass('animated flipOutX')
                            .one('webkitAnimationEnd'
                                + ' mozAnimationEnd'
                                + ' MSAnimationEnd'
                                + ' oanimationend'
                                + ' animationend',
                                function() {
                                    $('#vdj-pipe-configuration-placeholder').remove();
                                    deferred.resolve();
                                }
                            )
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
                _displayFormErrors: function(formErrors) {

                    // Clear out old errors
                    $('.alert-danger').fadeOut(function() {
                        this.remove();
                    });

                    $('.form-group').removeClass('has-error');

                    // Display any new errors
                    if (_.isArray(formErrors)) {

                        // Scroll before showing error to show off the error fade in
                        document.getElementById('job-modal-label').scrollIntoView();

                        for (var i = 0; i < formErrors.length; i++) {
                            var message = formErrors[i].message;
                            var type = formErrors[i].type;

                            this.$el
                                .find('.modal-body')
                                .prepend(
                                    $('<div class="alert alert-danger">')
                                    .text(message)
                                    .fadeIn()
                                )
                            ;

                            $('#' + type + '-container').addClass('has-error');
                        }

                    }
                },

                /**
                 * Validates workflow names against the following rules:
                 *
                 * 1. Checks if the workflow matches a predefined workflow name.
                 * This is not allowed.
                 *
                 * 2. Checks if the current workflow name is a duplicate of an existing
                 * workflow name besides the one currently being edited.
                 *
                 * @returns {array|void} error An array that contains an error object.
                 */
                _validateWorkflowName: function(workflowName) {

                    if (this.workflows.checkIfPredefinedWorkflow(workflowName)) {
                        return [{
                            'message': 'Custom workflows cannot be named after predefined workflows.'
                                        + ' Please choose a different name.',
                            'type': 'workflow-name',
                        }];
                    }

                    if (
                        (_.isEmpty(this.editableWorkflow))
                            ||
                        (workflowName !== this.editableWorkflow.get('value').workflowName)
                    ) {

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
                _getFormErrors: function(formData) {
                    var jobWorkflow = new Backbone.Agave.Model.Job.Workflow();
                    jobWorkflow.setConfigFromFormData(formData);

                    var formWorkflowNameErrors = this._validateWorkflowName(formData['workflow-name']) || [];
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

                // Event Responders

                /**
                 * Adds a job parameter to the new workflow and displays it on
                 * the DOM.
                 *
                 * @param {event} e
                 */
                _addJobParameter: function(e) {
                    e.preventDefault();

                    var parameterType = e.target.dataset.parametertype;

                    this.counter = this.counter + 1;

                    var vdjPipeView = App.Utilities.VdjpipeViewFactory.GetVdjpipeView(
                        parameterType,
                        this.counter,
                        {}
                    );

                    vdjPipeView.isOrderable = true;
                    vdjPipeView.isRemovable = true;
                    vdjPipeView.loadDefaultOptions = true;

                    var that = this;

                    this._clearPlaceholder()
                        .done(function() {
                            that.insertView('#vdj-pipe-configuration', vdjPipeView);
                            vdjPipeView.render();
                        });
                },

                /**
                 * Shows a list for the selected workflow option type and hides
                 * all others.
                 *
                 * @param {event} e
                 */
                _toggleWorkflowOptionList: function(e) {
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
                _workflowCancel: function(e) {
                    e.preventDefault();
                    this.trigger(Jobs.WorkflowEditor.events.closeWorkflowEditorView);
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
                _workflowSave: function(e) {
                    e.preventDefault();

                    var formData = Backbone.Syphon.serialize(this);

                    var formErrors = this._getFormErrors(formData);

                    if (formErrors.length > 0) {
                        this._displayFormErrors(formErrors);
                    }
                    else {

                        var jobWorkflow;

                        // Adjust if we're updating an existing workflow instead of saving a new one
                        // Also make sure that we create a new workflow if we're editing a predefined one
                        if (!_.isEmpty(this.editableWorkflow) && !this.editableWorkflow.get('predefined')) {
                            jobWorkflow = this.editableWorkflow;
                        }
                        else {
                            jobWorkflow = new Backbone.Agave.Model.Job.Workflow();
                        }

                        jobWorkflow.setConfigFromFormData(formData);

                        var that = this;

                        jobWorkflow.save()
                            .done(function() {
                                that.trigger(Jobs.WorkflowEditor.events.closeWorkflowEditorView);
                            })
                            .fail(function(error) {
                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.set('error', JSON.stringify(error));
                                telemetry.set('method', 'Backbone.Agave.Model.Job.Workflow().save()');
                                telemetry.set('view', 'Jobs.WorkflowEditor');
                                telemetry.save();
                            })
                        ;
                    }
                },
            }
        ),
        /** Static members */
        {
            /**
             * Custom event enum
             */
            events: {
                closeWorkflowEditorView: 'closeWorkflowEditorEvent',
                openWorkflowEditorView:  'openWorkflowEditorEvent',
                openWorkflowCreateView:  'openWorkflowCreateEvent',
            },
        }
    );

    Jobs.StagingBase = Backbone.View.extend({
        fetchNetworkData: function() {
            var deferred = $.Deferred();

            deferred.resolve();

            return deferred;
        },
        startJob: function(jobModel) {

            var jobNotification = new Backbone.Agave.Model.Notification.Job();
            jobNotification.projectUuid = this.projectModel.get('uuid');

            // DEBUG
            if (EnvironmentConfig.debug.console) {
                if (jobModel.get('parameters') && jobModel.get('parameters').json) {

                    var tmpDebugJobModelLog = JSON.stringify(jobModel.get('parameters').json)
                                                .replace(/\\"/g, '"')
                                                 //.replace(/^"/, '\'')
                                                 //.replace(/"$/, '\'');
                                                ;

                    //tmpDebugJobModelLog = JSON.parse(tmpDebugJobModelLog);
                    console.log('jobModel is: ' + tmpDebugJobModelLog);
                }
            }

            if (EnvironmentConfig.debug.disableJobs) {
                return;
            }

            return jobModel.submitJob(this.projectModel.get('uuid'))
                .then(function() {
                    jobNotification.set('associatedUuid', jobModel.get('id'));
                    jobNotification.set('name', jobModel.get('name'));
                    return jobNotification.save();
                })
                .then(function() {

                    App.Instances.WebsocketManager.subscribeToEvent(jobNotification.get('associatedUuid'));

                    var listView = App.Layouts.sidebar.getView('.sidebar');
                    listView.addNotification(jobNotification);

                    return $('#job-modal').modal('hide').promise();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
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
            events: {
                'click .remove-job-parameter': '_removeJobEvent',
                'change #select-workflow': '_showWorkflow',
                'change .job-form-item': '_revealSaveWorkflow',
                'click #save-workflow': '_saveWorkflow',
                'click #create-workflow': '_createWorkflow',
                'click #edit-workflow':   '_editWorkflow',
                'click #delete-workflow': '_deleteWorkflow',
            },
            validateJobForm: function() {
                var validationError = false;

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
            _revealSaveWorkflow: function(e) {
                e.preventDefault();

                // Make sure that this isn't a predefined workflow
                // Only allow if not predefined

                var workflowId = $('#select-workflow').val();
                var workflow = this.workflows.get(workflowId);

                if (workflow && !this.workflows.checkIfPredefinedWorkflow(workflow.get('value').workflowName)) {
                    $('#save-workflow').removeClass('hidden');
                }
            },
            _hideSaveWorkflow: function() {
                var element = document.getElementById('save-workflow');
                element.classList.add('hidden');
            },
            _saveWorkflow: function(e) {
                e.preventDefault();

                var formData = Backbone.Syphon.serialize(this);

                var workflowId   = document.getElementById('select-workflow').value;
                var workflowName = document.getElementById('select-workflow').selectedOptions[0].dataset.name;

                formData['workflow-name'] = workflowName;

                var workflow = this.workflows.get(workflowId);
                workflow.setConfigFromFormData(formData);

                var that = this;
                workflow.save()
                    .done(function() {
                        that._hideSaveWorkflow();
                    })
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Model.Job.Workflow().save()');
                        telemetry.set('view', 'Jobs.VdjpipeStaging');
                        telemetry.save();
                    })
                    ;
            },
            _createWorkflow: function(e) {
                e.preventDefault();

                this.trigger(Jobs.WorkflowEditor.events.openWorkflowCreateView);
            },

            _editWorkflow: function(e) {
                e.preventDefault();

                var workflowId = $('#select-workflow').val();
                var workflow = this.workflows.get(workflowId);

                this.trigger(Jobs.WorkflowEditor.events.openWorkflowEditorView, workflow);
            },

            _deleteWorkflow: function(e) {
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
                            that._uiResetDeleteWorkflow();
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.set('error', JSON.stringify(error));
                            telemetry.set('method', 'Backbone.Agave.Model.Job.Workflow().destroy()');
                            telemetry.set('view', 'Jobs.VdjpipeStaging');
                            telemetry.save();
                        });
                }
            },

            _showWorkflow: function(e) {
                e.preventDefault();

                this._uiResetDeleteWorkflow();
                this._uiGuardDeleteIfPredefined();

                var that = this;

                // Do housekeeping first
                this.removeView('#workflow-staging-area');
                $('#workflow-staging-area').empty();

                // Hide save
                $('#save-workflow').addClass('hidden');

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

            // UI
            _uiResetDeleteWorkflow: function() {
                $('#delete-workflow')
                    .removeClass('btn-danger')
                    .addClass('btn-outline-danger')
                    .html('&nbsp;Delete')
                ;
            },

            _uiGuardDeleteIfPredefined: function() {

                // Make sure that this isn't a predefined workflow
                var workflowId = $('#select-workflow').val();
                var workflow = this.workflows.get(workflowId);

                // Disable if predefined
                if (workflow && this.workflows.checkIfPredefinedWorkflow(workflow.get('value').workflowName)) {
                    $('#delete-workflow').attr('disabled', 'disabled');
                    return;
                }
                else {
                    $('#delete-workflow').removeAttr('disabled');
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
