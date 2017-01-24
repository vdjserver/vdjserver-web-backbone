/* global ss */

define([
    'app',
    'handlebars',
    'handlebars-utilities',
    'moment',
    'd3',
    'nvd3',
    'box',
    'chance',
    'underscore.string',
    'highcharts',
    'datatables',
    'simple-statistics',
], function(
    App,
    Handlebars,
    HandlebarsUtilities,
    moment,
    d3,
    nv,
    box,
    Chance,
    _string,
    Highcharts
) {

    'use strict';

    Handlebars.registerHelper('IsJobFrozen', function(data, options) {

        if (data.status !== 'FINISHED') {
            var now = moment();

            var submitDate = moment(data['submitTime']);
            var cutoffTime = submitDate.add(1, 'd');

            if (cutoffTime.isBefore(now)) {
                return options.fn(data);
            }
        }

        return options.inverse(data);
    });

    Handlebars.registerHelper('JobSuccessCheck', function(data, options) {
        if (data.status === 'FINISHED') {
            return options.fn(data);
        }

        return options.inverse(data);
    });

    Handlebars.registerHelper('FileTypeHasChart', function(filename, options) {

        if (filename === undefined) {
            return options.inverse(this);
        }

        var hasChart = Backbone.Agave.Model.Job.Detail.getChartType(filename);

        if (hasChart) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }

    });

    Handlebars.registerHelper('FileTypeAvailableInProjectFileList', function(filename, options) {

        if (filename === undefined) {
            return options.inverse(this);
        }

        var fileNameSplit = filename.split('.');
        var fileExtension = fileNameSplit[fileNameSplit.length - 1];

        // Whitelisted files
        if (fileExtension === 'fasta' || fileExtension === 'fastq') {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('ChartButtonText', function(filename, options) {

        if (filename === undefined) {
            return options.inverse(this);
        }

        var chartType = Backbone.Agave.Model.Job.Detail.getChartType(filename);

        var chartText = '';

        switch (chartType) {
            case Backbone.Agave.Model.Job.Detail.CHART_TYPE_6:
                chartText = 'Show List';
                break;

            default:
                chartText = 'Show Chart';
                break;
        }

        return chartText;
    });

    var Analyses = {};
    Analyses.Charts = {};

    Analyses.OutputList = Backbone.View.extend({
        template: 'analyses/output-list',
        initialize: function(parameters) {

            this.jobs = new Backbone.Agave.Collection.Jobs();
            this.paginatedJobs = new Backbone.Agave.Collection.Jobs();
            this.jobs.projectUuid = this.projectUuid;

            this.projectModel = new Backbone.Agave.Model.Project({ uuid: this.projectUuid});

            this.jobListings = new Backbone.Agave.Collection.Jobs.Listings({projectUuid: this.projectUuid});
            this.archivedJobs = new Backbone.Agave.Collection.Jobs.Archived({projectUuid: this.projectUuid});
            this.showArchivedJobs = false;

            this.iteratorRange = 10;

            if (_.isNumber(this.paginationIndex) !== true) {
                this.paginationIndex = 1;
            }
            this.currentIterationIndex = this.paginationIndex;

            this.maxIteratorIndexes = 0;

            this.fetchJobs();
        },
        events: {
            'click .job-pagination-previous': 'jobPaginationPrevious',
            'click .job-pagination-next': 'jobPaginationNext',
            'click .job-pagination': 'jobPaginationIndex',
            'click .view-config': 'viewConfig',

            'click .rename-job': 'renameJob',
            'click .job-history': 'showJobHistory',
            'click .job-add-project-data': 'addJobOutputToProjectData',
            'click .job-remove-project-data': 'removeJobOutputFromProjectData',
            'click .archive-job': 'archiveJob',
            'click .unarchive-job': 'unarchiveJob',
        },
        serialize: function() {
            return {
                jobs: this.paginatedJobs.toJSON(),
                projectUuid: this.projectUuid,
                paginationSets: this.paginationSets,
            };
        },
        afterRender: function() {
            this.setupModalView();
        },

        fetchJobs: function() {
            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView(loadingView);
            loadingView.render();

            var that = this;

            var pendingJobs = new Backbone.Agave.Collection.Jobs.Pending();
            pendingJobs.projectUuid = this.projectUuid;


            $.when(this.jobs.fetch(), pendingJobs.fetch())
                // Add VDJ API pending jobs to Agave jobs
                .then(function() {
                    that.jobs.add(pendingJobs.toJSON());

                    return that.projectModel.fetch();
                })
                .then(function() {
                    var value = that.projectModel.get('value');
                    if (value.showArchivedJobs) that.showArchivedJobs = true;

                    return that.jobListings.fetch();
                })
                .then(function() {
                    // link jobs to their metadata record
                    that.jobListings.linkToJobs(that.jobs);

                    return that.archivedJobs.fetch();
                })
                .then(function() {
                    if (that.showArchivedJobs)
                        that.archivedJobs.linkToJobs(that.jobs);
                    else
                        that.jobs.remove(that.archivedJobs.jobUuids());

                    that.jobs.forEach(function(job) {
                        if (job.get('status') !== 'FINISHED' && job.get('status') !== 'FAILED') {
                            App.Instances.WebsocketManager.subscribeToEvent(job.get('id'));

                            that.listenTo(
                                App.Instances.WebsocketManager,
                                'jobStatusUpdate',
                                that._handleJobStatusUpdate
                            );
                        }
                    });
                })
                .then(function() {
                    that.calculateMaxIteratorIndexes();
                })
                .then(function() {
                    that.setPaginatedCollection();
                })
                .then(function() {
                    that.serializeIterationIndexes();
                })
                .then(function() {
                    // don't render if user has moved to a different view
                    if ((App.Routers.currentRouteView == 'projectJobHistory') && (App.Routers.currentProjectUuid == that.projectUuid)) {
                        loadingView.remove();
                        that.render();
                    }

                    that.uiSetActivePaginationSet();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Collection.Jobs.fetch()');
                    telemetry.set('view', 'Analyses.OutputList');
                    telemetry.save();
                })
                ;
        },
        _handleJobStatusUpdate: function(jobStatusUpdate) {

            $('#job-status-' + jobStatusUpdate.jobId).html(jobStatusUpdate.jobStatus);

            if (jobStatusUpdate.jobStatus === 'FINISHED') {
                this.render();
            }
        },

        calculateMaxIteratorIndexes: function() {
            this.maxIteratorIndexes = Math.ceil(this.jobs.models.length / this.iteratorRange);
        },

        setPaginatedCollection: function() {
            this.paginatedJobs = new Backbone.Agave.Collection.Jobs();

            var min = this.currentIterationIndex * this.iteratorRange - this.iteratorRange;

            this.paginatedJobs.add(
                this.jobs.slice(
                    this.currentIterationIndex * this.iteratorRange - this.iteratorRange,
                    Math.min(
                        this.currentIterationIndex * this.iteratorRange,
                        this.jobs.length
                    )
                )
            );
        },

        viewConfig: function(e) {
            e.preventDefault();

            var jobId = e.target.dataset.jobid;

            var job = this.jobs.get(jobId);

            var name = job.get('name');
            var config = job.get('parameters').json;

            var blob = new Blob([config], {type: 'text/plain;charset=utf-8'});
            saveAs(blob, name + '.json');
        },

        jobPaginationPrevious: function(e) {
            e.preventDefault();
            this.removeView('#project-job-history');

            if (this.currentIterationIndex - 1 >= 1) {
                this.currentIterationIndex -= 1;

                this.setPaginatedCollection();
                this.render();
                this.uiSetActivePaginationSet();

                App.router.navigate('project/' + this.projectUuid + '/jobs?index=' + this.currentIterationIndex, {
                    trigger: false,
                });
            }
        },

        jobPaginationNext: function(e) {
            e.preventDefault();
            this.removeView('#project-job-history');

            if (this.currentIterationIndex + 1 <= this.maxIteratorIndexes) {
                this.currentIterationIndex += 1;

                this.setPaginatedCollection();
                this.render();
                this.uiSetActivePaginationSet();

                App.router.navigate('project/' + this.projectUuid + '/jobs?index=' + this.currentIterationIndex, {
                    trigger: false,
                });
            }
        },

        jobPaginationIndex: function(e) {
            e.preventDefault();
            this.removeView('#project-job-history');

            this.currentIterationIndex = parseInt(e.target.dataset.id);

            this.setPaginatedCollection();
            this.render();
            this.uiSetActivePaginationSet();

            App.router.navigate('project/' + this.projectUuid + '/jobs?index=' + this.currentIterationIndex, {
                trigger: false,
            });
        },

        serializeIterationIndexes: function() {
            this.paginationSets = [];

            var counter = 1;
            for (var i = 0; i < this.jobs.length; i += this.iteratorRange) {
                this.paginationSets.push(counter);
                counter++;
            };
        },

        uiSetActivePaginationSet: function() {
            $('.job-pagination-wrapper').removeClass('active');
            $('.job-pagination-previous').removeClass('disabled');
            $('.job-pagination-next').removeClass('disabled');

            $('.job-pagination-wrapper-' + this.currentIterationIndex).addClass('active');

            if (this.currentIterationIndex === 1) {
                $('.job-pagination-previous').addClass('disabled');
            }

            if (this.currentIterationIndex === this.maxIteratorIndexes) {
                $('.job-pagination-next').addClass('disabled');
            }
        },

        renameJob: function(e) {
            e.preventDefault();

            var jobId = e.target.dataset.id;

            this.removeView('#project-job-rename');

            var job = this.jobs.get(jobId);
            var jobMetadata = job.get('metadataLink');
            if (jobMetadata) jobMetadata = this.jobListings.get(jobMetadata);

            var jobRenameView = new App.Views.Jobs.Rename({
                job: job,
                jobMetadata: jobMetadata,
                parentView: this
            });

            this.setView('#project-job-rename', jobRenameView);
            jobRenameView.render();
        },

        doneRenameJob: function() {
            this.removeView('#project-job-rename');

            // redo the links to get the new name
            this.jobListings.linkToJobs(this.jobs);
            if (this.showArchivedJobs) this.archivedJobs.linkToJobs(this.jobs);

            this.render();
        },

        showJobHistory: function(e) {
            e.preventDefault();

            var jobId = e.target.dataset.id;

            this.removeView('#project-job-history');

            var jobHistoryView = new App.Views.Jobs.History({
                job: this.jobs.get(jobId),
            });

            this.setView('#project-job-history', jobHistoryView);
        },

        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Job Output in Project Data',
                'body':   '<p>Please wait while modifying job output for project data...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },

        addJobOutputToProjectData: function(e) {
            e.preventDefault();

            var jobId = e.target.dataset.id;

            var that = this;

            $('#modal-message').modal('show')
              .on('shown.bs.modal', function() {

                // see if any are deleted
                var fileCollection = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: jobId});
                var jobProcessMetadata = new Backbone.Agave.Model.Job.ProcessMetadata({jobId: jobId});

                var that = this;
                fileCollection.fetch()
                .then(function() {
                    return jobProcessMetadata.fetch();
                })
                .then(function() {
                      var projectFiles = fileCollection.getProjectFileOutput(jobProcessMetadata);
                      var promises = [];

                      // Set up promises
                      projectFiles.map(function(outputFile) {
                          promises[promises.length] = function() {
                              var value = outputFile.get('value');
                              value.showInProjectData = true;
                              outputFile.set('value', value);
                              return outputFile.save();
                          }
                      });

                      // Execute promises
                      return promises.reduce(
                          function(previous, current) {
                              return previous.then(current);
                          },
                          $.Deferred().resolve()
                      )
                })
                .always(function() {
                    $('#modal-message')
                      .modal('hide');
                      //.on('hidden.bs.modal', function() {
                      //    that.render();
                      //})
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'addJobOutputToProjectData()');
                    telemetry.set('view', 'Analyses.OutputList');
                    telemetry.save();
                })
                ;
            })
        },

        removeJobOutputFromProjectData: function(e) {
            e.preventDefault();

            var jobId = e.target.dataset.id;

            var that = this;

            $('#modal-message').modal('show')
              .on('shown.bs.modal', function() {

                // see if any are deleted
                var fileCollection = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: jobId});

                var that = this;
                fileCollection.fetch()
                .then(function() {
                      var projectFiles = fileCollection.getShowInProjectData();
                      var promises = [];

                      // Set up promises
                      projectFiles.map(function(outputFile) {
                          promises[promises.length] = function() {
                              var value = outputFile.get('value');
                              value.showInProjectData = false;
                              outputFile.set('value', value);
                              return outputFile.save();
                          }
                      });

                      // Execute promises
                      return promises.reduce(
                          function(previous, current) {
                              return previous.then(current);
                          },
                          $.Deferred().resolve()
                      )
                })
                .always(function() {
                    $('#modal-message')
                      .modal('hide')
                      //.on('hidden.bs.modal', function() {
                      //    that.render();
                      //})
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'removeJobOutputFromProjectData()');
                    telemetry.set('view', 'Analyses.OutputList');
                    telemetry.save();
                })
                ;
            })
        },

        archiveJob: function(e) {
            e.preventDefault();

            var jobId = e.target.dataset.id;

            this.removeView('#project-job-archive');

            var job = this.jobs.get(jobId);
            var jobMetadata = job.get('metadataLink');
            if (jobMetadata) jobMetadata = this.jobListings.get(jobMetadata);

            var jobArchiveView = new App.Views.Jobs.Archive({
                job: job,
                jobMetadata: jobMetadata,
                parentView: this
            });

            this.setView('#project-job-archive', jobArchiveView);
            jobArchiveView.render();
        },

        doneArchiveJob: function() {
            // force reload of page
            Backbone.history.loadUrl('project/' + this.projectUuid + '/jobs');
        },

        unarchiveJob: function(e) {
            e.preventDefault();

            var jobId = e.target.dataset.id;

            this.removeView('#project-job-archive');

            var job = this.jobs.get(jobId);
            var jobMetadata = job.get('metadataLink');
            if (jobMetadata) jobMetadata = this.jobListings.get(jobMetadata);

            var jobUnarchiveView = new App.Views.Jobs.Unarchive({
                job: job,
                jobMetadata: jobMetadata,
                parentView: this
            });

            this.setView('#project-job-archive', jobUnarchiveView);
            jobUnarchiveView.render();
        },

        doneUnarchiveJob: function() {
            // force reload of page
            Backbone.history.loadUrl('project/' + this.projectUuid + '/jobs');
        },
    });

    Analyses.SelectAnalyses = Backbone.View.extend({
        template: 'analyses/select-analyses',
        initialize: function(parameters) {

            this.projectUuid = parameters.projectUuid;
            this.jobId = parameters.jobId;

            this.chartHeight = 360;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView(loadingView);
            loadingView.render();

            this.jobDetail = new Backbone.Agave.Model.Job.Detail({id: this.jobId});
            this.jobListing = new Backbone.Agave.Model.Job.Listing({jobId: this.jobId});

            this.collection = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: this.jobId});

            this.jobProcessMetadata = new Backbone.Agave.Model.Job.ProcessMetadata({jobId: this.jobId});
            this.validProcessMetadata = true;

            this.analysisCharts = [];
            this.chartViews = [];

            var that = this;

            this.jobDetail.fetch()
                .then(function() {
                    return that.jobListing.fetch();
                })
                .then(function() {
                    that.jobDetail.linkToJob(that.jobListing);

                    return that.collection.fetch();
                })
                .then(function() {
                    return that.jobProcessMetadata.fetch();
                })
                .then(function() {
                    for (var i = 0; i < that.collection.models.length; ++i) {
                        var m = that.collection.at(i);
                        var value = m.get('value');
                        var desc = that.jobProcessMetadata.getDescriptionForFilename(value.name);
                        if (desc) m.set('description', desc);
                    }
                })
                .then(function() {
                    var smFile = that.collection.getStudyMetadataFile();
                    if (smFile) return smFile.downloadFileToCache();
                    else return null;
                })
                .then(function(tmpFileData) {
                    if (!tmpFileData) return;
                    try {
                        that.studyMetadata = JSON.parse(tmpFileData);
                    } catch (error) {
                        // TODO
                    }
                })
                .done(function() {

                    // check for process metadata
                    that.processMetadata = that.jobProcessMetadata.get('value');
                    if (that.processMetadata.process) {
                        if (!that.processMetadata.process.version) that.validProcessMetadata = false;
                        else if (that.processMetadata.process.version < EnvironmentConfig.processMetadata.version) that.validProcessMetadata = false;

                        switch (that.processMetadata.process.appName) {
                            case('vdjPipe'):
                            case('presto'):
                                for (var group in that.processMetadata.groups) {
                                    console.log(group);
                                    var chart = new Analyses.Statistics({selectAnalyses: that, groupId: group});
                                    if (chart.isValid) {
                                        that.analysisCharts.push({ groupId: group });
                                        that.chartViews.push(chart);
                                        that.setView('#analysis-charts-'+group, chart);
                                    }
                                }
                                break;
                            case('igBlast'):
                                break;
                            case('RepCalc'):
                                var chart = new Analyses.RepertoireComparison({selectAnalyses: that});
                                if (chart.isValid) {
                                    that.analysisCharts.push({ groupId: 'repertoire-comparison' });
                                    that.chartViews.push(chart);
                                    that.setView('#analysis-charts-repertoire-comparison', chart);
                                }
                                break;

                        }
                    } else {
                        that.validProcessMetadata = false;
                        // only vdjpipe
                        var appId = that.jobDetail.get('appId');
                        if (appId.indexOf('vdj_pipe') >= 0) {
                            that.analysisCharts.push({ groupId: 'group0' });
                            var chart = new Analyses.Statistics({selectAnalyses: that});
                            if (chart.isValid) {
                                that.chartViews.push(chart);
                                that.setView('#analysis-charts-group0', chart);
                            }
                        }
                    }

                    // don't render if user has moved to a different view
                    if ((App.Routers.currentRouteView == 'projectJobOutput') && (App.Routers.currentProjectUuid == that.projectUuid)) {
                        loadingView.remove();
                        that.render();
                    }
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Collection.Jobs.OutputFiles().fetch()');
                    telemetry.set('view', 'Analyses.SelectAnalyses');
                    telemetry.save();
                })
                ;
        },
        serialize: function() {
            return {
                validProcessMetadata: this.validProcessMetadata,
                jobDetail: this.jobDetail.toJSON(),
                projectFiles: this.collection.getProjectFileOutput(this.jobProcessMetadata).toJSON(),
                //chartFiles: this.collection.getChartFileOutput().toJSON(),
                logFiles: this.collection.getLogFileOutput().toJSON(),
                analysisCharts: this.analysisCharts,

                //outputFiles: this.collection.toJSON(),
                canDownloadFiles: this.canDownloadFiles,
                projectUuid: this.projectUuid,
            };
        },
        events: {
            'click .show-log': 'showLog',
            'click .hide-log': 'hideLog',

            'click .download-file': 'downloadFile',

            'click .switch-project-data': 'switchProjectData',

            'click .toggle-legend-btn': 'toggleLegend',
        },

        hideLog: function(e){
            e.preventDefault();

            $(e.target).next('.show-log').removeClass('hidden');
            $(e.target).addClass('hidden');

            var elOffset = $( e.target ).offset().top;
            var elHeight = $( e.target ).height();
            var windowHeight = $(window).height();
            var offset;

            if (elHeight < windowHeight) {
              offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
            } else {
              offset = elOffset;
            }

            $('html, body').animate({scrollTop: offset}, 1000);

            $(e.target.closest('tr')).next().hide(1500, function(){
              $(e.target.closest('tr')).next().remove();
            });
        },

        showLog: function(e) {
            e.preventDefault();

            this._uiBeginDataLoading(e.target);

            var uuid = e.target.dataset.id;

            var fileHandle = this.collection.get(uuid);
            var value = fileHandle.get('value');

            var classSelector = chance.string({
                pool: 'abcdefghijklmnopqrstuvwxyz',
                length: 15,
            });

            var htmlCode;
            if (value.name.substr(-5) === '.json') {
                htmlCode = '<tr id="chart-tr-' + classSelector  + '" style="height: 0px;">'
                    + '<td colspan=3>'
                    + '<pre>'
                        + '<div id="' + classSelector + '" class="text-left ' + classSelector + '" style="word-break: break-all;">'
                        + '</div>'
                    + '</pre>'
                    + '</td>'
                + '</tr>'
            } else {
                htmlCode = '<tr id="chart-tr-' + classSelector  + '" style="height: 0px;">'
                    + '<td colspan=3>'
                        + '<div id="' + classSelector + '" class="text-left ' + classSelector + '" style="word-break: break-all;">'
                        + '</div>'
                    + '</td>'
                + '</tr>'
            }

            $(e.target.closest('tr')).after(htmlCode);

            $(e.target).addClass('hidden');
            $(e.target).prev('.hide-log').removeClass('hidden');

            var that = this;

            var fileData;

            fileHandle.downloadFileToCache()
                .then(function(tmpFileData) {
                    tmpFileData = tmpFileData.replace(/\n/g, '<br>');

                    fileData = tmpFileData;
                })
                .then(function() {
                    return $('#chart-tr-' + classSelector).animate({
                        height: '200px',
                    }, 500).promise();
                })
                .done(function() {

                    that._uiEndDataLoading();

                    $('#' + classSelector).html(fileData);

                    // Scroll down to chart
                    $('html, body').animate({
                        scrollTop: $('.' + classSelector).offset().top
                    }, 1000);
                })
                .fail(function(response) {
                    var errorMessage = that.getErrorMessageFromResponse(response);

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(errorMessage);
                    telemetry.set('method', 'Backbone.Agave.Collection.Jobs.OutputFiles().save()');
                    telemetry.set('view', 'Analyses.SelectAnalyses');
                    telemetry.set('jobId', that.jobId);
                    telemetry.save();

                    that.showWarning(errorMessage);
                })
                ;
        },

        downloadFile: function(e) {
            e.preventDefault();

            var uuid = e.target.dataset.filename;
            var outputFile = this.collection.get(uuid);

            outputFile.downloadFileToDisk()
                .fail(function(error) {
                      var telemetry = new Backbone.Agave.Model.Telemetry();
                      telemetry.setError(error);
                      telemetry.set('method', 'Backbone.Agave.Model.Job.OutputFile.downloadFileToDisk()');
                      telemetry.set('view', 'Analyses.SelectAnalyses');
                      telemetry.save();
                  })
                  ;
        },

        switchProjectData: function(e) {
            e.preventDefault();

            var uuid = e.target.dataset.filename;
            var outputFile = this.collection.get(uuid);

            var value = outputFile.get('value');
            if (value.showInProjectData) value.showInProjectData = false;
            else value.showInProjectData = true;
            outputFile.set('value', value);

            var that = this;
            outputFile.save()
                .then(function() {
                    that.render();
                })
                .fail(function(error) {
                      var telemetry = new Backbone.Agave.Model.Telemetry();
                      telemetry.setError(error);
                      telemetry.set('method', 'Backbone.Agave.Model.Job.OutputFile.save()');
                      telemetry.set('view', 'Analyses.SelectAnalyses.switchProjectData');
                      telemetry.save();
                  })
                  ;
        },

        getErrorMessageFromResponse: function(response) {
            var txt;

            if (response && response.responseText) {
                txt = JSON.parse(response.responseText);
            }

            return txt;
        },
        showWarning: function(messageFragment) {
            var message = 'An error occurred.';

            if (messageFragment) {
                message = message + ' ' + messageFragment.message;
            }

            $('.chart-warning').text(message);
            $('.chart-warning').show();
        },
        showError: function(errorMessage) {
            var message = 'An error occurred.';

            if (errorMessage) {
                message = message + ' ' + errorMessage;
            }

            $('.chart-warning').text(message);
            $('.chart-warning').show();
        },
        hideWarning: function() {
            $('.chart-warning').hide();
        },

        // private methods
        _uiBeginDataLoading: function(selector) {
            // loading view
            $(selector).after('<div class="data-loading-view"></div>');

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('.data-loading-view', loadingView);
            loadingView.render();
        },
        _uiEndDataLoading: function() {
            // Remove loading view
            $('.data-loading-view').remove();
        },
    });

    Analyses.Statistics = Backbone.View.extend({
        template: 'analyses/statistics-charts',
        initialize: function(parameters) {

            // access data from superview instead of reloading
            this.selectAnalyses = parameters.selectAnalyses;
            this.groupId = parameters.groupId;

            this.chartHeight = 360;
            this.isComparison = true;
            this.isValid = false;

            if (this.groupId) {
              // we are using process metadata
              var pm = this.selectAnalyses.processMetadata;
              for (var key in pm.groups[this.groupId]) {
                  if ((key == 'stats') && (pm.groups[this.groupId][key]['type'] == 'statistics')) {
                      this.isValid = true;
                      this.isComparison = false;
                      var fileKey = pm.groups[this.groupId][key]['files'];
                      var filename = pm.files[fileKey]['composition']['value'];
                      var fileHandle = this.selectAnalyses.collection.getFileByName(filename);
                      if (!fileHandle) this.isValid = false;
                  }
                  if ((key == 'pre')  && (pm.groups[this.groupId][key]['type'] == 'statistics')) {
                      this.isValid = true;
                      this.isComparison = true;
                      var fileKey = pm.groups[this.groupId][key]['files'];
                      var filename = pm.files[fileKey]['composition']['value'];
                      var fileHandle = this.selectAnalyses.collection.getFileByName(filename);
                      if (!fileHandle) this.isValid = false;
                  }
              }
            } else {
                // hard-coded filenames
                this.isValid = true;
                var fileHandle = this.selectAnalyses.collection.getFileByName('stats_composition.csv');
                if (fileHandle) this.isComparison = false;
                fileHandle = this.selectAnalyses.collection.getFileByName('pre-filter_composition.csv');

                if (this.isComparison && !fileHandle) this.isValid = false;
            }

            if (this.isValid) {
                this.chartFiles = [
                    { id: 'composition', name: 'Nucleotide Composition' },
                    { id: 'gc_hist', name: 'GC% Histogram' },
                    //{ id: 'heat_map', name: 'Heatmap' },
                    { id: 'len_hist', name: 'Sequence Length Histogram' },
                    { id: 'mean_q_hist', name: 'Mean Quality Histogram' },
                    { id: 'qstats', name: 'Quality Scores' },
                ]

                this.render();
            }
        },
        serialize: function() {
            return {
                chartFiles: this.chartFiles,
                //canDownloadFiles: this.canDownloadFiles,
                //projectUuid: this.projectUuid,
            };
        },
        events: {
            'click .show-chart': 'showChart',
            'click .hide-chart': 'hideChart',

            'click .download-chart': 'downloadChart',
            'click .download-data': 'downloadData',

            'click .toggle-legend-btn': 'toggleLegend',
        },

        hideChart: function(e) {
            e.preventDefault();
            $(e.target).parent().prev('#show-chart').removeClass('hidden');
            $(e.target).closest('#hide-chart').addClass('hidden');

            var elOffset = $( e.target ).offset().top;
            var elHeight = $( e.target ).height();
            var windowHeight = $(window).height();
            var offset;

            if (elHeight < windowHeight) {
              offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
            } else {
              offset = elOffset;
            }

            $('html, body').animate({scrollTop: offset}, 1000);

            $(e.target.closest('tr')).next().hide(1500, function(){
              $(e.target.closest('tr')).next().remove();
            });
        },

        showChart: function(e) {
            e.preventDefault();

            this._uiBeginChartLoading(e.target);

            var chartId = e.target.dataset.id;

            // need more space for comparison chart
            if (chartId == 'qstats' && this.isComparison) this.chartHeight = 720;
            else this.chartHeight = 360;

            var classSelector = chance.string({
                pool: 'abcdefghijklmnopqrstuvwxyz',
                length: 15,
            });

            // remove if it exists
            if ($(e.target.closest('tr')).next().is('tr[id^="chart-tr-"]')) {
              $(e.target.closest('tr')).next().remove();
            }

            $(e.target.closest('tr')).after(
                '<tr id="chart-tr-' + classSelector  + '" style="height: 0px;">'
                    + '<td colspan=3>'
                        + '<div id="' + classSelector + '" class="svg-container ' + classSelector + '">'
                            + '<svg style="height: 0px;" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
                        + '</div>'
                        + '<div class="' + classSelector + '-d3-tip d3-tip hidden"></div>'
                    + '</td>'
                + '</tr>'
            );

            $(e.target).addClass('hidden');
            $(e.target).nextAll('#hide-chart').removeClass('hidden');

            // Enable download button
            $(e.target).nextAll('#hide-chart').children('.download-chart').attr('data-chart-class-selector', classSelector);

            // Clean up any charts that are currently displayed
            this.selectAnalyses.hideWarning();
            $('#chart-legend').hide();

            var that = this;
            var chartData;
            this._loadChartData(this._chartFilenames(chartId))
            .then(function(tmpChartData) {
                chartData = tmpChartData;
            })
            .then(function() {
                return $('#chart-tr-' + classSelector).animate({
                    // Unfortunately, this '30' is a bit of a magic number.
                    // It helps create enough spacer for horizontal scroll
                    // bars on the qstats chart not to overlay on other
                    // chart buttons.
                    height: (that.chartHeight + 30) + 'px',
                }, 500).promise();
            })
            .then(function() {
                $('.' + classSelector + ' svg').css('height', that.chartHeight);
            })
            .done(function() {

                that._uiEndChartLoading();

                var fileHandle;
                var fileData;
                if (that.isComparison) fileData = chartData.pre;
                else fileData = chartData.stats;

                switch (chartId) {
                    case 'composition':
                        $('#chart-legend').show();
                        Analyses.Charts.Composition(that.isComparison, chartData, classSelector);
                        break;

                    case 'gc_hist':
                        $('#chart-legend').show();
                        Analyses.Charts.PercentageGcHistogram(that.isComparison, chartData, classSelector);
                        break;

                    case 'heat_map':
                        break;

                    case 'len_hist':
                        $('#chart-legend').show();
                        Analyses.Charts.LengthHistogram(that.isComparison, chartData, classSelector);
                        break;

                    case 'mean_q_hist':
                        Analyses.Charts.MeanQualityScoreHistogram(that.isComparison, chartData, classSelector);
                        break;

                    case 'qstats':
                        Analyses.Charts.QualityScore(that.isComparison, chartData, classSelector, that.chartHeight);
                        break;

                    default:
                        break;
                }

                // Scroll down to chart
                $('html, body').animate({
                    scrollTop: $('.' + classSelector).offset().top
                }, 1000);
            })
            .fail(function(errorMessage) {
                //var errorMessage = this.getErrorMessageFromResponse(response);
                that.selectAnalyses.showError(errorMessage);
            })
            ;
        },

        downloadChart: function(e) {

            var that = this;

            var chartClassSelector = e.target.dataset.chartClassSelector;

            var filename = e.target.dataset.id;
            //filename = filename.split('.');
            //filename.pop();
            //filename = filename.join('.');

            var cssUrl = location.protocol + '//' + location.host + '/styles/charts.css';

            $.get(cssUrl)
                .done(function(cssText) {

                    var widthPx = $('#' + chartClassSelector + ' svg').css('width');

                    /*
                        Grabbing all content specifically from the svg
                        element ensures that we won't pick up any other
                        random elements that are also children of
                        |classSelector|.
                    */
                    var svgString = '<?xml-stylesheet type="text/css" href="data:text/css;charset=utf-8;base64,' + btoa(cssText) + '" ?>'
                                  + '\n'
                                  + '<svg '
                                        + ' style="height: ' + that.chartHeight + 'px; width:' + widthPx + ';"'
                                        + ' version="1.1"'
                                        + ' xmlns="http://www.w3.org/2000/svg"'
                                        + ' class="box"'
                                  + '>'
                                        + $('.' + chartClassSelector + ' svg').html()
                                  + '</svg>'
                                  ;

                    if (typeof safari !== 'undefined') {
                        window.open("data:image/svg+xml," + encodeURIComponent(svgString));
                    } else {
                        var blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
                        saveAs(blob, filename + '.svg');
                    }
                })
                ;
        },

        downloadData: function(e) {
            e.preventDefault();

            var chartId = e.target.dataset.id;

            this._doDownloadData(this._chartFilenames(chartId))
                .fail(function(error) {
                      var telemetry = new Backbone.Agave.Model.Telemetry();
                      telemetry.setError(error);
                      telemetry.set('method', 'downloadData()');
                      telemetry.set('view', 'Analyses.Statistics');
                      telemetry.save();
                  })
                  ;
        },

        _doDownloadData: function(files) {
            var that = this;
            if (this.isComparison) {
                var fileList = [];
                var filename = files.pre;
                var fileHandle = this.selectAnalyses.collection.getFileByName(filename);
                fileList.push(fileHandle);

                filename = files.post;
                fileHandle = that.selectAnalyses.collection.getFileByName(filename);
                fileList.push(fileHandle);

                return fileHandle.downloadFileListToDisk(fileList);
            } else {
                var filename = files.stats;
                var fileHandle = this.selectAnalyses.collection.getFileByName(filename);

                return fileHandle.downloadFileToDisk()
            }
        },

        // private methods
        _uiBeginChartLoading: function(selector) {
            // Disable other buttons
            $('.show-chart').prop('disabled', true);

            $(selector).after('<div class="chart-loading-view"></div>');

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('.chart-loading-view', loadingView);
            loadingView.render();
        },
        _uiEndChartLoading: function() {

            // Restore buttons
            $('.show-chart').prop('disabled', false);

            // Remove loading view
            $('.chart-loading-view').remove();
        },
        _chartFilenames: function(chartId) {
            var filenames;
            if (this.groupId) {
                var pm = this.selectAnalyses.processMetadata;
                if (this.isComparison) {
                    var fileKey = pm.groups[this.groupId]['pre']['files'];
                    var preName = pm.files[fileKey][chartId]['value'];
                    fileKey = pm.groups[this.groupId]['post']['files'];
                    var postName = pm.files[fileKey][chartId]['value'];
                    filenames = { pre: preName, post: postName };
                } else {
                    var fileKey = pm.groups[this.groupId]['stats']['files'];
                    var statsName = pm.files[fileKey][chartId]['value'];
                    filenames = { stats: statsName };
                }
            } else {
                // hard-coded files
                if (this.isComparison) filenames = { pre: 'pre-filter_' + chartId + '.csv', post: 'post-filter_' + chartId + '.csv'};
                else filenames = { stats: 'stats_' + chartId + '.csv' };
            }
            return filenames;
        },
        _loadChartData: function(files) {
            var that = this;
            if (this.isComparison) {
                var filename = files.pre;
                var fileHandle = this.selectAnalyses.collection.getFileByName(filename);
                if (!fileHandle) return $.Deferred().reject('Project is missing statistics file: ' + filename);

                return fileHandle.downloadFileToCache()
                .then(function(preFileData) {
                    var filename = files.post;
                    var fileHandle = that.selectAnalyses.collection.getFileByName(filename);

                    return fileHandle.downloadFileToCache()
                    .then(function(postFileData) {
                        return { pre: preFileData, post: postFileData };
                    })
                })
            } else {
                var filename = files.stats;
                var fileHandle = this.selectAnalyses.collection.getFileByName(filename);

                var chartType = Backbone.Agave.Model.Job.Detail.getChartType(filename);

                return fileHandle.downloadFileToCache()
                .then(function(tmpFileData) {
                    return { stats: tmpFileData };
                })
            }
        }
    });

    Analyses.RepertoireComparison = Backbone.View.extend({
        template: 'analyses/repertoire-comparison-charts',
        initialize: function(parameters) {

            // access data from superview instead of reloading
            this.selectAnalyses = parameters.selectAnalyses;

            this.chartHeight = 360;
            this.isValid = false;

            // we require process metadata
            var pm = this.selectAnalyses.processMetadata;
            if (!pm) return;

            // should have study metadata
            var sm = this.selectAnalyses.studyMetadata;

            this.fileList = [];
            this.sampleList = [];
            this.sampleGroupList = [];
            var geneSegmentChart = false;
            var CDR3Histogram = false;
            var clonalAbundance = false;
            var diversityCurve = false;
            var selectionPressure = false;
            for (var group in pm.groups) {
                if (pm.groups[group]['gene_segment_usage']) geneSegmentChart = true;
                if (pm.groups[group]['cdr3_length']) CDR3Histogram = true;
                if (pm.groups[group]['clonal_abundance']) clonalAbundance = true;
                if (pm.groups[group]['diversity_curve']) diversityCurve = true;
                if (pm.groups[group]['selection_pressure']) selectionPressure = true;

                if (pm.groups[group]['type'] == 'file') {
                    var name = null;
                    if (sm) {
                        for (var i = 0; i < pm.groups[group]['files'].length; ++i) {
                            var key = pm.groups[group]['files'][i];
                            var fileKey = pm['files'][key]['vdjml']['value'];
                            name = sm['fileMetadata'][fileKey]['value']['name'];
                        }
                    }
                    if (!name) name = group;
                    this.fileList.push({ id: group, name: name});
                }
                if (pm.groups[group]['type'] == 'sample') {
                    var name = null;
                    if (sm) {
                        for (var sampleKey in pm.groups[group]['samples']) {
                            var sample = sm['samples'][sampleKey];
                            name = sample.value['Name'];
                            if (!name) name = sample.value['name'];
                        }
                    }
                    if (!name) name = group;
                    this.sampleList.push({ id: group, name: name});
                }
                if (pm.groups[group]['type'] == 'sampleGroup') {
                    var name = null;
                    if (sm) {
                        var key = pm.groups[group]['sampleGroup'];
                        var sample = sm['sampleGroups'][key];
                        name = sample.value['Name'];
                        if (!name) name = sample.value['name'];
                        if (pm.groups[group]['category']) {
                            name += ' (' + sm['sampleGroups'][key].value.category + ' = ' + pm.groups[group]['category'] + ')';
                        }
                    }
                    if (!name) name = group;
                    this.sampleGroupList.push({ id: group, name: name});
                }
            }
            this.chartGroupNames = [].concat(this.fileList, this.sampleList, this.sampleGroupList);

            this.chartViews = {};
            this.chartFiles = [];
            if (geneSegmentChart) {
                this.isValid = true;
                this.chartFiles.push({ id: 'relative_gene_segment_usage',
                                       type: 'gene_segment_usage',
                                       name: 'Relative Gene Segment Usage',
                                       view: Analyses.Charts.RelativeGeneDistribution,
                                       files: [], samples: [], sampleGroups: [], cachedGroups: {} });
                this.chartFiles.push({ id: 'gene_segment_usage',
                                       type: 'gene_segment_usage',
                                       name: 'Gene Segment Usage',
                                       view: Analyses.Charts.GeneDistribution,
                                       files: [], samples: [], sampleGroups: [], cachedGroups: {} });
            }
            if (CDR3Histogram) {
                this.isValid = true;
                this.chartFiles.push({ id: 'cdr3_length',
                                       type: 'cdr3_length',
                                       name: 'CDR3 Length Histogram',
                                       view: Analyses.Charts.CDR3,
                                       files: [], samples: [], sampleGroups: [], cachedGroups: {} });
            }
            if (clonalAbundance) {
                this.isValid = true;
                this.chartFiles.push({ id: 'clonal_abundance',
                                       type: 'clonal_abundance',
                                       name: 'Clonal Abundance',
                                       view: Analyses.Charts.ClonalAbundance,
                                       files: [], samples: [], sampleGroups: [], cachedGroups: {},
                                       citation: 'https://www.ncbi.nlm.nih.gov/pubmed/26069265' });
                this.chartFiles.push({ id: 'clonal_cumulative_abundance',
                                       type: 'clonal_abundance',
                                       name: 'Clonal Cumulative Abundance',
                                       view: Analyses.Charts.ClonalCumulative,
                                       files: [], samples: [], sampleGroups: [], cachedGroups: {},
                                       citation: 'https://www.ncbi.nlm.nih.gov/pubmed/26069265' });
            }
            if (diversityCurve) {
                this.isValid = true;
                this.chartFiles.push({ id: 'diversity_curve',
                                       type: 'diversity_curve',
                                       name: 'Diversity Curve',
                                       view: Analyses.Charts.DiversityCurve,
                                       files: [], samples: [], sampleGroups: [], cachedGroups: {},
                                       citation: 'https://www.ncbi.nlm.nih.gov/pubmed/26069265' });
            }
            if (selectionPressure) {
                this.isValid = true;
                this.chartFiles.push({ id: 'selection_pressure',
                                       type: 'selection_pressure',
                                       name: 'Selection Pressure',
                                       view: Analyses.Charts.SelectionPressure,
                                       files: [], samples: [], sampleGroups: [], cachedGroups: {},
                                       citation: 'https://www.ncbi.nlm.nih.gov/pubmed/26069265' });
            }

            if (this.isValid) {
                this.render();
            }
        },
        serialize: function() {
            return {
                chartFiles: this.chartFiles,
                fileList: this.fileList,
                sampleList: this.sampleList,
                sampleGroupList: this.sampleGroupList,
            };
        },
        events: {
            'click .show-chart': 'showChart',
            'click .hide-chart': 'hideChart',

            'click .download-chart': 'downloadChart',
            'click .download-data': 'downloadData',

            'click .toggle-legend-btn': 'toggleLegend',
        },

        afterRender: function() {
            var that = this;
            for (var i = 0; i < this.chartFiles.length; ++i) {
                $(document).ready(function() {
                    // multi select for files
                    $('#file-list-' + i).multiselect({
                        listIndex: i,
                        buttonWidth: '150px',
                        onChange: function(option, checked, select) {
                            if (option) {
                                var chartId = that.chartFiles[this.options.listIndex];
                                var groups = chartId['files'];
                                var newGroups = _.clone(groups);
                                var groupName = $(option).val();
                                if (checked) newGroups.push(groupName);
                                else newGroups.splice(newGroups.indexOf(groupName), 1);
                                chartId['files'] = newGroups;

                                // redisplay chart
                                var chart = chartId['chart'];
                                var chartView = chartId['view'];
                                var classSelector = chartId['classSelector'];
                                if (chart) {
                                    chart.showLoading('Loading Data...');
                                    return that._loadChartData(chartView.chartFilenames(chartId, that.selectAnalyses.jobProcessMetadata), chartId['cachedGroups'])
                                    .then(function() {
                                        var chartGroups = [].concat(chartId['files'], chartId['samples'], chartId['sampleGroups']);
                                        chart.hideLoading();
                                        return chartId['chart'] = chartView.generateChart(that.selectAnalyses.jobProcessMetadata, chartGroups, that.chartGroupNames, chartId['cachedGroups'], classSelector);
                                    })
                                }
                            }
                        },
                    });

                    // multi select for samples
                    $('#sample-list-' + i).multiselect({
                        listIndex: i,
                        buttonWidth: '150px',
                        onChange: function(option, checked, select) {
                            if (option) {
                                var chartId = that.chartFiles[this.options.listIndex];
                                var groups = chartId['samples'];
                                var newGroups = _.clone(groups);
                                var groupName = $(option).val();
                                if (checked) newGroups.push(groupName);
                                else newGroups.splice(newGroups.indexOf(groupName), 1);
                                chartId['samples'] = newGroups;

                                // redisplay chart
                                var chart = chartId['chart'];
                                var chartView = chartId['view'];
                                var classSelector = chartId['classSelector'];
                                if (chart) {
                                    chart.showLoading('Loading Data...');
                                    return that._loadChartData(chartView.chartFilenames(chartId, that.selectAnalyses.jobProcessMetadata), chartId['cachedGroups'])
                                    .then(function() {
                                        var chartGroups = [].concat(chartId['files'], chartId['samples'], chartId['sampleGroups']);
                                        chart.hideLoading();
                                        return chartId['chart'] = chartView.generateChart(that.selectAnalyses.jobProcessMetadata, chartGroups, that.chartGroupNames, chartId['cachedGroups'], classSelector);
                                    })
                                }
                            }
                        },
                    });

                    // multi select for sample groups
                    $('#sample-group-list-' + i).multiselect({
                        listIndex: i,
                        buttonWidth: '150px',
                        onChange: function(option, checked, select) {
                            if (option) {
                                var chartId = that.chartFiles[this.options.listIndex];
                                var groups = chartId['sampleGroups'];
                                var newGroups = _.clone(groups);
                                var groupName = $(option).val();
                                if (checked) newGroups.push(groupName);
                                else newGroups.splice(newGroups.indexOf(groupName), 1);
                                chartId['sampleGroups'] = newGroups;

                                // redisplay chart
                                var chart = chartId['chart'];
                                var chartView = chartId['view'];
                                var classSelector = chartId['classSelector'];
                                if (chart) {
                                    chart.showLoading('Loading Data...');
                                    return that._loadChartData(chartView.chartFilenames(chartId, that.selectAnalyses.jobProcessMetadata), chartId['cachedGroups'])
                                    .then(function() {
                                        var chartGroups = [].concat(chartId['files'], chartId['samples'], chartId['sampleGroups']);
                                        chart.hideLoading();
                                        return chartId['chart'] = chartView.generateChart(that.selectAnalyses.jobProcessMetadata, chartGroups, that.chartGroupNames, chartId['cachedGroups'], classSelector);
                                    })
                                }
                            }
                        },
                    });

                    // select one sample by default
                    // or if no samples then one file
                    // or if no files then one sample group
                    // otherwise nothing
                    var chartId = that.chartFiles[i];
                    if (that.sampleList.length > 0) {
                        chartId['samples'] = [ that.sampleList[0].id ];
                        $('#sample-list-' + i).multiselect('select', chartId['samples']);
                        $('#sample-list-' + i).multiselect('updateButtonText');
                    } else if (that.fileList.length > 0) {
                        chartId['files'] = [ that.fileList[0] ];
                        $('#file-list-' + i).multiselect('select', that.fileList[0]);
                        $('#file-list-' + i).multiselect('updateButtonText');
                    } else if (that.sampleGroupList.length > 0) {
                        chartId['sampleGroups'] = [ that.sampleGroupList[0] ];
                        $('#sample-group-list-' + i).multiselect('select', that.sampleGroupList[0]);
                        $('#sample-group-list-' + i).multiselect('updateButtonText');
                    }
                });
            }
        },

        hideChart: function(e) {
            e.preventDefault();
            $(e.target).parent().prev('#show-chart').removeClass('hidden');
            $(e.target).closest('#hide-chart').addClass('hidden');

            var elOffset = $( e.target ).offset().top;
            var elHeight = $( e.target ).height();
            var windowHeight = $(window).height();
            var offset;

            if (elHeight < windowHeight) {
              offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
            } else {
              offset = elOffset;
            }

            $('html, body').animate({scrollTop: offset}, 1000);

            $(e.target).parent().parent().parent().next().next().hide(1500, function(){
              $(e.target).parent().parent().parent().next().next().remove();
            });

/*            $(e.target.closest('tr')).next().hide(1500, function(){
              $(e.target.closest('tr')).next().remove();
            }); */
        },

        showChart: function(e) {
            e.preventDefault();

            var insertPoint = $(e.target).parent().parent().next();
            this._uiBeginChartLoading(insertPoint);

            var chartId = this.chartFiles[e.target.dataset.tuple];

            this.chartHeight = 360;

            var classSelector = chance.string({
                pool: 'abcdefghijklmnopqrstuvwxyz',
                length: 15,
            });
            chartId['classSelector'] = classSelector;

/*
            // remove if it exists
            if ($(e.target.closest('tr')).next().is('tr[id^="chart-tr-"]')) {
              $(e.target.closest('tr')).next().remove();
            }

            $(e.target.closest('tr')).after(
                '<tr id="chart-tr-' + classSelector  + '" style="height: 0px;">'
                    + '<td colspan=3>'
                        + '<div id="' + classSelector + '" class="svg-container ' + classSelector + '">'
                            + '<svg style="height: 0px;" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
                        + '</div>'
                        + '<div class="' + classSelector + '-d3-tip d3-tip hidden"></div>'
                    + '</td>'
                + '</tr>'
            );
*/


            $(e.target).parent().parent().next().after(
                '<div>'
                + '<div class="form-group">'
                + '<div id="chart-tr-' + classSelector  + '" class="col-md-12">'
                        + '<div id="' + classSelector + '" class="svg-container ' + classSelector + '">'
                            + '<svg style="height: 0px;" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
                        + '</div>'
                        + '<div class="' + classSelector + '-d3-tip d3-tip hidden"></div>'
                    + '</div>'
                    + '</div><hr>'
                    + '</div>'
            );


            $(e.target).addClass('hidden');
            $(e.target).nextAll('#hide-chart').removeClass('hidden');

            // Enable download button
            $(e.target).nextAll('#hide-chart').children('.download-chart').attr('data-chart-class-selector', classSelector);

            $('#file-label').removeClass('hidden');
            $('#sample-label').removeClass('hidden');
            $('#sample-group-label').removeClass('hidden');

            // Clean up any charts that are currently displayed
            this.selectAnalyses.hideWarning();
            $('#chart-legend').hide();

            var that = this;
            var chartData;
            this._loadChartData(chartId['view'].chartFilenames(chartId, that.selectAnalyses.jobProcessMetadata), chartId['cachedGroups'])
            .then(function(tmpChartData) {
                chartData = tmpChartData;
            })
            .then(function() {
                return $('#chart-tr-' + classSelector).animate({
                    // Unfortunately, this '30' is a bit of a magic number.
                    // It helps create enough spacer for horizontal scroll
                    // bars on the qstats chart not to overlay on other
                    // chart buttons.
                    height: (that.chartHeight + 30) + 'px',
                }, 500).promise();
            })
            .then(function() {
                $('.' + classSelector + ' svg').css('height', that.chartHeight);
            })
            .done(function() {

                that._uiEndChartLoading();

                var fileHandle;
                var chartGroups = [].concat(chartId['files'], chartId['samples'], chartId['sampleGroups']);

                chartId['chart'] = chartId['view'].generateChart(that.selectAnalyses.jobProcessMetadata, chartGroups, that.chartGroupNames, chartId['cachedGroups'], classSelector);

                // Scroll down to chart
                $('html, body').animate({
                    scrollTop: $('.' + classSelector).offset().top
                }, 1000);
            })
            .fail(function(errorMessage) {
                //var errorMessage = this.getErrorMessageFromResponse(response);
                that.selectAnalyses.showError(errorMessage);
            })
            ;
        },

        downloadChart: function(e) {
            e.preventDefault();

            var that = this;

            var chartId = this.chartFiles[e.target.dataset.tuple];

            // All our currently Highcharts so use their export function
            chartId['chart'].exportChart();
        },

        downloadData: function(e) {
            e.preventDefault();

            var chartId = this.chartFiles[e.target.dataset.tuple];
            var appGroup = this.selectAnalyses.processMetadata.groups[this.selectAnalyses.processMetadata.process.appName];
            var fileKey = appGroup[chartId['type']]['files'];
            var fileEntry = this.selectAnalyses.processMetadata.files[fileKey]['chart_data'];
            var filename = fileEntry['value'];
            var fileHandle = this.selectAnalyses.collection.getFileByName(filename);

            fileHandle.downloadFileToDisk()
                .fail(function(error) {
                      var telemetry = new Backbone.Agave.Model.Telemetry();
                      telemetry.setError(error);
                      telemetry.set('method', 'downloadData()');
                      telemetry.set('view', 'Analyses.RepertoireComparison');
                      telemetry.save();
                  })
                  ;
        },

        // private methods
        _uiBeginChartLoading: function(selector) {
            // Disable other buttons
            $('.show-chart').prop('disabled', true);

            $(selector).after('<div class="chart-loading-view"></div>');

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView('.chart-loading-view', loadingView);
            loadingView.render();
        },
        _uiEndChartLoading: function() {

            // Restore buttons
            $('.show-chart').prop('disabled', false);

            // Remove loading view
            $('.chart-loading-view').remove();
        },
        _loadChartData: function(files, cachedGroups) {
            var that = this;

            var promises = Object.keys(files).map(function(f) {
                return function() {
                    if (cachedGroups[f]) return cachedGroups[f];
                    else {
                        var filename = files[f];
                        var fileHandle = that.selectAnalyses.collection.getFileByName(filename);
                        if (!fileHandle) return $.Deferred().reject('Project is missing chart data file: ' + filename);

                        return fileHandle.downloadFileToCache()
                        .then(function(tmpFileData) {
                            return cachedGroups[f] = tmpFileData;
                        })
                    }
                }
            })

            // Execute promises
            return promises.reduce(
                function(previous, current) {
                    return previous.then(current);
                },
                $.Deferred().resolve()
            )
        }
    });

    Analyses.Charts.LengthHistogram = function(isComparison, chartData, classSelector) {

        var myData = [];

        for (var group in chartData) {
            //remove commented out lines (header info)
            var text = chartData[group].replace(/^[##][^\r\n]+[\r\n]+/mg, '');

            var data = d3.tsv.parse(text);
            var otherD = [];
            data.forEach(function(d) {
                otherD.push({
                    x: +d['read_length'],
                    y: +d['count'],
                });
            });

            var name = '';
            var color = 'red';
            if (isComparison) {
                if (group == 'pre') name = 'Pre-filter ';
                else { name = 'Post-filter '; color = 'blue'; }
            }

            myData.push({
                key: name + 'Sequence Length',
                values: otherD,
                color: color
            });
        }

         // pre/post difference
        if (isComparison) {
            var diffD = [];
            var otherD = [];
            var preIdx, postIdx;
            if (myData[0].key == 'Pre-filter Sequence Length') { preIdx = 0; postIdx = 1; }
            else { preIdx = 1; postIdx = 0; }
            var preData = myData[preIdx].values;
            var postData = myData[postIdx].values;
            for (var i = 0; i < preData.length; ++i) {
                diffD[i] = preData[i].y;
            }
            for (var i = 0; i < postData.length; ++i) {
                diffD[i] -= postData[i].y;
            }
            for (var i = 0; i < diffD.length; ++i) {
                otherD.push({
                    x: i,
                    y: diffD[i]
                });
            }

            myData.push({
                key: 'Pre/Post Difference',
                values: otherD,
                color: 'magenta'
            });
        }

        nv.addGraph(function() {
            var chart = nv.models.lineChart()
                .margin({left: 100, right:50})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
            ;

            chart.xAxis     //Chart x-axis settings
                .axisLabel('Sequence Length (bp)')
                .tickFormat(d3.format(',r'))
            ;

            chart.yAxis     //Chart y-axis settings
                .axisLabel('Read Count')
                .tickFormat(d3.format(',r'))
            ;

            /* Done setting the chart up? Time to render it!*/
            d3.select('.' + classSelector + ' svg')    //Select the <svg> element you want to render the chart in.
                .datum(myData)
                .call(chart)    //Finally, render the chart!
            ;

            //Update the chart when window resizes.
            nv.utils.windowResize(function() {
                chart.update();
            });

            return chart;
        });
    };

    Analyses.Charts.MeanQualityScoreHistogram = function(isComparison, chartData, classSelector) {

        var myData = [];
        var preMedian;
        var preQuality;
        var postMedian;
        var postQuality;

        for (var group in chartData) {
            //remove commented out lines (header info)
            var text = chartData[group].replace(/^[##][^\r\n]+[\r\n]+/mg, '');

            var csv = d3.tsv.parse(text);

            // build quality score line
            var qualityScore = [];
            _.each(csv, function(row) {
                qualityScore.push(parseInt(row['count']));
            });

            // calculate xAxis median
            var total = 0;
            _.each(csv, function(row) {
                if (row['count'] !== '0') {
                    total += parseInt(row['count']);
                }
            });

            var runningTotal = 0;
            var xMedian = _.find(csv, function(row) {
                runningTotal += parseInt(row['count']);
                if (runningTotal >= total / 2) {
                    return row;
                }
            });

            // build median line
            var medianScore = [];
            _.each(csv, function(row) {
                if (parseInt(row['count']) <= parseInt(xMedian['count']) && row['read_quality'] !== '0') {
                    medianScore.push({
                        x: parseInt(xMedian['read_quality']),
                        y: parseInt(row['count'])
                    });
                }
            });

            var name = '';
            var color = 'red';
            var mcolor = 'magenta';
            if (isComparison) {
                if (group == 'pre') {
                    name = 'Pre-filter ';
                    preMedian = xMedian;
                    preQuality = qualityScore;
                } else {
                    name = 'Post-filter ';
                    color = 'blue';
                    mcolor = 'black';
                    postMedian = xMedian;
                    postQuality = qualityScore;
                }
            } else {
                preMedian = xMedian;
                preQuality = qualityScore;
            }

            myData.push({
                name: name + 'Median Score',
                data: medianScore,
                pointStart: 1,
                color: mcolor,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 0
                }
            });
            myData.push({
                name: name + 'Read Count',
                data: qualityScore,
                color: color,
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 0
                }
            });
        }

        var chart = new Highcharts.Chart({
            chart: {
                renderTo: classSelector,
                panning: true,
                style: {
                    fontFamily: 'Arial',
                },
            },

            exporting: {
                enabled: false
            },

            credits: {
                enabled: false
            },

            title: {
                text: ''
            },

            xAxis: {
                title: {
                    text: 'Average (Median) Quality Score per read',
                    style: {
                        color: '#000000',
                        fontSize: '12px'
                    }
                },
                tickInterval: 1,
                labels: {
                    style: {
                        color: '#000000'
                    },
                },
            },

            yAxis: {
                title: {
                    text: 'Read Count',
                    style: {
                        color: '#000000',
                        fontSize: '12px'
                    }
                },
                type: 'line',
                labels: {
                    style: {
                        color: '#000000',
                        fontSize: '12px'
                    },
                    formatter: function() {
                        return this.value;
                    }
                },
                height: '100%',
                showLastLabel: true,
            },

            plotOptions: {
                line: {
                    animation: false
                },
                series: {
                    marker: {
                        states: {
                            hover: {
                                radiusPlus: 6,
                                lineWidthPlus: 2
                            }
                        }
                    }
                }
            },

            tooltip: {
                formatter: function() {

                    var tooltip = '';
                    if (isComparison) {
                        tooltip = '<b>Quality Score: </b>' + this.x + '<br/>';
                        if (preQuality[this.x]) tooltip += '<b>Pre-filter Read Count: </b>' + preQuality[this.x] + '<br/>';
                        else tooltip += '<b>Pre-filter Read Count: </b>0<br/>';
                        tooltip += '<b>Pre-filter Median Score: </b>' + preMedian.read_quality + '<br/>';
                        if (postQuality[this.x]) tooltip += '<b>Post-filter Read Count: </b>' + postQuality[this.x] + '<br/>';
                        else tooltip += '<b>Post-filter Read Count: </b>0<br/>';
                        tooltip += '<b>Post-filter Median Score: </b>' + postMedian.read_quality;
                    } else {
                        tooltip = '<b>Quality Score: </b>' + this.x + '<br/>' +
                                '<b>Read Count: </b>' + preQuality[this.x] + '<br/>' +
                                '<b>Median Score: </b>' + preMedian.read_quality;
                    }

                    return tooltip;
                }
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
            },

            series: myData
        });
    };

    Analyses.Charts.QualityScore = function(isComparison, chartData, classSelector, chartHeight) {

        var myData = [];
        var maxPosition = 0;

        for (var group in chartData) {
            //remove commented out lines (header info)
            var text = chartData[group].replace(/^[##][^\r\n]+[\r\n]+/mg, '');

            var csv = d3.tsv.parse(text);

            var data = [];
            var boxPlot = [];
            var mean = [];
            var categories = []; // navigator xAxis ticks for our purposes
            var backgroundBottom = [];
            var backgroundMiddle = [];
            var backgroundTop = [];
            var max = 0;

            _.each(csv, function(row, index) {
              var data = new Array();
              data.push(parseInt(row['10%']));
              data.push(parseInt(row['25%']));
              data.push(parseInt(row['50%']));
              data.push(parseInt(row['75%']));
              data.push(parseInt(row['90%']));
              boxPlot[index] = data;
              mean.push(parseFloat(row['mean']));
              categories.push(parseInt(row['position']));
              if (parseInt(row['position']) > maxPosition) maxPosition = parseInt(row['position']);
            });

            _.each(boxPlot, function(row, index) {
              var temp = _.max(row);
              if (temp > max) {
                  max = temp;
              }
            });

            _.each(boxPlot, function(row, index) {
              backgroundBottom.push(20);
              backgroundMiddle.push(8);
              backgroundTop.push(max - 28);
            });

            var name = '';
            var yAxis = 0;
            if (isComparison) {
                if (group == 'pre') {
                    name = 'Pre-filter ';
                } else {
                    name = 'Post-filter ';
                    yAxis = 1;
                }
            }

            myData.push({
                type: 'area',
                data: backgroundTop,
                color: '#CEFCDB',
                stack: 0,
                yAxis: yAxis
            });

            myData.push({
                type: 'area',
                data: backgroundMiddle,
                color: '#FCFCCE',
                stack: 0,
                yAxis: yAxis
            });

            myData.push({
                type: 'area',
                data: backgroundBottom,
                color: '#F4D7D8',
                stack: 0,
                yAxis: yAxis
            });

            myData.push({
                type: 'boxplot',
                data: boxPlot,
                yAxis: yAxis
            });

            myData.push({
                type: 'spline',
                data: mean,
                marker: {
                    enabled: true,
                    radius: 2,
                    symbol: 'circle'
                },
                color: '#FB000D',
                yAxis: yAxis
            });

            if (!yAxis) {
                myData.push({
                    // dummy series needed to obtain a continous xAxis with navigator in place
                    type: 'line',
                    data: categories,
                    visible: false,
                });
            }
        }

      var yAxis;
      if (isComparison) {
          yAxis = [{
              title: {
                  text: 'Pre-filter Quality',
                  style: {
                      color: '#000000',
                      fontSize: '12px'
                  }
              },
              max: max,
              opposite: false,
              labels: {
                  align: 'right',
                  enabled: true,
                  style: {
                      color: '#000000'
                  }
              },
              height: '40%',
              showLastLabel: true
            },{
              title: {
                  text: 'Post-filter Quality',
                  style: {
                      color: '#000000',
                      fontSize: '12px'
                  }
              },
              max: max,
              opposite: false,
              labels: {
                  align: 'right',
                  enabled: true,
                  style: {
                      color: '#000000'
                  }
              },
              offset: 0,
              top: '50%',
              height: '40%',
              showLastLabel: true
          }];
      } else {
          yAxis = [{
              title: {
                  text: 'Quality',
                  style: {
                      color: '#000000',
                      fontSize: '12px'
                  }
              },
              max: max,
              opposite: false,
              labels: {
                  align: 'right',
                  enabled: true,
                  style: {
                      color: '#000000'
                  }
              },
              height: '100%',
              showLastLabel: true
        }];
      }

      var chart = new Highcharts.StockChart({
        chart: {
            height: chartHeight,
            renderTo: classSelector,
            panning: true,
            style: {
                fontFamily: 'Arial',
            },
        },
/*
        title: {
            text: 'Quality Scores',
            style: {
                color: '#000000',
                fontSize: '12px'
            }
        },
*/
        plotOptions: {
            series: {
                stacking: 'normal',
                groupPadding: 0
            },
            boxplot: {
                fillColor: '#4682B4',
                lineWidth: 1,
                color: '#000000',
                medianColor: '#D18A2D',
                stemColor: '#1B271F',
                stemDashStyle: 'dash',
                stemWidth: 1,
                whiskerColor: '#1B271F',
                whiskerLength: '100%',
                whiskerWidth: 1
            },
        },

        tooltip: {
            formatter: function() {

                // expects series to be in a specific order
                var tooltip = '<b>Read position: <b>' + this.x + '<br/>';

                if (isComparison) {
                    if (this.points[4])
                        tooltip += '<b>Pre-filter Mean: <b>' + this.points[4].series.options.data[this.x] + '<br/>';
                    if (this.points[3]) {
                        tooltip += '<b>Pre-filter 90%: <b>' + this.points[3].series.options.data[this.x][4] + '<br/>';
                        tooltip += '<b>Pre-filter 75%: <b>' + this.points[3].series.options.data[this.x][3] + '<br/>';
                        tooltip += '<b>Pre-filter 50%: <b>' + this.points[3].series.options.data[this.x][2] + '<br/>';
                        tooltip += '<b>Pre-filter 25%: <b>' + this.points[3].series.options.data[this.x][1] + '<br/>';
                        tooltip += '<b>Pre-filter 10%: <b>' + this.points[3].series.options.data[this.x][0] + '<br/>';
                    }

                    if (this.points[9])
                        tooltip += '<b>Post-filter Mean: <b>' + this.points[9].series.options.data[this.x] + '<br/>';
                    if (this.points[8]) {
                        tooltip += '<b>Post-filter 90%: <b>' + this.points[8].series.options.data[this.x][4] + '<br/>';
                        tooltip += '<b>Post-filter 75%: <b>' + this.points[8].series.options.data[this.x][3] + '<br/>';
                        tooltip += '<b>Post-filter 50%: <b>' + this.points[8].series.options.data[this.x][2] + '<br/>';
                        tooltip += '<b>Post-filter 25%: <b>' + this.points[8].series.options.data[this.x][1] + '<br/>';
                        tooltip += '<b>Post-filter 10%: <b>' + this.points[8].series.options.data[this.x][0] + '<br/>';
                    }
                } else {
                    if (this.points[4])
                        tooltip += '<b>Mean: <b>' + this.points[4].series.options.data[this.x] + '<br/>';
                    if (this.points[3]) {
                        tooltip += '<b>90%: <b>' + this.points[3].series.options.data[this.x][4] + '<br/>';
                        tooltip += '<b>75%: <b>' + this.points[3].series.options.data[this.x][3] + '<br/>';
                        tooltip += '<b>50%: <b>' + this.points[3].series.options.data[this.x][2] + '<br/>';
                        tooltip += '<b>25%: <b>' + this.points[3].series.options.data[this.x][1] + '<br/>';
                        tooltip += '<b>10%: <b>' + this.points[3].series.options.data[this.x][0] + '<br/>';
                    }
                }

                return tooltip;
            }
        },

        credits: {
            enabled: false
        },

        exporting: {
            enabled: false
        },

        yAxis: yAxis,

        xAxis: {
            title: {
                text: 'Read Position',
                style: {
                    color: '#000000',
                    fontSize: '12px'
                }
            },
            ordinal: false,
            labels: {
                style: {
                    color: '#000000'
                },
                formatter: function() {
                    return this.value;
                }
            }
        },

        rangeSelector: {
            selected: 0,
            inputEnabled: false,
            buttonTheme: {
                visibility: 'hidden'
            },
            labelStyle: {
                visibility: 'hidden'
            }
        },

        navigator: {
            series: {
                type: 'boxplot',
            },
            xAxis: {
                maxRange: 100,
                ordinal: false,
                categories: categories, // display navigator with numbers instead of dates
                labels: {
                    style: {
                        color: '#000000'
                    }
                },
            },
        },

        series: myData
      });

      chart.xAxis[0].setExtremes(0, maxPosition);
    };

    Analyses.Charts.PercentageGcHistogram = function(isComparison, chartData, classSelector) {

        var myData = [];

        for (var group in chartData) {
            //remove commented out lines (header info)
            var text = chartData[group].replace(/^[##][^\r\n]+[\r\n]+/mg, '');

            var otherD = [];
            var data = d3.tsv.parse(text);
            data.forEach(function(d) {
                otherD.push({
                    x: +d['GC%'],
                    y: +d['read_count'],
                });
            });

            //fill in any up to 100
            for (var i = 0; i <= 100; i++) {
                if (!otherD[i]) {
                    otherD.push({
                        x: +i,
                        y: 0,
                    });
                }
            }

            var name = '';
            var color = 'red';
            if (isComparison) {
                if (group == 'pre') name = 'Pre-filter ';
                else { name = 'Post-filter '; color = 'blue'; }
            }

            myData.push({
                key: name + 'Mean GC %',
                values: otherD,
                color: color
            });
        }

        nv.addGraph(function() {
            var chart = nv.models.lineChart()
                .margin({left: 100, right: 50})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
            ;

            chart.xAxis     //Chart x-axis settings
                .axisLabel('GC Content')
                .tickFormat(d3.format(',r'))
            ;

            chart.yAxis     //Chart y-axis settings
                .axisLabel('Read Count')
                .tickFormat(d3.format(',r'))
            ;

            /* Done setting the chart up? Time to render it!*/
            d3.select('.' + classSelector + ' svg')    //Select the <svg> element you want to render the chart in.
                .datum(myData)
                .call(chart)    //Finally, render the chart!
            ;

            //Update the chart when window resizes.
            nv.utils.windowResize(function() {
                chart.update();
            });

            return chart;
        });
    };

    Analyses.Charts.GeneDistribution = {

        chartFilenames: function(chartId, jobProcessMetadata) {
            var filenames = {};

            var processMetadata = jobProcessMetadata.get('value');
            var groups = processMetadata.groups;
            var files = processMetadata.files;

            for (var i = 0; i < chartId['files'].length; ++i) {
                var g = chartId['files'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['counts']['value'];
            }

            for (var i = 0; i < chartId['samples'].length; ++i) {
                var g = chartId['samples'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['counts']['value'];
            }

            for (var i = 0; i < chartId['sampleGroups'].length; ++i) {
                var g = chartId['sampleGroups'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['counts']['value'];
            }

            return filenames;
        },

        generateChart: function(jobProcessMetadata, chartGroups, chartGroupNames, cachedGroups, classSelector) {

            var processMetadata = jobProcessMetadata.get('value');
            var myData = [];
            var drilldown = {
              series: new Array()
            };

            for (var i = 0; i < chartGroups.length; ++i) {
                var group = chartGroups[i];
                var text = cachedGroups[group];
                var distribution = JSON.parse(text);
                var groupType = processMetadata.groups[group]['type'];

                var groupName = group;
                for (var j = 0; j < chartGroupNames.length; ++j) {
                    var n = chartGroupNames[j];
                    if (n.id == group) {
                        groupName = n.name;
                        break;
                    }
                }

                // build series
                var series = {
                  id: group + '.' + distribution.label,
                  name: groupName,
                  data: new Array()
                };

                _.each(distribution.children, function(gene){
                  series.data.push({
                    id: 'parent',
                    name: gene.label,
                    y: gene.absolute,
                    drilldown: group + '.' + gene.label,
                    //color: '#7B94B5'
                  });
                });

                myData.push(series);

                if (groupType == 'sampleGroup') {
                    var errorSeries = {
                      name: groupName + ' error',
                      linkedTo: group + '.' + distribution.label,
                      type: 'errorbar',
                      data: new Array()
                    };

                    _.each(distribution.children, function(gene){
                        var dataPoint = parseFloat(gene.absolute);
                        var stdError = parseFloat(gene.absolute_std);
                        errorSeries.data.push([dataPoint - stdError, dataPoint + stdError]);
                    });

                    myData.push(errorSeries);
                }

                // drilldown level 1
                _.each(distribution.children, function(gene){
                  var data = [];
                  var errorData = [];
                  _.each(gene.children, function(geneChild){
                    data.push({
                      id: 'child',
                      name: geneChild.label,
                      y: geneChild.absolute,
                      drilldown: group + '.' + geneChild.label,
                      //color: '#7B94B5'
                    });
                    if (groupType == 'sampleGroup') {
                        var dataPoint = parseFloat(geneChild.absolute);
                        var stdError = parseFloat(geneChild.absolute_std);
                        errorData.push([dataPoint - stdError, dataPoint + stdError]);
                    }
                  });
                  drilldown.series.push({
                    id: group + '.' + gene.label,
                    name: groupName,
                    data: data
                  });
                  if (groupType == 'sampleGroup') {
                      var errorSeries = {
                        name: groupName + ' error',
                        linkedTo: group + '.' + gene.label,
                        type: 'errorbar',
                        data: errorData
                      };
                      //myData.push(errorSeries);

                      /*drilldown.series.push({
                        linkedTo: group + '.' + gene.label,
                        type: 'errorbar',
                        name: groupName + ' error',
                        data: errorData
                      }); */
                  }
                });

                // drilldown level 2
                _.each(distribution.children, function(gene){
                  _.each(gene.children, function(geneChild){
                    var data = [];
                    _.each(geneChild.children, function(geneGrandchild){
                      data.push({
                        id: 'grandchild',
                        name: geneGrandchild.label,
                        y: geneGrandchild.absolute,
                        alleles: geneGrandchild.children
                      });
                    });
                    drilldown.series.push({
                      id: group + '.' + geneChild.label,
                      name: groupName,
                      data: data
                    });
                  });
                });
            }

            Highcharts.setOptions({
              lang: {
                thousandsSep: ','
              }
            });

            //if (this.chart) { this.chart.destroy(); this.chart = null; }

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: classSelector,
                    type: 'column',
                },
                title: {
                    text: ''
                },
                credits: {
                   enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                      style: {
                        color: '#000000',
                      },
                      rotation: -90,
                    },
                    type: 'category',
                    tickInterval: 1
                },
                yAxis: {
                    title: {
                        text: 'Total Read Counts'
                    },
                    labels: {
                        style: {
                            color: '#000000'
                        },
                        formatter: function () {
                            return this.value;
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                // plotOptions: {
                //     series: {
                //         style: {
                //             color: '#000000'
                //         },
                //         borderWidth: 0,
                //         dataLabels: {
                //             enabled: true,
                //             rotation: -45,
                //             format: '{point.y:,.2f}'
                //         }
                //     }
                // },

                tooltip: {
                    headerFormat: '<b>Parent: </b> {series.name}<br/>',
                    pointFormat: '<b>{point.name}: </b>{point.y:,.2f}<br/>',
                    formatter: function(){
                      var tooltip = '';
                      for(var i = 0, length = this.series.points.length; i < length; i++) {
                        var point = this.series.points[i];

                        if (point.id === 'parent' || point.id === 'child'){
                          tooltip = '<b>Parent: </b>' + this.series.name + '<br/>'+
                                    '<b>' + this.key + ': </b>' + Highcharts.numberFormat(this.y, 2) + '<br/>';
                        }

                        if (point.id === 'grandchild'){
                          tooltip = '<b>Parent: </b>' + this.series.name + '<br/>'+
                                    '<b>' + this.key + ': </b>' + Highcharts.numberFormat(this.y, 2) + '<br/>';
                          if (typeof(this.point.alleles) !== 'undefined'){
                            tooltip += '<b>Alleles:</b><br/>';
                            _.each(this.point.alleles, function(allele){
                              tooltip += '<b>' + allele.label + ': </b>' + Highcharts.numberFormat(allele.absolute, 2) + '<br/>';

                            });
                          }
                        }
                      }
                      return tooltip;
                    }
                },
                series: myData,
                drilldown: drilldown
            });

            return chart;
        },

    };

    Analyses.Charts.RelativeGeneDistribution = {

        chartFilenames: function(chartId, jobProcessMetadata) {
            var filenames = {};

            var processMetadata = jobProcessMetadata.get('value');
            var groups = processMetadata.groups;
            var files = processMetadata.files;

            for (var i = 0; i < chartId['files'].length; ++i) {
                var g = chartId['files'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['counts']['value'];
            }

            for (var i = 0; i < chartId['samples'].length; ++i) {
                var g = chartId['samples'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['counts']['value'];
            }

            for (var i = 0; i < chartId['sampleGroups'].length; ++i) {
                var g = chartId['sampleGroups'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['counts']['value'];
            }

            return filenames;
        },

        generateChart: function(jobProcessMetadata, chartGroups, chartGroupNames, cachedGroups, classSelector) {

            var processMetadata = jobProcessMetadata.get('value');
            var myData = [];
            var drilldown = {
              series: new Array()
            };

            for (var i = 0; i < chartGroups.length; ++i) {
                var group = chartGroups[i];
                var text = cachedGroups[group];
                var distribution = JSON.parse(text);

                var groupName = group;
                for (var j = 0; j < chartGroupNames.length; ++j) {
                    var n = chartGroupNames[j];
                    if (n.id == group) {
                        groupName = n.name;
                        break;
                    }
                }

                // build series
                var series = {
                  id: group + '.' + distribution.label,
                  name: groupName,
                  data: new Array()
                };

                _.each(distribution.children, function(gene){
                  series.data.push({
                    id: 'parent',
                    name: gene.label,
                    y: gene.absolute > 0 ? 100 : 0.0,
                    drilldown: group + '.' + gene.label,
                    //color: '#7B94B5'
                  });
                });

                // drilldown level 1
                _.each(distribution.children, function(gene){
                  var data = [];
                  _.each(gene.children, function(geneChild){
                    data.push({
                      id: 'child',
                      name: geneChild.label,
                      y: geneChild.relative * 100,
                      drilldown: group + '.' + geneChild.label,
                      //color: '#7B94B5'
                    });
                  });
                  drilldown.series.push({
                    id: group + '.' + gene.label,
                    name: groupName,
                    data: data
                  });
                });

                // drilldown level 2
                _.each(distribution.children, function(gene){
                  _.each(gene.children, function(geneChild){
                    var data = [];
                    _.each(geneChild.children, function(geneGrandchild){
                      data.push({
                        id: 'grandchild',
                        name: geneGrandchild.label,
                        y: geneGrandchild.relative * 100,
                        alleles: geneGrandchild.children
                      });
                    });
                    drilldown.series.push({
                      id: group + '.' + geneChild.label,
                      name: groupName,
                      data: data
                    });
                  });
                });

                myData.push(series);
            }

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: classSelector,
                    type: 'column',
                },
                title: {
                    text: ''
                },
                credits: {
                   enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                      style: {
                        color: '#000000',
                      },
                      rotation: -90,
                    },
                    type: 'category',
                    tickInterval: 1
                },
                yAxis: {
                    title: {
                        text: 'Relative Read Counts'
                    },
                    labels: {
                        style: {
                            color: '#000000'
                        },
                        formatter: function () {
                            return this.value;
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    headerFormat: '<b>Parent: </b> {series.name}<br/>',
                    pointFormat: '<b>{point.name}: </b>{point.y:,.2f}<br/>',
                    formatter: function(){
                      var tooltip = '';
                      for(var i = 0, length = this.series.points.length; i < length; i++) {
                        var point = this.series.points[i];

                        if (point.id === 'parent' || point.id === 'child'){
                          tooltip = '<b>Parent: </b>' + this.series.name + '<br/>'+
                                    '<b>' + this.key + ': </b>' + Highcharts.numberFormat(this.y, 2) + '%<br/>';
                        }

                        if (point.id === 'grandchild'){
                          tooltip = '<b>Parent: </b>' + this.series.name + '<br/>'+
                                    '<b>' + this.key + ': </b>' + Highcharts.numberFormat(this.y, 2) + '%<br/>';
                          if (typeof(this.point.alleles) !== 'undefined'){
                            tooltip += '<b>Alleles:</b><br/>';
                            _.each(this.point.alleles, function(allele){
                              tooltip += '<b>' + allele.label + ': </b>' + Highcharts.numberFormat(allele.relative * 100, 2) + '%<br/>';

                            });
                          }
                        }
                      }
                      return tooltip;
                    }
                },
                series: myData,
                drilldown: drilldown
            });

            return chart;
        },

    };

    Analyses.Charts.CDR3 = {

        chartFilenames: function(chartId, jobProcessMetadata) {
            var filenames = {};

            var processMetadata = jobProcessMetadata.get('value');
            var groups = processMetadata.groups;
            var files = processMetadata.files;

            for (var i = 0; i < chartId['files'].length; ++i) {
                var g = chartId['files'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['aa']['value'];
            }

            for (var i = 0; i < chartId['samples'].length; ++i) {
                var g = chartId['samples'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['aa']['value'];
            }

            for (var i = 0; i < chartId['sampleGroups'].length; ++i) {
                var g = chartId['sampleGroups'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['aa']['value'];
            }

            return filenames;
        },

        generateChart: function(jobProcessMetadata, chartGroups, chartGroupNames, cachedGroups, classSelector) {

            var processMetadata = jobProcessMetadata.get('value');
            var myData = [];

            for (var i = 0; i < chartGroups.length; ++i) {
                var group = chartGroups[i];
                var text = cachedGroups[group];
                var cdr3Data = d3.tsv.parse(text);
                var groupType = processMetadata.groups[group]['type'];

                var groupName = group;
                for (var j = 0; j < chartGroupNames.length; ++j) {
                    var n = chartGroupNames[j];
                    if (n.id == group) {
                        groupName = n.name;
                        break;
                    }
                }

                // build series
                var series = {
                  //id: group + '.CDR3_LENGTH',
                  type: 'column',
                  name: groupName,
                  data: new Array()
                };

                for (var j = 0; j < cdr3Data.length; j++) {
                    var length = cdr3Data[j]['CDR3_LENGTH'];
                    var dataPoint = cdr3Data[j]['CDR3_RELATIVE'];

                    series.data.push([parseInt(length), parseFloat(dataPoint)]);
                }

                myData.push(series);

                if (groupType == 'sampleGroup') {
                    var errorSeries = {
                        type: 'errorbar',
                        name: groupName + ' error',
                        data: new Array()
                    };

                    for (var j = 0; j < cdr3Data.length; j++) {
                        var length = cdr3Data[j]['CDR3_LENGTH'];
                        var dataPoint = parseFloat(cdr3Data[j]['CDR3_RELATIVE']);
                        var stdError = parseFloat(cdr3Data[j]['CDR3_RELATIVE_STD']);

                        errorSeries.data.push([parseInt(length), dataPoint - stdError, dataPoint + stdError]);
                    }
                    myData.push(errorSeries);
                }
            }

            Highcharts.setOptions({
              lang: {
                thousandsSep: ','
              }
            });

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: classSelector,
                    type: 'column',
                },
                title: {
                    text: ''
                },
                credits: {
                   enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    title: {
                        text: 'CDR3 Length'
                    },
                    tickInterval: 1
                },
                yAxis: {
                    title: {
                        text: 'Relative Read Counts'
                    },
                    labels: {
                        style: {
                            color: '#000000'
                        },
                        formatter: function () {
                            return this.value;
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                series: myData,
            });

            return chart;
        },
    };

    Analyses.Charts.ClonalAbundance = {

        chartFilenames: function(chartId, jobProcessMetadata) {
            var filenames = {};

            var processMetadata = jobProcessMetadata.get('value');
            var groups = processMetadata.groups;
            var files = processMetadata.files;

            for (var i = 0; i < chartId['files'].length; ++i) {
                var g = chartId['files'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['clonal_abundance']['value'];
            }

            for (var i = 0; i < chartId['samples'].length; ++i) {
                var g = chartId['samples'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['clonal_abundance']['value'];
            }

            for (var i = 0; i < chartId['sampleGroups'].length; ++i) {
                var g = chartId['sampleGroups'][i];
                // sample group is just set of samples
                for (var sample in groups[g]['samples']) {
                    var sampleKey = jobProcessMetadata.getSampleKeyNameFromUuid(sample);
                    if (sampleKey) {
                        var group = groups[sampleKey][chartId.type];
                        if (group) filenames[sampleKey] = files[group['files']]['clonal_abundance']['value'];
                    }
                }
            }

            return filenames;
        },

        generateChart: function(jobProcessMetadata, chartGroups, chartGroupNames, cachedGroups, classSelector) {

            var processMetadata = jobProcessMetadata.get('value');
            var myData = [];

            var colors = Highcharts.getOptions().colors;

            var addSeries = function(group, index) {
                var text = cachedGroups[group];
                var data = d3.tsv.parse(text);

                var groupName = group;
                for (var j = 0; j < chartGroupNames.length; ++j) {
                    var n = chartGroupNames[j];
                    if (n.id == group) {
                        groupName = n.name;
                        break;
                    }
                }

                // build series
                var series = {
                  name: groupName,
                  zIndex: 1,
                  color: colors[index % colors.length],
                  data: new Array()
                };

                for (var j = 0; j < data.length; j++) {
                    var clone = data[j]['RANK'];
                    var dataPoint = parseFloat(data[j]['P']) * 100.0;
                    if (dataPoint < 0.01) continue;

                    series.data.push([parseInt(clone), dataPoint]);
                }
                myData.push(series);

                series = {
                  name: groupName,
                  type: 'arearange',
                  lineWidth: 0,
                  linkedTo: ':previous',
                  fillOpacity: 0.3,
                  zIndex: 0,
                  color: colors[index % colors.length],
                  data: new Array()
                };

                for (var j = 0; j < data.length; j++) {
                    var clone = data[j]['RANK'];
                    var dataPoint = parseFloat(data[j]['P']) * 100.0;
                    if (dataPoint < 0.01) continue;
                    var lower = parseFloat(data[j]['LOWER']) * 100.0;
                    var upper = parseFloat(data[j]['UPPER']) * 100.0;

                    series.data.push([parseInt(clone), lower, upper]);
                }
                myData.push(series);
            }

            for (var i = 0; i < chartGroups.length; ++i) {
                var group = chartGroups[i];
                if (processMetadata.groups[group]['type'] == 'sampleGroup') {
                    for (var sample in processMetadata.groups[group]['samples']) {
                        var sampleKey = jobProcessMetadata.getSampleKeyNameFromUuid(sample);
                        if (sampleKey) addSeries(sampleKey, i);
                    }
                } else {
                    addSeries(group, i);
                }
            }

            Highcharts.setOptions({
              lang: {
                thousandsSep: ','
              }
            });

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: classSelector,
                },
                title: {
                    text: ''
                },
                credits: {
                   enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    type: 'logarithmic',
                    title: {
                        text: 'Rank'
                    },
                    minorTickInterval: 0.1
                },
                yAxis: {
                    title: {
                        text: 'Abundance Percentage (%)'
                    },
                    labels: {
                        style: {
                            color: '#000000'
                        },
                        formatter: function () {
                            return this.value;
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                series: myData,
            });

            return chart;
        },
    };

    Analyses.Charts.ClonalCumulative = {

        chartFilenames: function(chartId, jobProcessMetadata) {
            var filenames = {};

            var processMetadata = jobProcessMetadata.get('value');
            var groups = processMetadata.groups;
            var files = processMetadata.files;

            for (var i = 0; i < chartId['files'].length; ++i) {
                var g = chartId['files'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['clonal_abundance']['value'];
            }

            for (var i = 0; i < chartId['samples'].length; ++i) {
                var g = chartId['samples'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['clonal_abundance']['value'];
            }

            for (var i = 0; i < chartId['sampleGroups'].length; ++i) {
                var g = chartId['sampleGroups'][i];
                // sample group is just set of samples
                for (var sample in groups[g]['samples']) {
                    var sampleKey = jobProcessMetadata.getSampleKeyNameFromUuid(sample);
                    if (sampleKey) {
                        var group = groups[sampleKey][chartId.type];
                        if (group) filenames[sampleKey] = files[group['files']]['clonal_abundance']['value'];
                    }
                }
            }

            return filenames;
        },

        generateChart: function(jobProcessMetadata, chartGroups, chartGroupNames, cachedGroups, classSelector) {

            var processMetadata = jobProcessMetadata.get('value');
            var myData = [];

            var colors = Highcharts.getOptions().colors;

            var addSeries = function(group, index) {
                var text = cachedGroups[group];
                var data = d3.tsv.parse(text);

                var groupName = group;
                for (var j = 0; j < chartGroupNames.length; ++j) {
                    var n = chartGroupNames[j];
                    if (n.id == group) {
                        groupName = n.name;
                        break;
                    }
                }

                // build series
                var series = {
                  name: groupName,
                  zIndex: 1,
                  color: colors[index % colors.length],
                  data: new Array()
                };

                var cumulative = 0.0;
                for (var j = 0; j < data.length; j++) {
                    var clone = data[j]['RANK'];
                    var dataPoint = parseFloat(data[j]['P']) * 100.0;
                    if (dataPoint < 0.01) continue;
                    cumulative += dataPoint;

                    series.data.push([parseInt(clone), cumulative]);
                }
                myData.push(series);

                series = {
                  name: groupName,
                  type: 'arearange',
                  lineWidth: 0,
                  linkedTo: ':previous',
                  fillOpacity: 0.3,
                  zIndex: 0,
                  color: colors[index % colors.length],
                  data: new Array()
                };

                var cumulative = 0.0;
                for (var j = 0; j < data.length; j++) {
                    var clone = data[j]['RANK'];
                    var dataPoint = parseFloat(data[j]['P']) * 100.0;
                    if (dataPoint < 0.01) continue;
                    cumulative += dataPoint;

                    var lower = parseFloat(data[j]['LOWER']) * 100.0;
                    lower = lower - dataPoint + cumulative;
                    var upper = parseFloat(data[j]['UPPER']) * 100.0;
                    upper = upper - dataPoint + cumulative;

                    series.data.push([parseInt(clone), lower, upper]);
                }
                myData.push(series);
            }

            for (var i = 0; i < chartGroups.length; ++i) {
                var group = chartGroups[i];
                if (processMetadata.groups[group]['type'] == 'sampleGroup') {
                    for (var sample in processMetadata.groups[group]['samples']) {
                        var sampleKey = jobProcessMetadata.getSampleKeyNameFromUuid(sample);
                        if (sampleKey) addSeries(sampleKey, i);
                    }
                } else {
                    addSeries(group, i);
                }
            }

            Highcharts.setOptions({
              lang: {
                thousandsSep: ','
              }
            });

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: classSelector,
                },
                title: {
                    text: ''
                },
                credits: {
                   enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    type: 'logarithmic',
                    title: {
                        text: 'Rank'
                    },
                    minorTickInterval: 0.1
                },
                yAxis: {
                    title: {
                        text: 'Cumulative Abundance Percentage (%)'
                    },
                    labels: {
                        style: {
                            color: '#000000'
                        },
                        formatter: function () {
                            return this.value;
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                series: myData,
            });

            return chart;
        },
    };

    Analyses.Charts.DiversityCurve = {

        chartFilenames: function(chartId, jobProcessMetadata) {
            var filenames = {};

            var processMetadata = jobProcessMetadata.get('value');
            var groups = processMetadata.groups;
            var files = processMetadata.files;

            for (var i = 0; i < chartId['files'].length; ++i) {
                var g = chartId['files'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['diversity_curve']['value'];
            }

            for (var i = 0; i < chartId['samples'].length; ++i) {
                var g = chartId['samples'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['diversity_curve']['value'];
            }

            for (var i = 0; i < chartId['sampleGroups'].length; ++i) {
                var g = chartId['sampleGroups'][i];
                // sample group is just set of samples
                for (var sample in groups[g]['samples']) {
                    var sampleKey = jobProcessMetadata.getSampleKeyNameFromUuid(sample);
                    if (sampleKey) {
                        var group = groups[sampleKey][chartId.type];
                        if (group) filenames[sampleKey] = files[group['files']]['diversity_curve']['value'];
                    }
                }
            }

            return filenames;
        },

        generateChart: function(jobProcessMetadata, chartGroups, chartGroupNames, cachedGroups, classSelector) {

            var processMetadata = jobProcessMetadata.get('value');
            var myData = [];

            var colors = Highcharts.getOptions().colors;

            var addSeries = function(group, index) {
                var text = cachedGroups[group];
                var data = d3.tsv.parse(text);

                var groupName = group;
                for (var j = 0; j < chartGroupNames.length; ++j) {
                    var n = chartGroupNames[j];
                    if (n.id == group) {
                        groupName = n.name;
                        break;
                    }
                }

                // build series
                var series = {
                  name: groupName,
                  zIndex: 1,
                  color: colors[index % colors.length],
                  data: new Array()
                };

                for (var j = 0; j < data.length; j++) {
                    var x = parseFloat(data[j]['Q']);
                    if (x == 0) x = 0.01;
                    var y = parseFloat(data[j]['D']);

                    series.data.push([x, y]);
                }
                myData.push(series);

                series = {
                  name: groupName,
                  type: 'arearange',
                  lineWidth: 0,
                  linkedTo: ':previous',
                  fillOpacity: 0.3,
                  zIndex: 0,
                  color: colors[index % colors.length],
                  data: new Array()
                };

                for (var j = 0; j < data.length; j++) {
                    var x = parseFloat(data[j]['Q']);
                    if (x == 0) x = 0.01;

                    var lower = parseFloat(data[j]['D_LOWER']);
                    var upper = parseFloat(data[j]['D_UPPER']);

                    series.data.push([x, lower, upper]);
                }
                myData.push(series);
            }

            for (var i = 0; i < chartGroups.length; ++i) {
                var group = chartGroups[i];
                if (processMetadata.groups[group]['type'] == 'sampleGroup') {
                    for (var sample in processMetadata.groups[group]['samples']) {
                        var sampleKey = jobProcessMetadata.getSampleKeyNameFromUuid(sample);
                        if (sampleKey) addSeries(sampleKey, i);
                    }
                } else {
                    addSeries(group, i);
                }
            }

            Highcharts.setOptions({
              lang: {
                thousandsSep: ','
              }
            });

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: classSelector,
                },
                title: {
                    text: ''
                },
                credits: {
                   enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    type: 'logarithmic',
                    title: {
                        text: 'Order (Q)'
                    },
                    minorTickInterval: 0.1
                },
                yAxis: {
                    title: {
                        text: 'Diversity (D)'
                    },
                    labels: {
                        style: {
                            color: '#000000'
                        },
                        formatter: function () {
                            return this.value;
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                series: myData,
            });

            return chart;
        },
    };

    Analyses.Charts.SelectionPressure = {

        chartFilenames: function(chartId, jobProcessMetadata) {
            var filenames = {};

            var processMetadata = jobProcessMetadata.get('value');
            var groups = processMetadata.groups;
            var files = processMetadata.files;

            for (var i = 0; i < chartId['files'].length; ++i) {
                var g = chartId['files'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['selection_pressure']['value'];
            }

            for (var i = 0; i < chartId['samples'].length; ++i) {
                var g = chartId['samples'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['selection_pressure']['value'];
            }

            for (var i = 0; i < chartId['sampleGroups'].length; ++i) {
                var g = chartId['sampleGroups'][i];
                var group = groups[g][chartId.type];
                if (group) filenames[g] = files[group['files']]['selection_pressure']['value'];
            }

            return filenames;
        },

        generateChart: function(jobProcessMetadata, chartGroups, chartGroupNames, cachedGroups, classSelector) {

            var processMetadata = jobProcessMetadata.get('value');
            var myData = [];

            for (var i = 0; i < chartGroups.length; ++i) {
                var group = chartGroups[i];
                var text = cachedGroups[group];
                if (!text) continue;
                var data = d3.tsv.parse(text);
                var groupType = processMetadata.groups[group]['type'];

                var groupName = group;
                for (var j = 0; j < chartGroupNames.length; ++j) {
                    var n = chartGroupNames[j];
                    if (n.id == group) {
                        groupName = n.name;
                        break;
                    }
                }

                // build series
                var series = {
                  id: group + '.SP',
                  type: 'column',
                  name: groupName,
                  dataLabels: {
                      enabled: true,
                      allowOverlap: true,
                      formatter: function () {return 'p = ' + Highcharts.numberFormat(Math.abs(this.point.pvalue),3)},
                  },
                  data: new Array()
                };

                for (var j = 0; j < data.length; j++) {
                    var dataPoint = data[j]['BASELINE_SIGMA'];
                    var pvalue = data[j]['BASELINE_CI_PVALUE'];

                    series.data.push({y: parseFloat(dataPoint), pvalue: parseFloat(pvalue)});
                }
                myData.push(series);

                var errorSeries = {
                    type: 'errorbar',
                    name: groupName + ' error',
                    linkedTo: group + '.SP',
                    data: new Array()
                };

                for (var j = 0; j < data.length; j++) {
                    var lower = parseFloat(data[j]['BASELINE_CI_LOWER']);
                    var upper = parseFloat(data[j]['BASELINE_CI_UPPER']);

                    errorSeries.data.push([lower, upper]);
                }
                myData.push(errorSeries);
            }

            Highcharts.setOptions({
              lang: {
                thousandsSep: ','
              }
            });

            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: classSelector,
                    type: 'column',
                },
                title: {
                    text: ''
                },
                credits: {
                   enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: {
                    title: {
                        text: 'Selection Pressure'
                    },
                    categories: [ 'CDR', 'FWR', 'CDR1', 'CDR2', 'FWR1', 'FWR2', 'FWR3' ],
                    tickInterval: 1
                },
                yAxis: {
                    title: {
                        text: 'BASELINE SIGMA'
                    },
                    labels: {
                        style: {
                            color: '#000000'
                        },
                        formatter: function () {
                            return this.value;
                        }
                    },
                },
                legend: {
                    enabled: false
                },
                series: myData,
            });

            return chart;
        },
    };

    Analyses.Charts.GiantTableType = function(filename) {
        var filenameFragment = '';

        var splitFilename = filename.split('.');

        if (splitFilename && splitFilename[splitFilename.length - 3]) {
            filenameFragment = splitFilename[splitFilename.length - 3];
        }

        return filenameFragment;
    };

    Analyses.Charts.GiantTableFactory = function(tableType) {

        var columns = [];

        if (tableType === 'kabat') {

            columns = [
                {
                    title: 'Read identifier',
                },
                {
                    title: 'V gene',
                },
                {
                    title: 'J gene',
                },
                {
                    title: 'D gene',
                },
                {
                    title: 'Sequence similarity',
                },
                {
                    title: 'Out-of-frame junction',
                },
                {
                    title: 'Missing CYS',
                },
                {
                    title: 'Missing TRP/PHE',
                },
                {
                    title: 'Stop Codon?',
                },
                {
                    title: 'Indels Found',
                },
                {
                    title: 'Only Frame-Preserving Indels Found',
                },
                {
                    title: 'CDR3 AA (kabat)',
                },
                {
                    title: 'CDR3 NA (kabat)',
                },
                {
                    title: 'FR1 aligned bases (kabat)',
                },
                {
                    title: 'FR1 base subst. (kabat)',
                },
                {
                    title: 'FR1 AA subst. (kabat)',
                },
                {
                    title: 'FR1 codons with silent mut. (kabat)',
                },
                {
                    title: 'CDR1 aligned bases (kabat)',
                },
                {
                    title: 'CDR1 base subst. (kabat)',
                },
                {
                    title: 'CDR1 AA subst. (kabat)',
                },
                {
                    title: 'CDR1 codons with silent mut. (kabat)',
                },
                {
                    title: 'FR2 aligned bases (kabat)',
                },
                {
                    title: 'FR2 base subst. (kabat)',
                },
                {
                    title: 'FR2 AA subst. (kabat)',
                },
                {
                    title: 'FR2 codons with silent mut. (kabat)',
                },
                {
                    title: 'CDR2 aligned bases (kabat)',
                },
                {
                    title: 'CDR2 base subst. (kabat)',
                },
                {
                    title: 'CDR2 AA subst. (kabat)',
                },
                {
                    title: 'CDR2 codons with silent mut. (kabat)',
                },
                {
                    title: 'FR3 aligned bases (kabat)',
                },
                {
                    title: 'FR3 base subst. (kabat)',
                },
                {
                    title: 'FR3 AA subst. (kabat)',
                },
                {
                    title: 'FR3 codons with silent mut. (kabat)',
                },
                {
                    title: 'Alternate V gene',
                },
                {
                    title: 'Alternate J gene',
                },
                {
                    title: 'Alternate D gene',
                },
                {
                    title: 'Release Version Tag',
                },
                {
                    title: 'Release Version Hash',
                },
            ];
        }
        else if (tableType === 'imgt') {
            columns = [
                {
                    title: 'Read identifier',
                },
                {
                    title: 'V gene',
                },
                {
                    title: 'J gene',
                },
                {
                    title: 'D gene',
                },
                {
                    title: 'Sequence similarity',
                },
                {
                    title: 'Out-of-frame junction',
                },
                {
                    title: 'Missing CYS',
                },
                {
                    title: 'Missing TRP/PHE',
                },
                {
                    title: 'Stop Codon?',
                },
                {
                    title: 'Indels Found',
                },
                {
                    title: 'Only Frame-Preserving Indels Found',
                },
                {
                    title: 'CDR3 AA (imgt)',
                },
                {
                    title: 'CDR3 NA (imgt)',
                },
                {
                    title: 'FR1 aligned bases (imgt)',
                },
                {
                    title: 'FR1 base subst. (imgt)',
                },
                {
                    title: 'FR1 AA subst. (imgt)',
                },
                {
                    title: 'FR1 codons with silent mut. (imgt)',
                },
                {
                    title: 'CDR1 aligned bases (imgt)',
                },
                {
                    title: 'CDR1 base subst. (imgt)',
                },
                {
                    title: 'CDR1 AA subst. (imgt)',
                },
                {
                    title: 'CDR1 codons with silent mut. (imgt)',
                },
                {
                    title: 'FR2 aligned bases (imgt)',
                },
                {
                    title: 'FR2 base subst. (imgt)',
                },
                {
                    title: 'FR2 AA subst. (imgt)',
                },
                {
                    title: 'FR2 codons with silent mut. (imgt)',
                },
                {
                    title: 'CDR2 aligned bases (imgt)',
                },
                {
                    title: 'CDR2 base subst. (imgt)',
                },
                {
                    title: 'CDR2 AA subst. (imgt)',
                },
                {
                    title: 'CDR2 codons with silent mut. (imgt)',
                },
                {
                    title: 'FR3 aligned bases (imgt)',
                },
                {
                    title: 'FR3 base subst. (imgt)',
                },
                {
                    title: 'FR3 AA subst. (imgt)',
                },
                {
                    title: 'FR3 codons with silent mut. (imgt)',
                },
                {
                    title: 'Alternate V gene',
                },
                {
                    title: 'Alternate J gene',
                },
                {
                    title: 'Alternate D gene',
                },
                {
                    title: 'Release Version Tag',
                },
                {
                    title: 'Release Version Hash',
                },
            ];
        }

        return columns;
    };

    Analyses.Charts.GiantTableFormatData = function(data, tableType) {
        var chartData = [];

        var imgtColumns = [
            'Read identifier',
            'V gene',
            'J gene',
            'D gene',
            'V Sequence similarity',
            'Out-of-frame junction',
            'Missing CYS',
            'Missing TRP/PHE',
            'Stop Codon?',
            'Indels Found',
            'Only Frame-Preserving Indels Found',
            'CDR3 AA (imgt)',
            'CDR3 NA (imgt)',
            'FR1 aligned bases (imgt)',
            'FR1 base subst. (imgt)',
            'FR1 AA subst. (imgt)',
            'FR1 codons with silent mut. (imgt)',
            'CDR1 aligned bases (imgt)',
            'CDR1 base subst. (imgt)',
            'CDR1 AA subst. (imgt)',
            'CDR1 codons with silent mut. (imgt)',
            'FR2 aligned bases (imgt)',
            'FR2 base subst. (imgt)',
            'FR2 AA subst. (imgt)',
            'FR2 codons with silent mut. (imgt)',
            'CDR2 aligned bases (imgt)',
            'CDR2 base subst. (imgt)',
            'CDR2 AA subst. (imgt)',
            'CDR2 codons with silent mut. (imgt)',
            'FR3 aligned bases (imgt)',
            'FR3 base subst. (imgt)',
            'FR3 AA subst. (imgt)',
            'FR3 codons with silent mut. (imgt)',
            'Alternate V gene',
            'Alternate J gene',
            'Alternate D gene',
            'Release Version Tag',
            'Release Version Hash',
        ];

        var kabatColumns = [
            'Read identifier',
            'V gene',
            'J gene',
            'D gene',
            'V Sequence similarity',
            'Out-of-frame junction',
            'Missing CYS',
            'Missing TRP/PHE',
            'Stop Codon?',
            'Indels Found',
            'Only Frame-Preserving Indels Found',
            'CDR3 AA (kabat)',
            'CDR3 NA (kabat)',
            'FR1 aligned bases (kabat)',
            'FR1 base subst. (kabat)',
            'FR1 AA subst. (kabat)',
            'FR1 codons with silent mut. (kabat)',
            'CDR1 aligned bases (kabat)',
            'CDR1 base subst. (kabat)',
            'CDR1 AA subst. (kabat)',
            'CDR1 codons with silent mut. (kabat)',
            'FR2 aligned bases (kabat)',
            'FR2 base subst. (kabat)',
            'FR2 AA subst. (kabat)',
            'FR2 codons with silent mut. (kabat)',
            'CDR2 aligned bases (kabat)',
            'CDR2 base subst. (kabat)',
            'CDR2 AA subst. (kabat)',
            'CDR2 codons with silent mut. (kabat)',
            'FR3 aligned bases (kabat)',
            'FR3 base subst. (kabat)',
            'FR3 AA subst. (kabat)',
            'FR3 codons with silent mut. (kabat)',
            'Alternate V gene',
            'Alternate J gene',
            'Alternate D gene',
            'Release Version Tag',
            'Release Version Hash',
        ];

        var selectedColumns = [];

        if (tableType === 'imgt') {
            selectedColumns = imgtColumns;
        }
        else if (tableType === 'kabat') {
            selectedColumns = kabatColumns;
        }

        for (var i = 0; i < data.length; i++) {

            var dataSet = [];

            for (var j = 0; j < selectedColumns.length; j++) {
                if (data[i].hasOwnProperty(selectedColumns[j])) {
                    dataSet.push(data[i][selectedColumns[j]]);
                }
            }

            chartData.push(dataSet);
        }

        return chartData;
    };

    Analyses.Charts.GiantTable = function(fileHandle, tsv, classSelector) {

        var width = $('.' + classSelector).width();
        var height = $('.' + classSelector).height();

        d3.select('.' + classSelector)
            .attr('style',
                d3.select('.' + classSelector).attr('style') + ';'
                + 'width:'  + (+width) + 'px;'
                + 'height:' + (+height) + 'px;'
            )
        ;

        var tableType = Analyses.Charts.GiantTableType(fileHandle.get('name'));
        var rawData = d3.tsv.parse(tsv);

        var columns = Analyses.Charts.GiantTableFactory(tableType);
        var chartData = Analyses.Charts.GiantTableFormatData(rawData, tableType);

        $('.' + classSelector).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="giant-table"></table>');

        $('#giant-table').dataTable({
            'data': chartData,
            'columns': columns,
        });
    };

    Analyses.Charts.Composition = function(isComparison, chartData, classSelector) {

        $('#chart-right-announcement').text('Click to toggle displayed data.');

        var myData = [];
        for (var group in chartData) {
            // eliminate comment lines
            var response = chartData[group].replace(/^[##][^\r\n]+[\r\n]+/mg, '');

            var data = d3.tsv.parse(response);
            var aData = [];
            var cData = [];
            var gData = [];
            var tData = [];
            var nData = [];
            var gcData = [];

            data.forEach(function(d) {
                aData.push({
                    x: +d['position'],
                    y: +d['A%'],
                });

                cData.push({
                    x: +d['position'],
                    y: +d['C%'],
                });

                gData.push({
                    x: +d['position'],
                    y: +d['G%'],
                });

                tData.push({
                    x: +d['position'],
                    y: +d['T%'],
                });

                nData.push({
                    x: +d['position'],
                    y: +d['N%'],
                });

                gcData.push({
                    x: +d['position'],
                    y: +d['GC%'],
                });
            });

            var name = '';
            if (isComparison) {
                if (group == 'pre') {
                    name = 'Pre-filter ';
                } else {
                    name = 'Post-filter ';
                }
            }

            myData.push({
                    key: name + 'A%',
                    values: aData,
                    disabled: true,
                    color: 'red',
            });
            myData.push({
                    key: name + 'C%',
                    values: cData,
                    disabled: true,
                    color: 'blue',
            });
            myData.push({
                    key: name + 'G%',
                    values: gData,
                    disabled: true,
                    color: 'black',
            });
            myData.push({
                    key: name + 'T%',
                    values: tData,
                    disabled: true,
                    color: 'green',
            });
            myData.push({
                    key: name + 'N%',
                    values: nData,
                    disabled: false,
                    color: 'purple',
            });
            myData.push({
                    key: name + 'GC%',
                    values: gcData,
                    disabled: true,
                    color: 'orange',
            });
        }

        nv.addGraph(function() {
            var chart = nv.models.lineChart()
                .margin({left: 100, right: 50})  //Adjust chart margins to give the x-axis some breathing room.
                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                .transitionDuration(350)  //how fast do you want the lines to transition?
                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                .showYAxis(true)        //Show the y-axis
                .showXAxis(true)        //Show the x-axis
            ;

            chart.xAxis     //Chart x-axis settings
                .axisLabel('Read Position')
                .tickFormat(d3.format(',r'))
            ;

            chart.yAxis     //Chart y-axis settings
                .axisLabel('Percent')
                .tickFormat(d3.format(',r'))
            ;

            /* Done setting the chart up? Time to render it!*/
            //d3.select('.svg-container svg')    //Select the <svg> element you want to render the chart in.
            d3.select('.' + classSelector + ' svg')    //Select the <svg> element you want to render the chart in.
                .datum(myData)
                .call(chart)    //Finally, render the chart!
            ;

            //Update the chart when window resizes.
            nv.utils.windowResize(function() {
                chart.update();
            });

            return chart;
        });
    };

    App.Views.Analyses = Analyses;
    return Analyses;
});
