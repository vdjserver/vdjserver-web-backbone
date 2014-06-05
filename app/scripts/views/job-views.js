define(['app', 'backbone.syphon'], function(App) {

    'use strict';

    Handlebars.registerHelper('GetHumanReadableReadDirection', function(data /*, options*/) {
        return App.Views.HandlebarsHelpers.FileMetadataHelpers.GetHumanReadableReadDirection(data);
    });

    Handlebars.registerHelper('JobSuccessCheck', function(data, options) {
        if (data.status === 'FINISHED') {
            return options.fn(data);
        }

        return options.inverse(data);
    });

    Handlebars.registerHelper('FormatAgaveDate', function(data /*, options*/) {
                                                                                
        var formattedDate = moment(data/*, 'YYYY-MM-DDTHH:mm:ssZ'*/).format('D-MMM-YYYY hh:mm');
                                                                                
        return formattedDate;                                                 
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
                revert: true,
                tolerance: 'pointer'
            });
        },
        addJobParameter: function(e) {
            e.preventDefault();

            var parameterType = e.target.dataset.parametertype;
/*
            if (this.inputCounter[parameterType]) {
                this.inputCounter[parameterType] = this.inputCounter[parameterType] + 1;
            }
            else {
                this.inputCounter[parameterType] = 1;
            }
*/
            //var currentCount = this.inputCounter[parameterType];
            this.inputCounter = this.inputCounter + 1;
            var currentCount = this.inputCounter;

            var parameterView;

            switch(parameterType) {
                case 'composition-stats':

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
        }
    });

    Jobs.VdjPipeNucleotideFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-nucleotide-filter',
        initialize: function(parameters) {
        },
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
        initialize: function(parameters) {
        },
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
            console.log("target id is: " + e.target.id);

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
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        }
    });

    Jobs.VdjPipeAverageQualityWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-average-quality-window-filter',
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        }
    });

    Jobs.VdjPipeMinimalQualityWindowFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-minimal-quality-window-filter',
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        }
    });

    Jobs.VdjPipeLengthFilter = Backbone.View.extend({
        template: 'jobs/vdjpipe-length-filter',
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                };
            }
        }
    });

    Jobs.VdjPipeNumberMutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-number-mutable',
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    inputLabel: this.inputLabel,
                };
            }
        }
    });

    Jobs.VdjPipeTextMutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-text-mutable',
        initialize: function(parameters) {
        },
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
        }
    });

    Jobs.VdjPipeDropdown = Backbone.View.extend({
        template: 'jobs/vdjpipe-dropdown',
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    files: this.selectedFileListings.toJSON(),
                };
            }
        }
    });

    Jobs.VdjPipeTextImmutable = Backbone.View.extend({
        template: 'jobs/vdjpipe-text-immutable',
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount
                };
            }
        }
    });

    Jobs.VdjPipeCheckbox = Backbone.View.extend({
        template: 'jobs/vdjpipe-checkbox',
        initialize: function(parameters) {
        },
        serialize: function() {
            if (this.parameterType) {
                return {
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount
                };
            }
        }
    });

    Jobs.Notification = Backbone.View.extend({
        template: 'jobs/notification',
        initialize: function(parameters) {

            this.jobName = this.job.get('name');
            this.jobStatus = 'Queued';
            this.projectModel = parameters.projectModel;

            var that = this;
            this.job.createArchivePathDirectory(this.projectModel.get('uuid'))
                .then(function() {
                    return that.job.save();
                })
                .done(function() {

                    // Create metadata
                    that.job.createJobMetadata(that.projectModel.get('uuid'))
                        .done(function() {
                            console.log("job meta ok");
                        })
                        .fail(function() {
                            console.log("job meta fail");
                        });

                    console.log('job submit success');
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

            var jobUuids = new Backbone.Agave.Collection.JobListings({projectUuid: this.projectUuid});

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
            };
        },
    });


    App.Views.Jobs = Jobs;
    return Jobs;
});
