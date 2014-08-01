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

            var that = this;

            this.workflows = new Backbone.Agave.Collection.Jobs.Workflows();
        },
        fetchNetworkData: function() {
            var deferred = $.Deferred();
            this.workflows
                .fetch()
                .done(function() {
                    console.log("fetch done");

                    deferred.resolve();
                });

            return deferred;
        },
        serialize: function() {

            console.log("serialize called. json is: " + JSON.stringify(this.workflows.toJSON()));

            return {
                selectedFileListings: this.selectedFileListings.toJSON(),
                workflows: this.workflows.toJSON(),
            };
        },
        afterRender: function() {
            $('#job-modal').modal('show');
        },
        events: {
            'change #select-workflow': 'showWorkflow',
            'click .remove-file-from-job': 'removeFileFromJob',
            'click #create-new-workflow': 'createWorkflow',
            'submit form': 'submitJob',
        },
        createWorkflow: function(e) {
            e.preventDefault();

            /*
            var view = new Jobs.WorkflowEditor();

            this.insertView('#workflow-editor', view);

            view.render();
            */

            this.trigger('setupCreateWorkflowView');
            console.log("view render ok");
        },
        showWorkflow: function(e) {
            e.preventDefault();

            // Do housekeeping first
            this.removeView('#workflow-staging-area');

            // Setup and insert new workflow views
            var workflowId = e.target.value;

            console.log("workflowId is: " + workflowId);

            var workflow = this.workflows.get(workflowId);

            //var defaultWorkflows = Jobs.GetWorkflowConfig();

            var workflowData = workflow.getWorkflowFromConfig();

            console.log("workflowData is: " + JSON.stringify(workflowData));

            var workflowViews = new Jobs.GenerateVdjPipeWorkflowViews(workflowData);

            /*
                I'd love to use insertViews instead, but as of 24/July/2014
                it seems to work on the parent layout instead of the view
                represented by |this|.

                This behavior might be a bug in layout manager, so the
                following loop is a workaround for now.
            */
            for (var i = 0; i < workflowViews.length; i++) {
                var view = workflowViews[i];

                view.isEditable = false;

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
        initialize: function(parameters) {
            $('.workflow-options-list').hide();

            this.counter = 0;
        },
        afterRender: function() {
            console.log("workflow modal show attempt");
            $('#workflow-modal').modal('show');

            $('#vdj-pipe-configuration').sortable({
                axis: 'y',
                cursor: 'move',
                tolerance: 'pointer',
            });
        },
        events: {
            'click #workflow-cancel': 'workflowCancel',
            'click #workflow-save': 'workflowSave',

            'click .workflow-options': 'setupWorkflowOptions',

            'click .job-parameter': 'addJobParameter',
            'click .remove-job-parameter': 'removeJobParameter',
        },
        addJobParameter: function(e) {
            e.preventDefault();

            var parameterType = e.target.dataset.parametertype;

            console.log("parameterType is: " + parameterType);

            this.counter = this.counter + 1;

            var vdjPipeView = Jobs.GetVdjPipeView(
                parameterType,
                this.counter,
                {}
            );

            vdjPipeView.isEditable = true;

            console.log("view is: " + vdjPipeView);

            if ($('#vdj-pipe-configuration-placeholder').length) {
                var that = this;
                $('#vdj-pipe-configuration-placeholder').addClass('animated flipOutX');
                $('#vdj-pipe-configuration-placeholder').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $("#vdj-pipe-configuration-placeholder").remove();
                    that.insertView('#vdj-pipe-configuration', vdjPipeView);
                    vdjPipeView.render();
                });
            }
            else {
                this.insertView('#vdj-pipe-configuration', vdjPipeView);
                vdjPipeView.render();
            }
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

            console.log("formData is: " + JSON.stringify(formData));
            console.log("serialized config is: " + JSON.stringify(serializedConfig));

            var jobWorkflow = new Backbone.Agave.Model.Job.Workflow();
            jobWorkflow.setConfigFromFormData(formData);

            console.log("test is: " + JSON.stringify(jobWorkflow.get('value')));

            var that = this;

            jobWorkflow
                .save()
                .done(function() {
                    that.trigger('setupJobSubmitView');
                })
                .fail(function() {
                    // troubleshoot
                    console.log("workflow save fail");
                });

        },
    });

    Jobs.GenerateVdjPipeWorkflowViews = function(config) {
        var parameters = config['single_read_pipe'];

        var workflowViews = [];

        for (var counter = 0; counter < parameters.length; counter++) {

            var key = Object.keys(parameters[counter])[0];
            var options = parameters[counter][key];
console.log("key is: " + key);
            var vdjPipeView = Jobs.GetVdjPipeView(
                key,
                counter,
                options
            );

            workflowViews.push(vdjPipeView);
        }

        return workflowViews;
    };

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

    Jobs.VdjPipeNucleotideFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-nucleotide-filter',
        events: {
            'click #toggleCharacterLegend': 'toggleCharacterLegend'
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
        toggleCharacterLegend: function() {
            if ($('#characterLegend').hasClass('hidden')) {
                $('#characterLegend').removeClass('hidden');
            }
            else {
                $('#characterLegend').addClass('hidden');
            }
        },
    });

    Jobs.VdjPipeFindUniqueSequences = Backbone.View.extend({
        template: 'jobs/vdjpipe-find-unique-sequences',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
        events: {
            'click .filter-button': 'changeFilterOptions',
        },
        changeFilterOptions: function(e) {
            e.preventDefault();

            // Hide all params
            $('.filter-param').addClass('hidden');

            // Reset buttons to default state
            $('.filter-button').removeClass('btn-success');
            $('.filter-button').addClass('btn-default');

            // Highlight selected button
            $('#' + e.target.id).removeClass('btn-default');
            $('#' + e.target.id).addClass('btn-success');

            // Clear out other input values
            $('.filter-param input').val('');

            if (e.target.id === 'ignore-ends-button') {
                // Show Ignore Ends
                $('.ignore-ends').removeClass('hidden');
            }
            else {
                // Show Fraction Match
                $('.fraction-match').removeClass('hidden');
            }
        },
    });

    Jobs.VdjPipeAmbiguousWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-ambiguous-nucleotide-window-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeAverageQualityWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-average-quality-window-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeMinimalQualityWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-minimal-quality-window-filter',
        initialize: function(parameters) {


        },
        serialize: function() {
            if (this.parameterType) {
/*
                var returnObject = {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
*/
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeMinAverageQualityFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-min-average-quality-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeLengthFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-length-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeNumberMutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-number-mutable',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    inputLabel: this.inputLabel,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeHistogram = Backbone.View.extend({
        template: 'jobs/vdjpipe-histogram',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeDropdown = Backbone.View.extend({
        template: 'jobs/vdjpipe-dropdown',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    files: this.selectedFileListings.toJSON(),
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeTextImmutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-text-immutable',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeMatchSequenceElement = Backbone.View.extend({
        template: 'jobs/vdjpipe-match-sequence-element',
        initialize: function() {
            this.elementCount = 0;
            this.objectCount  = 0;
        },
        serialize: function() {
            if (this.parameterType) {

                var files = {};

                if (this.files && this.files.toJSON()) {
                    files = this.files.toJSON();
                }

                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    files: files,
                    options: this.options,
                };
            }
        },
        events: {
            'click .add-element-button': 'addElement',
            'click .add-combination-object-button': 'addCombinationObject',
        },
        addElement: function(e) {
            e.preventDefault();

            //var fileName = $('.add-element-select').val();
            this.elementCount = this.elementCount + 1;

            var elementView = new Jobs.VdjPipeMatchSequenceElementConfig({
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                elementCount: this.elementCount,
                //fileName: fileName,
            });

            this.insertView('.added-element-subviews', elementView);
            elementView.render();
        },
        addCombinationObject: function(e) {
            e.preventDefault();

            this.objectCount = this.objectCount + 1;

            var combinationObjectView = new Jobs.VdjPipeMatchSequenceCombinationObjectConfig({
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                objectCount: this.objectCount,
                files: this.files,
            });

            this.insertView('.added-combination-object-subviews', combinationObjectView);
            combinationObjectView.render();
        },
    });

    Jobs.VdjPipeMatchSequenceElementConfig = Backbone.View.extend({
        template: 'jobs/vdjpipe-match-sequence-element-config',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    elementCount: this.elementCount,
                    //fileName: this.fileName,
                    options: this.options,
                };
            }
        },
        events: {
            'click .remove-match-sequence-element': 'removeElement',
        },
        removeElement: function(e){
            e.preventDefault();
            this.remove();
        },
    });

    Jobs.VdjPipeMatchSequenceCombinationObjectConfig = Backbone.View.extend({
        template: 'jobs/vdjpipe-match-sequence-combination-object-config',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    objectCount: this.objectCount,
                    files: this.files.toJSON(),
                    options: this.options,
                };
            }
        },
        events: {
            'click .remove-match-sequence-combination-object': 'removeCombinationObject',
        },
        removeCombinationObject: function(e){
            e.preventDefault();
            this.remove();
        },
    });

    Jobs.VdjPipeMatchExternalMolecularIdentifier = Backbone.View.extend({
        template: 'jobs/vdjpipe-match-external-molecular-identifier',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    files: this.files.toJSON(),
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeWriteSequence = Backbone.View.extend({
        template: 'jobs/vdjpipe-write-sequences',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeWriteValue = Backbone.View.extend({
        template: 'jobs/vdjpipe-write-values',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Jobs.VdjPipeFindSequencesFromMultipleGroups = Backbone.View.extend({
        template: 'jobs/vdjpipe-find-sequences-from-multiple-groups',
        afterRender: function() {
            this.updateUIForWorkflowOptions();
        },
        updateUIForWorkflowOptions: function() {
            if (this.options && this.options.fraction_match) {
                this.setFractionMatch();
                $('.' + this.parameterType + '-fraction-match input').val(this.options.fraction_match);
            }
            else if (this.options && this.options.ignore_ends) {
                this.setIgnoreEnds();
                $('.' + this.parameterType + '-ignore-ends input').val(this.options.ignore_ends);
            }
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
        events: function() {
            var events = {};
            events['click #' + this.parameterType + '-ignore-ends-button'] = 'setIgnoreEnds';
            events['click #' + this.parameterType + '-fraction-match-button'] = 'setFractionMatch';

            return events;
        },
        resetOptionalFormElementState: function() {
            // Hide all
            $('.' + this.parameterType + '-filter-param').addClass('hidden');

            // Clear out other input values
            $('.' + this.parameterType + '-filter-param input').val('');

            // Reset all button states
            $('.' + this.parameterType + '-filter-button').removeClass('btn-success');
            $('.' + this.parameterType + '-filter-button').addClass('btn-default');
        },
        setIgnoreEnds: function(e) {
            if (e) {
                e.preventDefault();
            }

            this.resetOptionalFormElementState();

            // Show this input
            $('.' + this.parameterType + '-ignore-ends').removeClass('hidden');

            // Highlight selected button
            $('#' + this.parameterType + '-ignore-ends-button').removeClass('btn-default');
            $('#' + this.parameterType + '-ignore-ends-button').addClass('btn-success');
        },
        setFractionMatch: function(e) {
            if (e) {
                e.preventDefault();
            }

            this.resetOptionalFormElementState();

            // Show this input
            $('.' + this.parameterType + '-fraction-match').removeClass('hidden');

            // Highlight selected button
            $('#' + this.parameterType + '-fraction-match-button').removeClass('btn-default');
            $('#' + this.parameterType + '-fraction-match-button').addClass('btn-success');
        },
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

    Jobs.GetVdjPipeView = function(key, counter, options) {

        var vdjPipeView;

        switch(key) {

            case 'ambiguous_window_filter':

                vdjPipeView = new Jobs.VdjPipeAmbiguousWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'average_quality_window_filter':
                vdjPipeView = new Jobs.VdjPipeAverageQualityWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'composition_stats':
                vdjPipeView = new Jobs.VdjPipeTextImmutable({
                    parameterName: 'Base Composition Statistics',
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'find_intersection':
                vdjPipeView = new Jobs.VdjPipeFindSequencesFromMultipleGroups({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'find_unique_sequences':
                vdjPipeView = new Jobs.VdjPipeFindUniqueSequences({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'histogram':
                vdjPipeView = new Jobs.VdjPipeHistogram({
                    parameterName: 'Histogram',
                    parameterType: key,
                    placeholderText: '',
                    inputLabel: 'Name',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'homopolymer_filter':
                vdjPipeView = new Jobs.VdjPipeNumberMutable({
                    parameterName: 'Homopolymer Filter',
                    parameterType: key,
                    inputLabel: 'Max',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'length_filter':
                vdjPipeView = new Jobs.VdjPipeLengthFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'match_external_molecular_identifier':
                vdjPipeView = new Jobs.VdjPipeMatchExternalMolecularIdentifier({
                    parameterType: key,
                    inputCount: counter,
                    files: this.selectedFileListings,
                    options: options,
                });

                break;

            case 'match':
                vdjPipeView = new Jobs.VdjPipeMatchSequenceElement({
                    parameterType: key,
                    inputCount: counter,
                    files: this.selectedFileListings,
                    options: options,
                });

                break;

            case 'merge_paired_reads':
                vdjPipeView = new Jobs.VdjPipeNumberMutable({
                    parameterName: 'Merge Paired Reads',
                    parameterType: key,
                    placeholderText: '',
                    inputLabel: 'Minimum Score',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'min_average_quality_filter':
                vdjPipeView = new Jobs.VdjPipeMinAverageQualityFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'min_quality_filter':
                vdjPipeView = new Jobs.VdjPipeNumberMutable({
                    parameterName: 'Minimal Quality Filter',
                    parameterType: key,
                    inputLabel: '',
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'min_quality_window_filter':
                vdjPipeView = new Jobs.VdjPipeMinimalQualityWindowFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'nucleotide_filter':
                vdjPipeView = new Jobs.VdjPipeNucleotideFilter({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'quality_stats':
                vdjPipeView = new Jobs.VdjPipeTextImmutable({
                    parameterName: 'Read Quality Statistics',
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'write_sequence':
                vdjPipeView = new Jobs.VdjPipeWriteSequence({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            case 'write_value':
                vdjPipeView = new Jobs.VdjPipeWriteValue({
                    parameterType: key,
                    inputCount: counter,
                    options: options,
                });

                break;

            default:
                break;
        }

        return vdjPipeView;
    };

    App.Views.Jobs = Jobs;
    return Jobs;
});
