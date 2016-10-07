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
        },
        serialize: function() {
            return {
                jobs: this.paginatedJobs.toJSON(),
                projectUuid: this.projectUuid,
                paginationSets: this.paginationSets,
            };
        },
        fetchJobs: function() {
            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView(loadingView);
            loadingView.render();

            var that = this;

            var pendingJobs = new Backbone.Agave.Collection.Jobs.Pending();
            pendingJobs.projectUuid = this.projectUuid;

/*
            pendingJobs.fetch()
              .then(function() {
                  return that.jobs.fetch();
              }
              .then
*/

            $.when(this.jobs.fetch(), pendingJobs.fetch())
                // Add VDJ API pending jobs to Agave jobs
                .then(function() {
                    that.jobs.add(pendingJobs.toJSON());
                })
                .then(function() {
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
                    loadingView.remove();
                    that.render();

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

            this.collection = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: this.jobId});

            this.analysisCharts = [];
            this.chartViews = [];

            var that = this;

            this.jobDetail.fetch()
                .then(function() {
                    return that.collection.fetch();
                })
                .done(function() {

                    // check for process metadata
                    var processMetadataFile = that.collection.getProcessMetadataFile();
                    if (processMetadataFile) {
                        processMetadataFile.downloadFileToCache()
                            .then(function(tmpFileData) {
                                try {
                                    that.processMetadata = JSON.parse(tmpFileData);

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

                                    }
                                } catch (error) {
                                    // TODO
                                } finally {
                                    loadingView.remove();
                                    that.render();
                                }
                            })
                    } else {
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
                jobDetail: this.jobDetail.toJSON(),
                projectFiles: this.collection.getProjectFileOutput().toJSON(),
                //chartFiles: this.collection.getChartFileOutput().toJSON(),
                logFiles: this.collection.getLogFileOutput().toJSON(),
                analysisCharts: this.analysisCharts,

                //outputFiles: this.collection.toJSON(),
                canDownloadFiles: this.canDownloadFiles,
                projectUuid: this.projectUuid,
            };
        },
        events: {
            //'click .show-chart': 'showChart',
            //'click .hide-chart': 'hideChart',

            'click .show-log': 'showLog',
            'click .hide-log': 'hideLog',

            //'click .download-chart': 'downloadChart',
            'click .download-file': 'downloadFile',

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

            var uuid = e.target.dataset.id;

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
            this.hideWarning();
            $('#chart-legend').hide();

            var that = this;

            var fileHandle = this.collection.get(uuid);
            var value = fileHandle.get('value');

            var chartType = Backbone.Agave.Model.Job.Detail.getChartType(value.name);

            var fileData;

            fileHandle.downloadFileToCache()
            .then(function(tmpFileData) {
                fileData = tmpFileData;
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

                switch (chartType) {
                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_0:
                        $('#chart-legend').show();
                        Analyses.Charts.Composition(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_1:
                        $('#chart-legend').show();
                        Analyses.Charts.PercentageGcHistogram(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_3:
                        $('#chart-legend').show();
                        Analyses.Charts.LengthHistogram(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_4:
                        Analyses.Charts.MeanQualityScoreHistogram(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_5:
                        Analyses.Charts.QualityScore(fileHandle, fileData, classSelector, that.chartHeight);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_6:
                        Analyses.Charts.GiantTable(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_7:
                        Analyses.Charts.Cdr3(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_8:
                        Analyses.Charts.GeneDistribution(fileHandle, fileData, classSelector);
                        break;

                    default:
                        break;
                }

                // Scroll down to chart
                $('html, body').animate({
                    scrollTop: $('.' + classSelector).offset().top
                }, 1000);
            })
            .fail(function(response) {
                var errorMessage = this.getErrorMessageFromResponse(response);
                this.showWarning(errorMessage);
            })
            ;
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

            this._uiBeginChartLoading(e.target);

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

                    that._uiEndChartLoading();

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
        downloadChart: function(e) {

            var that = this;

            var chartClassSelector = e.target.dataset.chartClassSelector;

            var filename = e.target.dataset.id;
            filename = filename.split('.');
            filename.pop();
            filename = filename.join('.');

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

                    var blob = new Blob([svgString], {type: 'text/plain;charset=utf-8'});
                    saveAs(blob, filename + '.svg');
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
        toggleLegend: function() {
            $('.nv-legendWrap').toggle();
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
                      var filename = pm.files[fileKey]['composition'];
                      var fileHandle = this.selectAnalyses.collection.getFileByName(filename);
                      if (!fileHandle) this.isValid = false;
                  }
                  if ((key == 'pre')  && (pm.groups[this.groupId][key]['type'] == 'statistics')) {
                      this.isValid = true;
                      this.isComparison = true;
                      var fileKey = pm.groups[this.groupId][key]['files'];
                      var filename = pm.files[fileKey]['composition'];
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
                    { id: 'heat_map', name: 'Heatmap' },
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
            'click .download-file': 'downloadFile',

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
/*
                switch (chartType) {
                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_0:
                        $('#chart-legend').show();
                        Analyses.Charts.Composition(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_1:
                        $('#chart-legend').show();
                        Analyses.Charts.PercentageGcHistogram(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_3:
                        $('#chart-legend').show();
                        Analyses.Charts.LengthHistogram(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_4:
                        Analyses.Charts.MeanQualityScoreHistogram(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_5:
                        Analyses.Charts.QualityScore(fileHandle, fileData, classSelector, that.chartHeight);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_6:
                        Analyses.Charts.GiantTable(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_7:
                        Analyses.Charts.Cdr3(fileHandle, fileData, classSelector);
                        break;

                    case Backbone.Agave.Model.Job.Detail.CHART_TYPE_8:
                        Analyses.Charts.GeneDistribution(fileHandle, fileData, classSelector);
                        break;

                    default:
                        break;
                }
*/

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
                    var preName = pm.files[fileKey][chartId];
                    fileKey = pm.groups[this.groupId]['post']['files'];
                    var postName = pm.files[fileKey][chartId];
                    filenames = { pre: preName, post: postName };
                } else {
                    var fileKey = pm.groups[this.groupId]['stats']['files'];
                    var statsName = pm.files[fileKey][chartId];
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

    Analyses.Charts.GeneDistribution = function(fileHandle, text, classSelector) {

        var distribution = JSON.parse(text);
        // build series
        var series = {
          id: distribution.label,
          name: distribution.label,
          data: new Array()
        };

        _.each(distribution.children, function(gene){
          series.data.push({
            id: 'parent',
            name: gene.label,
            y: gene.value,
            drilldown: gene.label,
            color: '#7B94B5'
          });
        });

        // build drilldown
        var drilldown = {
          series: new Array()
        };

        // drilldown level 1
        _.each(distribution.children, function(gene){
          var data = [];
          _.each(gene.children, function(geneChild){
            data.push({
              id: 'child',
              name: geneChild.label,
              y: geneChild.value,
              drilldown: geneChild.label,
              color: '#7B94B5'
            });
          });
          drilldown.series.push({
            id: gene.label,
            name: gene.label,
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
                y: geneGrandchild.value,
                alleles: geneGrandchild.children
              });
            });
            drilldown.series.push({
              id: geneChild.label,
              name: geneChild.label,
              data: data
            });
          });
        });

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
                    text: ''
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
                          tooltip += '<b>' + allele.label + ': </b>' + Highcharts.numberFormat(allele.value, 2) + '<br/>';

                        });
                      }
                    }
                  }
                  return tooltip;
                }
            },
            series: [series],
            drilldown: drilldown
          });
    };

    Analyses.Charts.Cdr3 = function(fileHandle, text, classSelector) {

        // Data Formatting
        var cdr3Data = d3.tsv.parse(text);

        var imgtData = [];
        var kabatData = [];

        for (var i = 0; i < cdr3Data.length; i++) {
            var length = cdr3Data[i]['CDR3_LENGTH'];
            var imgtDataPoint = cdr3Data[i]['imgt'];
            var kabatDataPoint = cdr3Data[i]['kabat'];

            // 27/May/2015 - Small hack to fix legacy charts with incorrect x-axis data.
            // Apparently cdr3 charts should never include -1 x-axis values,
            // and our older versions of IgBlast wrappers have been including -1 values.
            if (length === '-1') {
                continue;
            }

            var imgtStanza = {
                'x': length,
                'y': parseInt(imgtDataPoint),
            };

            var kabatStanza = {
                'x': length,
                'y': parseInt(kabatDataPoint),
            };

            imgtData.push(imgtStanza);
            kabatData.push(kabatStanza);
        }

        cdr3Data = [
            {
                key: 'IMGT',
                values: imgtData,
            },
            {
                key: 'Kabat',
                values: kabatData,
            },
        ];

        // Begin Chart Code
        nv.addGraph(function() {
            var chart = nv.models.multiBarChart()
                .transitionDuration(350)
                .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
                .rotateLabels(0)      //Angle to rotate x-axis labels.
                .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                .tooltips(true)
                .groupSpacing(0.1)    //Distance between each group of bars.
                .margin({left: 100})
            ;

            chart.xAxis
                .axisLabel('CDR3 Length')
                .tickFormat(d3.format(',f'))
            ;

            chart.yAxis
                .axisLabel('Read Count')
                .tickFormat(d3.format(',.1f'))
            ;

            d3.select('.' + classSelector + ' svg')
                .datum(cdr3Data)
                .call(chart)
            ;

            nv.utils.windowResize(function() {
                chart.update();
            });

            return chart;
        });
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
