define([
    'app',
    'handlebars',
    'backbone.syphon'
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

            var jobFormView;

            switch(parameters.jobType) {
                case 'igblast':
                    jobFormView = new Jobs.IgBlastForm();
                    break;

                case 'vdjpipe':
                    jobFormView = new Jobs.VdjPipeForm({selectedFileListings: this.selectedFileListings});
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

    Jobs.VdjPipeForm = Backbone.View.extend({
        template: 'jobs/vdjpipe-form',
        initialize: function() {
            //this.inputCounter = {};
            this.inputCounter = 0;
        },
        events: {
            'click .job-parameter': 'addJobParameter',
            'click .remove-job-parameter': 'removeJobParameter',
        },
        afterRender: function() {
            $('#vdj-pipe-configuration').sortable({
                axis: 'y',
                cursor: 'move',
                tolerance: 'pointer',
            });
        },
        addJobParameter: function(e) {
            e.preventDefault();

            var parameterType = e.target.dataset.parametertype;

            this.inputCounter = this.inputCounter + 1;
            var currentCount = this.inputCounter;

            var parameterView;

            switch(parameterType) {
                case 'composition-stats':

                    /*
                    parameterView = new Jobs.VdjPipeBaseCompositionStatistics({
                        parameterName: 'Base Composition Statistics',
                        parameterType: parameterType,
                        placeholderText: 'pre-',
                        inputLabel: 'Output Prefix',
                        inputCount: currentCount,
                    });
                    */
                    parameterView = new Jobs.VdjPipeTextImmutable({
                        parameterName: 'Base Composition Statistics',
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'quality-stats':

                    parameterView = new Jobs.VdjPipeTextImmutable({
                        parameterName: 'Read Quality Statistics',
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'nucleotide-filter':

                    parameterView = new Jobs.VdjPipeNucleotideFilter({
                        parameterType: parameterType,
                        placeholderText: 'AGCT',
                        inputCount: currentCount,
                    });

                    break;

                case 'length-filter':

                    parameterView = new Jobs.VdjPipeLengthFilter({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'homopolymer-filter':

                    parameterView = new Jobs.VdjPipeNumberMutable({
                        parameterName: 'Homopolymer Filter',
                        parameterType: parameterType,
                        inputLabel: 'Max',
                        inputCount: currentCount,
                    });

                    break;

                case 'minimal-quality-filter':

                    parameterView = new Jobs.VdjPipeNumberMutable({
                        parameterName: 'Minimal Quality Filter',
                        parameterType: parameterType,
                        inputLabel: '',
                        inputCount: currentCount,
                    });

                    break;

                case 'minimal-average-quality-filter':

                    parameterView = new Jobs.VdjPipeTextMutable({
                        parameterName: 'Minimal Average Quality Filter',
                        parameterType: parameterType,
                        placeholderText: '',
                        inputLabel: '',
                        inputCount: currentCount,
                    });

                    break;

                case 'minimal-quality-window-filter':

                    parameterView = new Jobs.VdjPipeMinimalQualityWindowFilter({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'average-quality-window-filter':

                    parameterView = new Jobs.VdjPipeAverageQualityWindowFilter({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'ambiguous-nucleotide-window-filter':

                    parameterView = new Jobs.VdjPipeAmbiguousNucleotideWindowFilter({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'histogram':

                    parameterView = new Jobs.VdjPipeTextMutable({
                        parameterName: 'Histogram',
                        parameterType: parameterType,
                        placeholderText: '',
                        inputLabel: 'Name',
                        inputCount: currentCount,
                    });

                    break;

                case 'find-unique-sequences':

                    parameterView = new Jobs.VdjPipeFindUniqueSequences({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'match-sequence-element':

                    parameterView = new Jobs.VdjPipeMatchSequenceElement({
                        parameterType: parameterType,
                        inputCount: currentCount,
                        files: this.selectedFileListings,
                    });

                    break;

                case 'match-external-molecular-identifier':

                    parameterView = new Jobs.VdjPipeMatchExternalMolecularIdentifier({
                        parameterType: parameterType,
                        inputCount: currentCount,
                        files: this.selectedFileListings,
                    });

                    break;

                case 'write-sequences':

                    parameterView = new Jobs.VdjPipeWriteSequences({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'write-values':

                    parameterView = new Jobs.VdjPipeWriteValues({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'find-sequences-from-multiple-groups':

                    parameterView = new Jobs.VdjPipeFindSequencesFromMultipleGroups({
                        parameterType: parameterType,
                        inputCount: currentCount,
                    });

                    break;

                case 'merge-paired-reads':

                    parameterView = new Jobs.VdjPipeNumberMutable({
                        parameterName: 'Merge Paired Reads',
                        parameterType: parameterType,
                        placeholderText: '',
                        inputLabel: 'Minimum Score',
                        inputCount: currentCount,
                    });

                    break;

                default:
                    // code
                    break;
            }

            this.insertView('#vdj-pipe-configuration', parameterView);
            parameterView.render();
        },
        removeJobParameter: function(e) {
            e.preventDefault();
            $(e.currentTarget).closest('.vdj-pipe-parameter').remove();
        },
    });
/*
    Jobs.VdjPipeBaseCompositionStatistics = Backbone.View.extend({
        template: 'jobs/vdjpipe-base-composition-statistics',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        }
    });
*/
    Jobs.VdjPipeNucleotideFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-nucleotide-filter',
        events: {
            'click #toggleCharacterLegend': 'toggleCharacterLegend'
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    placeholderText: this.placeholderText,
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
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
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

    Jobs.VdjPipeAmbiguousNucleotideWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-ambiguous-nucleotide-window-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        },
    });

    Jobs.VdjPipeAverageQualityWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-average-quality-window-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        },
    });

    Jobs.VdjPipeMinimalQualityWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-minimal-quality-window-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        },
    });

    Jobs.VdjPipeLengthFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-length-filter',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        },
    });

    Jobs.VdjPipeNumberMutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-number-mutable',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    inputLabel: this.inputLabel,
                };
            }
        },
    });

    Jobs.VdjPipeTextMutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-text-mutable',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    placeholderText: this.placeholderText,
                    inputLabel: this.inputLabel,
                };
            }
        },
    });

    Jobs.VdjPipeDropdown = Backbone.View.extend({
        template: 'jobs/vdjpipe-dropdown',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    files: this.selectedFileListings.toJSON(),
                };
            }
        },
    });

    Jobs.VdjPipeTextImmutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-text-immutable',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount
                };
            }
        },
    });

    Jobs.VdjPipeCheckbox = Backbone.View.extend({
        template: 'jobs/vdjpipe-checkbox',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount
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
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    files: this.files.toJSON(),
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
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    elementCount: this.elementCount,
                    //fileName: this.fileName,
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
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    objectCount: this.objectCount,
                    files: this.files.toJSON(),
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
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    files: this.files.toJSON(),
                };
            }
        },
    });

    Jobs.VdjPipeWriteSequences = Backbone.View.extend({
        template: 'jobs/vdjpipe-write-sequences',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        },
    });

    Jobs.VdjPipeWriteValues = Backbone.View.extend({
        template: 'jobs/vdjpipe-write-values',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        },
    });

    Jobs.VdjPipeFindSequencesFromMultipleGroups = Backbone.View.extend({
        template: 'jobs/vdjpipe-find-sequences-from-multiple-groups',
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        },
        events: {
            'click .find-sequences-from-multiple-groups-filter-button': 'changeFilterOptions',
        },
        changeFilterOptions: function(e) {
            e.preventDefault();

            // Hide all params
            $('.find-sequences-from-multiple-groups-filter-param').addClass('hidden');

            // Reset buttons to default state
            $('.find-sequences-from-multiple-groups-filter-button').removeClass('btn-success');
            $('.find-sequences-from-multiple-groups-filter-button').addClass('btn-default');

            // Highlight selected button
            $('#' + e.target.id).removeClass('btn-default');
            $('#' + e.target.id).addClass('btn-success');

            // Clear out other input values
            $('.find-sequences-from-multiple-groups-filter-param input').val('');

            if (e.target.id === 'find-sequences-from-multiple-groups-ignore-ends-button') {
                // Show Ignore Ends
                $('.find-sequences-from-multiple-groups-ignore-ends').removeClass('hidden');
            }
            else {
                // Show Fraction Match
                $('.find-sequences-from-multiple-groups-fraction-match').removeClass('hidden');
            }
        },
    });

    App.Views.Jobs = Jobs;
    return Jobs;
});
