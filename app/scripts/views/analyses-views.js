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
    'file-download-detection-mixin',
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
    FileDownloadDetectionMixin,
    Highcharts
) {

    'use strict';

    HandlebarsUtilities.registerRawPartial(
        'shared-fragments/file-downloads-unsupported',
        'file-downloads-unsupported'
    );

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
            this.projectUuid = parameters.projectUuid;

            this.jobMetadatas = new Backbone.Agave.Collection.Jobs.Listings({projectUuid: this.projectUuid});

            this.jobs = new Backbone.Agave.Collection.Jobs();

            this.paginationSets = 0;
            this.paginationIterator = 10;

            this.currentPaginationSet = 1;
            this.maxPaginationSet = 1;

            this.fetchJobMetadatas();
        },
        events: {
            'click .job-pagination-previous': 'jobPaginationPrevious',
            'click .job-pagination-next': 'jobPaginationNext',
            'click .job-pagination': 'jobPaginationIndex',
            'click .view-config': 'viewConfig',
        },
        serialize: function() {
            return {
                jobs: this.jobs.toJSON(),
                projectUuid: this.projectUuid,
                paginationSets: this.paginationSets,
            };
        },
        fetchJobMetadatas: function() {
            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView(loadingView);
            loadingView.render();

            var that = this;

            this.jobMetadatas.fetch()
                .always(function() {
                    loadingView.remove();
                    that.render();
                })
                .done(function() {
                    that.calculatePaginationSets();
                    that.fetchPaginatedJobModels();
                })
                .fail(function(error) {

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Collection.Jobs.Listings().save()');
                    telemetry.set('view', 'Analyses.OutputList');
                    telemetry.save();
                });
        },
        _handleJobStatusUpdate: function(jobStatusUpdate) {

            $('#job-status-' + jobStatusUpdate.jobId).html(jobStatusUpdate.jobStatus);

            if (jobStatusUpdate.jobStatus === 'FINISHED') {
                this.render();
            }
        },
        calculatePaginationSets: function() {
            var tmpPaginationSets = Math.ceil(this.jobMetadatas.models.length / this.paginationIterator);

            this.paginationSets = [];
            for (var i = 1; i < tmpPaginationSets + 1; i++) {
                this.paginationSets.push(i);
            }

            this.maxPaginationSet = _.last(this.paginationSets);
        },
        fetchPaginatedJobModels: function() {
            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView(loadingView);
            loadingView.render();

            var that = this;

            var jobModels = [];

            var indexLimit = this.getIndexLimit();
            var currentIndex = this.getCurrentIndex();

            // Create empty job models and set ids for all job listing results
            for (var i = currentIndex; i < indexLimit; i++) {

                var job = new Backbone.Agave.Model.Job.Detail({
                    id: this.jobMetadatas.at([i]).get('value').jobUuid,
                });

                jobModels.push(job);
            }

            if (jobModels.length === 0) {
                loadingView.remove();
                this.render();

                return;
            }

            this.jobs = new Backbone.Agave.Collection.Jobs();

            /*
                30/July/2015

                This is a hack to fetch all jobs without stopping for errors.
                The Agave jobs endpoint is throwing a 404/400 for some fetches,
                and this was causing errors to propagate through fetches using
                promise arrays. So, this workaround guarantees that any
                successful fetches will bind data back onto models.
            */
            var deferred = $.Deferred();
            var counter = 0;

            jobModels.forEach(function(jobModel) {
                jobModel.fetch()
                    .always(function() {
                        that.jobs.add(jobModel);
                        counter++;

                        if (counter === jobModels.length) {
                            deferred.resolve();
                        }
                    })
                    ;
            })
            ;

            $.when(deferred)
                .always(function() {
                    for (var i = 0; i < jobModels.length; i++) {

                        // check for websockets
                        var job = that.jobs.get(jobModels[i]);

                        if (_.has(job, 'get') && job.get('status') !== 'FINISHED' && job.get('status') !== 'FAILED') {

                            App.Instances.WebsocketManager.subscribeToEvent(job.get('id'));

                            that.listenTo(
                                App.Instances.WebsocketManager,
                                'jobStatusUpdate',
                                that._handleJobStatusUpdate
                            );
                        }
                    }

                    loadingView.remove();
                    that.render();

                    that.uiSetActivePaginationSet();
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(error));
                    telemetry.set('method', 'Backbone.Agave.Model.Job.Detail().fetch()');
                    telemetry.set('view', 'Analyses.OutputList');
                    telemetry.save();
                })
                ;
        },

        getIndexLimit: function() {

            // Index limit should never go above max model count
            var indexLimit = Math.min(
                this.paginationIterator * this.currentPaginationSet,
                this.jobMetadatas.models.length
            );

            return indexLimit;
        },

        getCurrentIndex: function() {

            // The current index should be the beginning of the current pagination set
            var currentIndex = (this.currentPaginationSet * this.paginationIterator) - this.paginationIterator;

            return currentIndex;
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

            if (this.currentPaginationSet - 1 >= 1) {

                this.currentPaginationSet -= 1;
                this.fetchPaginatedJobModels();
            }
        },

        jobPaginationNext: function(e) {
            e.preventDefault();

            if (this.currentPaginationSet + 1 <= this.maxPaginationSet) {
                this.currentPaginationSet += 1;
                this.fetchPaginatedJobModels();
            }
        },

        jobPaginationIndex: function(e) {
            e.preventDefault();

            this.currentPaginationSet = parseInt(e.target.dataset.id);

            this.fetchPaginatedJobModels();
        },

        uiSetActivePaginationSet: function() {
            $('.job-pagination-wrapper').removeClass('active');
            $('.job-pagination-previous').removeClass('disabled');
            $('.job-pagination-next').removeClass('disabled');

            $('.job-pagination-wrapper-' + this.currentPaginationSet).addClass('active');

            if (this.currentPaginationSet === 1) {
                $('.job-pagination-previous').addClass('disabled');
            }

            if (this.currentPaginationSet === this.maxPaginationSet) {
                $('.job-pagination-next').addClass('disabled');
            }
        },

    });

    Analyses.SelectAnalyses = Backbone.View.extend(
        _.extend({}, FileDownloadDetectionMixin, {
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

                var that = this;

                this.jobDetail.fetch()
                    .then(function() {
                        return that.collection.fetch();
                    })
                    .done(function() {
                        loadingView.remove();
                        that.render();
                    })
                    .fail(function(error) {
                        var telemetry = new Backbone.Agave.Model.Telemetry();
                        telemetry.set('error', JSON.stringify(error));
                        telemetry.set('method', 'Backbone.Agave.Collection.Jobs.OutputFiles().fetch()');
                        telemetry.set('view', 'Analyses.SelectAnalyses');
                        telemetry.save();
                    })

                // Blob Save Detection
                this._setDownloadCapabilityDetection();
            },
            serialize: function() {
                return {
                    jobDetail: this.jobDetail.toJSON(),
                    projectFiles: this.collection.getProjectFileOutput().toJSON(),
                    chartFiles: this.collection.getChartFileOutput().toJSON(),
                    logFiles: this.collection.getLogFileOutput().toJSON(),

                    //outputFiles: this.collection.toJSON(),
                    canDownloadFiles: this.canDownloadFiles,
                    projectUuid: this.projectUuid,
                };
            },
            events: {
                'click .show-chart': 'showChart',
                'click .hide-chart': 'hideChart',

                'click .show-log': 'showLog',
                'click .hide-log': 'hideLog',

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

                var filename = e.target.dataset.id;

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

                var fileHandle = this.collection.get(filename);

                var chartType = Backbone.Agave.Model.Job.Detail.getChartType(filename);

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

                var filename = e.target.dataset.id;

                var classSelector = chance.string({
                    pool: 'abcdefghijklmnopqrstuvwxyz',
                    length: 15,
                });

                $(e.target.closest('tr')).after(
                    '<tr id="chart-tr-' + classSelector  + '" style="height: 0px;">'
                        + '<td colspan=3>'
                            + '<div id="' + classSelector + '" class="text-left ' + classSelector + '" style="word-break: break-all;">'
                            + '</div>'
                        + '</td>'
                    + '</tr>'
                );

                $(e.target).addClass('hidden');
                $(e.target).prev('.hide-log').removeClass('hidden');

                var that = this;

                var fileHandle = this.collection.get(filename);

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
                        telemetry.set('error', JSON.stringify(errorMessage));
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

                var filename = e.target.dataset.filename;
                var outputFile = this.collection.get(filename);

                outputFile.downloadFileToDisk()
                    .fail(function(error) {
                          var telemetry = new Backbone.Agave.Model.Telemetry();
                          telemetry.set('error', JSON.stringify(error));
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
        })
    );

    Analyses.Charts.LengthHistogram = function(fileHandle, text, classSelector) {

        //remove commented out lines (header info)
        text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

        var data = d3.tsv.parse(text);
        var otherD = [];
        data.forEach(function(d) {
            otherD.push({
                x: +d['read_length'],
                y: +d['count'],
            });
        });

        var myData = [{
            key: 'Sequence Length',
            values: otherD,
        }];

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

    Analyses.Charts.MeanQualityScoreHistogram = function(fileHandle, text, classSelector) {

        //remove commented out lines (header info)
        text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

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
                    for (var i = 0, length = this.series.points.length; i < length; i++) {
                        var point = this.series.points[i];
                        if (point.series.name === 'Median Score') {
                            tooltip = '<b>Median Score: </b>' + xMedian['read_quality'] + '<br/>';
                        }
                        if (point.series.name === 'Quality Score') {
                            if (this.y === 0) {
                                tooltip = '<b>Quality Read: </b>' + this.x + '<br/>' +
                                    '<b>Read Count: </b>' + this.y + '<br/>' +
                                    '<b>Median Score: </b> 0';
                            } else {
                                tooltip = '<b>Quality Read: </b>' + this.x + '<br/>' +
                                    '<b>Read Count: </b>' + this.y + '<br/>' +
                                    '<b>Median Score: </b>' + xMedian['read_quality'];
                            }

                        }
                    }
                    return tooltip;
                }
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
            },

            series: [{
                name: 'Median Score',
                data: medianScore,
                pointStart: 1,
                color: '#6EB76A',
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 0
                }
            }, {
                name: 'Quality Score',
                data: qualityScore,
                color: '#2A7EB8',
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 0
                }
            }]
        });
    };

    Analyses.Charts.QualityScore = function(fileHandle, text, classSelector, chartHeight) {

      //remove commented out lines (header info)
      text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

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

      var chart = new Highcharts.StockChart({
        chart: {
            renderTo: classSelector,
            panning: true,
            style: {
                fontFamily: 'Arial',
            },
        },

        title: {
            text: 'Quality Scores',
            style: {
                color: '#000000',
                fontSize: '12px'
            }
        },

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

                var tooltip = '';

                for (var i = 0, length = this.points.length; i < length; i++) {
                    var point = this.points[i];

                    if (this.points[i].series.name === 'Series 4') {
                        tooltip = '<b>Read position: <b>' + this.x + '<br/>' +
                            '<b>90%: <b>' + this.points[i].series.options.data[i][4] + '<br/>' +
                            '<b>75%: <b>' + this.points[i].series.options.data[i][3] + '<br/>' +
                            '<b>50%: <b>' + this.points[i].series.options.data[i][2] + '<br/>' +
                            '<b>25%: <b>' + this.points[i].series.options.data[i][1] + '<br/>' +
                            '<b>10%: <b>' + this.points[i].series.options.data[i][0] + '<br/>';
                    }
                    if (this.points[i].series.name === 'Series 5') {
                        tooltip += '<b>Mean: <b>' + point.series.options.data[this.x] + '<br/>';
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

        yAxis: {
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
        },


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

        series: [{
            type: 'area',
            data: backgroundTop,
            color: '#CEFCDB',
            stack: 0,
        }, {
            type: 'area',
            data: backgroundMiddle,
            color: '#FCFCCE',
            stack: 0,
        }, {
            type: 'area',
            data: backgroundBottom,
            color: '#F4D7D8',
            stack: 0,
        }, {
            type: 'boxplot',
            data: boxPlot,
        }, {
            type: 'spline',
            data: mean,
            marker: {
                enabled: true,
                radius: 2,
                symbol: 'circle'
            },
            color: '#FB000D',
        }, {
            // dummy series needed to obtain a continous xAxis with navigator in place
            type: 'line',
            data: categories,
            visible: false,
        }]
      });
      chart.xAxis[0].setExtremes(0, 20);
    };

    Analyses.Charts.PercentageGcHistogram = function(fileHandle, text, classSelector) {

        //remove commented out lines (header info)
        text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

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

        var myData = [{
            key: 'Mean GC %',
            values: otherD,
        }];

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

    Analyses.Charts.Composition = function(fileHandle, response, classSelector) {

        $('#chart-right-announcement').text('Click to toggle displayed data.');

        response = response.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

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

        var myData = [
            {
                key: 'A%',
                values: aData,
                disabled: true,
                color: 'red',
            },
            {
                key: 'C%',
                values: cData,
                disabled: true,
                color: 'blue',
            },
            {
                key: 'G%',
                values: gData,
                disabled: true,
                color: 'black',
            },
            {
                key: 'T%',
                values: tData,
                disabled: true,
                color: 'green',
            },
            {
                key: 'N%',
                values: nData,
                disabled: false,
                color: 'purple',
            },
            {
                key: 'GC%',
                values: gcData,
                disabled: true,
                color: 'orange',
            },
        ];

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
