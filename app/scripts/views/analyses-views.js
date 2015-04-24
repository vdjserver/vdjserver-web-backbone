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
    'file-transfer-sidebar-ui-mixin',
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
    FileTransferSidebarUiMixin
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
                .done(function() {
                    that.calculatePaginationSets();
                    that.fetchPaginatedJobModels();
                })
                .fail(function() {
                });
        },
        _handleJobStatusUpdate: function(jobStatusUpdate) {

            $('#job-status-' + jobStatusUpdate.jobId).html(jobStatusUpdate.jobStatus);

            if (jobStatusUpdate.jobStatus === 'FINISHED') {
                this.render();
            }
        },
        calculatePaginationSets: function() {
            var tmpPaginationSets = Math.round(this.jobMetadatas.models.length / this.paginationIterator);

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

            // Do async fetch on all individual models
            var jobFetches = _.invoke(jobModels, 'fetch');

            this.jobs = new Backbone.Agave.Collection.Jobs();

            $.when.apply($, jobFetches).always(function() {
                for (var i = 0; i < jobModels.length; i++) {

                    that.jobs.add(jobModels[i]);

                    // check for websockets
                    var job = that.jobs.get(jobModels[i]);

                    if (job.get('status') !== 'FINISHED' && job.get('status') !== 'FAILED') {
                        if (_.findIndex(App.Instances.Websockets, job.get('id'))) {

                            var factory = new App.Websockets.Jobs.Factory();
                            var websocket = factory.getJobWebsocket();
                            websocket.connectToServer();
                            websocket.subscribeToJob(job.get('id'));

                            // Store in global namespace so other views can reuse this
                            App.Instances.Websockets[job.get('id')] = websocket;
                        }

                        that.listenTo(
                            App.Instances.Websockets[job.get('id')],
                            'jobStatusUpdate',
                            that._handleJobStatusUpdate
                        );
                    }
                }

                loadingView.remove();
                that.render();

                that.uiSetActivePaginationSet();
            });
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
        _.extend({}, FileDownloadDetectionMixin, FileTransferSidebarUiMixin, {
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
                    .fail(function() {

                    })
                    ;

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
                'click .show-log': 'showLog',

                'click .download-chart': 'downloadChart',
                'click .download-file': 'downloadFile',

                'click .toggle-legend-btn': 'toggleLegend',
            },
            showChart: function(e) {
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
                            + '<div id="' + classSelector + '" class="svg-container ' + classSelector + '">'
                                + '<svg style="height: 0px;" version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
                            + '</div>'
                            + '<div class="' + classSelector + '-d3-tip d3-tip hidden"></div>'
                        + '</td>'
                    + '</tr>'
                );

                // Select current button
                $(e.target).addClass('btn-success');

                // Enable download button
                $(e.target).nextAll('.download-chart').removeClass('hidden');
                $(e.target).nextAll('.download-chart').attr('data-chart-class-selector', classSelector);

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
                        height: that.chartHeight + 'px',
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
                            $('#chart-legend').show();
                            Analyses.Charts.MeanQualityScoreHistogram(fileHandle, fileData, classSelector);
                            break;

                        case Backbone.Agave.Model.Job.Detail.CHART_TYPE_5:

                            $('#' + classSelector).css({
                                'position': 'absolute',
                                'width': '100%',
                                'overflow-x': 'scroll',
                            });

                            $('.' + classSelector).mouseenter(function(e) {
                                $('.' + classSelector + '-d3-tip').removeClass('hidden');
                            });

                            $('.' + classSelector).mouseleave(function(e) {
                                $('.' + classSelector + '-d3-tip').addClass('hidden');
                            });

                            $('#chart-legend').show();
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
                            + '<div id="' + classSelector + '" class="text-left ' + classSelector + '">'
                            + '</div>'
                        + '</td>'
                    + '</tr>'
                );

                // Select current button
                $(e.target).addClass('btn-success');

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
                        var errorMessage = this.getErrorMessageFromResponse(response);
                        this.showWarning(errorMessage);
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

                var chance = new Chance();
                var fileUniqueIdentifier = chance.guid();

                this._setListMenuFileTransferView(
                    this.projectUuid,
                    fileUniqueIdentifier,
                    filename
                );

                // Agave won't provide the length header on the download, but we
                // can retrieve this now and use this instead.
                var totalSize = outputFile.get('length');

                var that = this;

                var xhr = outputFile.downloadFileToDisk();

                xhr.addEventListener(
                    'progress',
                    function(progress) {

                        var percentCompleted = 0;

                        if (progress.lengthComputable) {
                            percentCompleted = progress.loaded / progress.total;
                        }
                        else {
                            percentCompleted = progress.loaded / totalSize;
                        }

                        percentCompleted *= 100;

                        that._uiSetUploadProgress(percentCompleted, fileUniqueIdentifier);
                    },
                    false
                );

                xhr.addEventListener(
                    'load',
                    function() {
                        that._uiSetSidemenuTransferSuccess(fileUniqueIdentifier);
                    },
                    false
                );
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
                .axisLabel('Count')
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

        var data = d3.tsv.parse(text);
        var otherD = [];
        var medianD = [];
        var nonZeroCount = [];
        data.forEach(function(d) {
            if (+d['count'] !== 0) {
                nonZeroCount.push(+d['count']);
            }
            otherD.push({
                x: +d['read_quality'],
                y: +d['count'],
            });
        });

        var medianCount = ss.median(nonZeroCount);
        data.forEach(function(d) {
            medianD.push({
                x: +d['read_quality'],
                y: medianCount,
            });
        });

        var myData = [
            {
                key: 'Quality Score',
                values: otherD,
            },
            {
                key: 'Median Score',
                values: medianD,
                color: '#5CB85C',
            },
        ];

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
                .axisLabel('Average Quality per read')
                .tickFormat(d3.format(',r'))
            ;

            chart.yAxis     //Chart y-axis settings
                .axisLabel('Count')
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

    Analyses.Charts.QualityScore = function(fileHandle, text, classSelector, chartHeight) {

        var margin = {
            top: 20,
            right: -100,
            bottom: 0,
            left: 100,
        };

        // NOTE: we may need to calculate a suitable value for this from data
        // if it turns out that it has more of a range than this
        var maxWidth = 5000;

        // Update chart container for new width
        $('#' + classSelector + ' svg').css({'width': maxWidth + 'px'});

        var width = maxWidth //1200
                  - margin.left
                  - margin.right
                  ;

        var height = chartHeight - (chartHeight / 4);
        console.log('height is: ' + height);

        var min = Infinity;
        var max = -Infinity;

        //remove commented out lines (header info)
        text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

        var tsv = d3.tsv.parse(text);
        var data = [];
        tsv.forEach(function(d) {
            data.push({
                position: +d['position'],
                mean: +d['mean'],
                '10%': +d['10%'],
                '25%': +d['25%'],
                '50%': +d['50%'],
                '75%': +d['75%'],
                '90%': +d['90%'],
            });

            var rowMax = +d['90%'];
            var rowMin = +d['10%'];

            if (rowMax > max) {
                max = rowMax;
            }

            if (rowMin < min) {
                min = rowMin;
            }
        });

        var chart = box()
            .whiskers([-1, 0])
            .height(height)
            .width(width)
            .domain([min, max])
        ;

        // the x-axis
        var x = d3.scale.ordinal()
            .domain(data.map(function(d) {
                return d['position'];
            }))
            .rangeRoundBands(
                [0, width],
                0.1,
                0
            )
        ;

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
        ;

        // the y-axis
        var y = d3.scale.linear()
            .domain([0, max])
            .range([
                height + margin.top,
                0 + margin.top
            ])
        ;

        //secondary scaling not inverted
        // y0
        d3.scale.linear()
            .domain([0, max])
            .range([
                0 + margin.top,
                height - margin.bottom
            ])
        ;

        //yAxis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
        ;

        var barWidth = x(data[1].position) / 4;

        // SVG
        var svgContainer = d3.select('.' + classSelector + ' svg')
            .attr('width',
                width
                + margin.left
                + margin.right
            )
            .attr('height',
              height
              + margin.top
              + margin.bottom
            )
            .attr('class', 'box')
            ;

        //var tip = d3.select('.d3-tip');
        var tip = d3.select('.' + classSelector + '-d3-tip');

        var boxG = svgContainer.append('g');
        boxG
            .attr('class', 'boxG')
            .attr('width',
                width
                + margin.left
                + margin.right
            )
            .attr('height',
                height
                + margin.left
                + margin.right
            )
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        ;

        var center = boxG.selectAll('line.center')
            .data(data)
        ;

        //vertical line
        center.enter().insert('line', 'rect')
            .attr('class', 'center')
            .attr('x1',  function(d) {
                return x(+d.position) + barWidth / 2;
            })
            .attr('y1', function(d) {
                return y(+d['10%']);
            })
            .attr('x2', function(d) {
                return x(+d.position) + barWidth / 2;
            })
            .attr('y2', function(d) {
                return y(+d['90%']);
            })
        ;

        //add the background boxes
        //add a group
        // var bgGroup = d3.select('svg').append('g')
        var bgGroup = svgContainer.append('g')
            .attr('class', 'bgGroup')
            .attr('width', width
                + margin.left
                + margin.right
            )
            .attr('height', height
                + margin.left
                + margin.right
            )
        ;

        //then add all 3 rectangles
        bgGroup.append('rect')
            .attr('width', width)
            .attr('height', y(0) - y(20))
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + y(20)) + ')')
            .attr('class', 'bg_20')
        ;

        bgGroup.append('rect')
            .attr('width', width)
            .attr('height', y(20) - y(28)) //30
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + y(28)) + ')')
            .attr('class', 'bg_28')
        ;

        bgGroup.append('rect')
            .attr('width', width)
            .attr('height', y(28) - y(max))
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + y(max)) + ')')
            .attr('class', 'bg_40')
        ;

        // var svg = d3.select('svg')
        var svg = svgContainer
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        ;

        // draw the boxplots
        svg.selectAll('.box')
            .data(data)
            .enter().append('g')
            .attr('transform', function(d) {
                return 'translate(' + x(d['position']) + ',' + margin.top + ')';
            })
            .on('mouseover', function(d) {
                /*
                tip.transition()
                    .duration(200)
                    .style('opacity', 0.9)
                ;
                */
                tip
                    .html('Read Position: ' + d.position + '<br/>'
                        + 'Mean: ' + d['mean'] + '<br/>'
                        + '90%: &nbsp;&nbsp;' + d['90%'] + '<br/>'
                        + '75%: &nbsp;&nbsp;' + d['75%'] + '<br/>'
                        + '50%: &nbsp;&nbsp;' + d['50%'] + '<br/>'
                        + '25%: &nbsp;&nbsp;' + d['25%'] + '<br/>'
                        + '10%: &nbsp;&nbsp;' + d['10%'] + '<br/>'
                    )
                    .style('left', window.pageXOffset + 'px')
                    .style('bottom', '120' + 'px')
                    //.style('top', '0px !important')
                    .style('position', 'relative !important')
                ;
            })
            /*
            .on('mouseout', function() {
                tip.transition()
                    .duration(300)
                    .style('opacity', 0);
            })
            */
            .call(chart.width(x.rangeBand()))
            ;

        // add a title
        svg.append('text')
            .attr('x', (width / 2))
            .attr('y', 0 + (margin.top / 2))
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            //.style('text-decoration', 'underline')
            .text('Quality Scores')
        ;

        // draw y axis
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text') // and text1
            .attr('transform', 'rotate(-90), translate(' + -(height / 2) + ',0)')
            .attr('y', -(margin.left / 2))
            .attr('dy', '.51em')
            .style('text-anchor', 'end')
            .style('font-size', '16px')
            .text('Quality')
        ;

        // draw x axis
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (height + margin.top + 1) + ')')
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', function(/*d*/) {
                return 'rotate(-65)';
            });

        // Define the mean line
        var	meanLine = d3.svg.line()								// set 'valueline' to be a line
            .x(function(d) {
                return x(+d.position) + barWidth / 2;
            })
            .y(function(d) {
                return y(+d.mean);
            })
        ;

        // var meanGroup = d3.select('svg').append('g')
        var meanGroup = svgContainer.append('g')
            .attr('class', 'meanGroup')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.left + margin.right)
        ;

        //add meanLine to the chart
        meanGroup.append('path')				// append the valueline line to the 'path' element
            .attr('class', 'line')				// apply the 'line' CSS styles to this path
            .attr('d', meanLine(data))
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.left + margin.right)
            .attr('fill', false)
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        ;

        // add points
        meanGroup.selectAll('circle')
            .data(data)
            .enter().append('circle')
                .attr('cx', function(d) {
                    return x(+d.position) + barWidth / 2;
                })
                .attr('cy', function(d) {
                    return y(+d.mean);
                })
                .attr('r', 3)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('class', 'meanPoints')
        ;
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
                .axisLabel('Mean GC Content %')
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

        var sourceJson = JSON.parse(text);

        var stackStatus = false;

        // this has to be an array
        var drillStack = [sourceJson['label']]; //keep track of drill-down location
        var currentDataset;

        d3.select('.' + classSelector)
            .insert('div', 'svg')
            .attr('id', classSelector + '-stackdiv')
        ;

        //edward salinas
        var getHighestAlleleValueFromAllelicOnlyList = function(aol) {
            var maxa = (1);
            for (var a = 0; a < aol.length; a++) {
                var myRegexp = /\*(\d+)$/;
                var reMatch = myRegexp.exec(aol[a]);
                if (reMatch) {
                    if (maxa < reMatch[1]) {
                        maxa = reMatch[1];
                    }
                }
            }

            return maxa;
        };

        //zero pad a digit string a up to pl digits
        var zeroPadToDigits = function(a, pl) {
            a = a.toString();

            while (a.length < pl) {
                a = '0' + a;
            }

            return a;
        };

        //given a full gene name with allele
        //split it into two parts
        //edward salinas
        var separateGeneAndAllele = function(a) {
            var myRegexp = /(.+)\*(\d+)$/;
            var reMatch = myRegexp.exec(a);
            var toReturn = [];

            if (reMatch) {
                var gene = reMatch[1];
                var allele = reMatch[2];
                toReturn.push(gene);
                toReturn.push(allele);
            }

            return toReturn;
        };

        var findFromLabel = function(o, label) {

            if (o.label && o.label === label) {
                return o;
            }
            else {
                if (o.children !== undefined) {
                    var kids = o.children;
                    for (var k = 0; k < kids.length; k++) {
                        var result = this(kids[k], label);

                        if (result !== null) {
                            return result;
                        }
                    }
                }
            }

            //not in the object, not there at all
            return null;
        };

        //given the entire hierarchy, traverse to the location to
        //find the subhierarchy rooted with the given label/name
        var getHierarchySubHierarchyFromObj = function(o, desiredLabel) {
            if (o.label !== undefined) {

                if (o.label === desiredLabel) {
                    return o;
                }
                else {
                    if (o.children !== undefined) {
                        for (var k = 0; k < o.children.length; k++) {
                            //var particularKidResult = getHierarchySubHierarchyFromObj(o, desiredLabel)
                            var particularKidResult = getHierarchySubHierarchyFromObj(o.children[k], desiredLabel);
                            if (particularKidResult !== null) {
                                return particularKidResult;
                            }
                        }
                    }
                }
            }

            return null;
        };

        var makeChartableFromValidHierarchyObject = function(o) {
            var values = [];
            if (o.children !== undefined) {
                //iterate throuch children
                //for each child, make an object with
                //2(two) items, 'label' and 'value'
                //      {
                //        'label' : 'A' ,
                //        'value' : 29.765957771107
                //      } ,

                var kids = o.children;
                var numKids = kids.length;

                for (var k = 0; k < numKids; k++) {
                    var tempObj = {
                        'label': kids[k].label,
                        'value': kids[k].value,
                    };

                    values.push(tempObj);
                }
            }
            else {
                //no children
                //just use self!
                var singleObj = {
                    'label': o.label,
                    'value': o.value,
                };

                values.push(singleObj);
            }

            var topobj = {
                'key': 'Cumulative Return',
                'values': values,
            };

            var l1 = [];
            l1.push(topobj);
            //l1 'level 1' is the chartable! :)

            return l1;
        };

        //edward salinas
        var getValueReturnZeroAsDefault = function(s, hierarchy) {
            var subtree = getHierarchySubHierarchyFromObj(hierarchy, s);

            if (subtree === null) {
                return 0;
            }
            else {
                return subtree.value;
            }
        };

        //does the tree have children and there's more than zero of them
        //edward salinas
        var doesThisRootHaveChildren = function(o, rootName) {

            var rootedHierarchy = getHierarchySubHierarchyFromObj(o, rootName);

            if (rootedHierarchy.children !== undefined) {
                if (rootedHierarchy.children.length !== 0) {
                    return true;
                }
            }

            return false;
        };

        //edward salinas
        var doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic = function(o, rootName) {
            var rootedHierarchy = getHierarchySubHierarchyFromObj(o, rootName);
            var hasKids = doesThisRootHaveChildren(o, rootName);
            var grandkidsLabels = [];
            var kidsLabels = [];

            if (hasKids) {
                var children = rootedHierarchy.children;
                var c = 0;

                for (c = 0; c < children.length; c++) {
                    var child = children[c];
                    if (child.label !== undefined) {
                        kidsLabels.push(child.label);
                    }

                    if (child.children !== undefined) {
                        var grandchildren = child.children;
                        for (var gc = 0; gc < grandchildren.length; gc++) {
                            grandkidsLabels.push(grandchildren[gc].label);
                        }//for each grandchild
                    }//if a child has children
                    else {
                        return false;
                    }
                }//for children
            }//there are kids
            else {
                return false;
            }

            var cond1 = isAllelicString(rootName);
            var cond2 = areALLStringsInArrayNONAllelic(kidsLabels);
            var cond3 = areALLStringsInArrayAllelic(grandkidsLabels);
            var cond4 = (kidsLabels.length === 0);
            var cond5 = (grandkidsLabels.length === 0);

            if (!cond1 && cond2 && cond3 && !cond4 && !cond5) {
                return true;
            }
            else {
                return false;
            }
        }; //end doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic

        var getGrandChildrenLabelArray = function(o) {
            var gcArray = [];

            if (o.children !== undefined) {
                var children = o.children;

                for (var c = 0; c < children.length; c++) {
                    if (children[c].children !== undefined) {
                        var gKids = children[c].children;

                        for (var g = 0; g < gKids.length; g++) {
                            gcArray.push(gKids[g].label);
                        }
                    }
                }
            }

            return gcArray;
        };

        //rooted somewhere, make a stacked chart table
        //edward salinas
        var makeStackChartableFromValidHierarchyObject = function(o) {
            /*
                It's assumed that the root exists and is non-allelic
                It's assumed that at least one child exists under the root and that it is non-allelic
                It's assumed that all children have hildren and that all these 'grandchildren' are allelic /.+\*\d+/
            */
            var gcLabels = getGrandChildrenLabelArray(o);
            var maxa = getHighestAlleleValueFromAllelicOnlyList(gcLabels);

            //these colors need to go but they can be used for now
            //colorArray = ['#51A351','#BD362F','#11162F'];    //dirty christmas
            var colorArray = ['#aec7e8', '#7b94b5', '#486192'];  //hues of blues

            //colorArray = [' #FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#4B0082','#8F00FF'];
            //rainbow http://suddenwhims.com/2012/10/html-rainbow-color-codes-color-hex/

            var stackDataArray = [];
            var alleleNum = 1;
            var immediateChildren = o.children;

            for (alleleNum = 1; alleleNum <= maxa; alleleNum++) {
                var immediateChildIndex = 0;
                var alleleNumZeroPadded = zeroPadToDigits(alleleNum, 2);

                var objectColorIndex = ((alleleNum - 1) % colorArray.length);
                var color = colorArray[objectColorIndex];
                var key = alleleNumZeroPadded.toString();

                var xList = [];
                var yList = [];
                var values = [];
                for (immediateChildIndex = 0; immediateChildIndex < immediateChildren.length; immediateChildIndex++) {
                    var withStar = immediateChildren[immediateChildIndex].label + '*' + alleleNumZeroPadded;
                    var geneAndAllele = separateGeneAndAllele(withStar);
                    var genex = geneAndAllele[0];
                    var valy = getValueReturnZeroAsDefault(withStar, o);
                    xList.push(genex);
                    yList.push(valy);
                }//for each immediate child

                for (var v = 0; v < xList.length; v++) {
                    var xyObj = {
                        'x': xList[v],
                        'y': parseInt(yList[v]),
                    };

                    values.push(xyObj);
                }

                var keyObj = {
                    'key': key,
                    'color': color,
                    'values': values,
                };

                stackDataArray.push(keyObj);
            }//for each allele up to maximum

            return stackDataArray;
        };

        var isAllelicString = function(s) {
            var allelePattern = /\S\*\d+$/i;

            if (s.match(allelePattern)) {
                return true;
            }
            else {
                return false;
            }
        };

        //edward salinas
        var areALLStringsInArrayNONAllelic = function(a) {

            for (var i = 0; i < a.length; i++) {
                if (isAllelicString(a[i])) {
                    return false;
                }
            }

            return true;
        };

        //edward salinas
        var areALLStringsInArrayAllelic = function(a) {

            for (var i = 0; i < a.length; i++) {
                if (!isAllelicString(a[i])) {
                    return false;
                }
            }

            return true;
        };

        //edward salinas
        var getHTMLButtonsFromDrillStack = function(d) {
            var buttonHTML = '<ol class="breadcrumb">';
            for (var buttonIndex = 0; buttonIndex < d.length; buttonIndex++) {
                if (buttonIndex === (d.length - 1)) {
                    buttonHTML = buttonHTML
                               + '<li class="active">'
                                    + d[buttonIndex]
                               + '</li>';
                }
                else {
                    buttonHTML = buttonHTML
                               + '<li>'
                                    + '<a '
                                        + 'class="' + classSelector + '-stack-btn" '
                                        + 'id="' + classSelector + '-stack-btn-' + d[buttonIndex] + '" '
                                        + 'data-drillindex="' + d[buttonIndex] + '"'
                                    + ' >'
                                        + d[buttonIndex]
                                    + '</a>'
                               + '</li>';
                }
            }

            buttonHTML = buttonHTML + '</ol>';
            return buttonHTML;
        };

        //edward salinas
        var resetDrillStackUpTo = function(u, ds) {
            var newDrillStack = [];
            var di = ds.length;

            for (di = 0; di < ds.length; di++) {
                newDrillStack.push(ds[di]);

                if (u === ds[di]) {
                    di = ds.length + 1;
                }
            }

            return newDrillStack;
        };

        var redrawGeneDistChart = function(res) {

            // Breadcrumb listener - reset stack breadcrumb buttons
            document.getElementById(classSelector + '-stackdiv').innerHTML = getHTMLButtonsFromDrillStack(drillStack);
            $('.' + classSelector + '-stack-btn').click(function(e) {

                var drillIndex = e.target.dataset.drillindex;
                drillStack = resetDrillStackUpTo(drillIndex, drillStack);

                var res = getHierarchySubHierarchyFromObj(sourceJson, drillIndex);
                redrawGeneDistChart(res);
            });

            //call this function to trigger reloading inside redrawChart()
            var prevStackStatus = stackStatus;
            stackStatus = doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic(sourceJson, res.label);

            if (prevStackStatus !== stackStatus) {
                //clear chart
                d3.select('.' + classSelector + ' svg')
                    .selectAll('g').remove()
                ;
            }

            if (!stackStatus) {
                var plainChartable = makeChartableFromValidHierarchyObject(res);
                nv.addGraph(
                    function() {
                        var chart = nv.models.discreteBarChart()
                            .x(function(d) { return d.label; })
                            .y(function(d) { return d.value; })
                            .staggerLabels(true)
                            .tooltips(true)
                            .showValues(true)
                            .color(['#aec7e8', '#7b94b5', '#486192'])
                            .transitionDuration(500)
                        ;

                        d3.select('.' + classSelector + ' svg')
                            .datum(plainChartable)
                            .call(chart);

                        nv.utils.windowResize(chart.update);

                        return chart;
                    },
                    function() {
                        d3.selectAll('.nv-bar').on('click', function(e) {
                            //get a new 'chartable and invoke redrawChart to get the chart to be re-created

                            var countUnderClick = getValueReturnZeroAsDefault(e.label, sourceJson);
                            if (
                                countUnderClick === 0
                                && doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic(sourceJson, e.label) === true
                            ) {

                            }
                            else {
                                var res = getHierarchySubHierarchyFromObj(sourceJson, e.label);
                                drillStack.push(e.label);
                                redrawGeneDistChart(res);
                            }
                        });
                    }
                );
            }//plain/discrete data case
            else {
                var stackedChartableData = makeStackChartableFromValidHierarchyObject(res);
                nv.addGraph(function() {
                    var chart = nv.models.multiBarChart()
                        .transitionDuration(350)
                        // .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
                        .rotateLabels(0)      //Angle to rotate x-axis labels.
                        .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                        .stacked(true)        //set stacked
                        .showLegend(true)
                        .reduceXTicks(true)
                        .staggerLabels(true)
                        .tooltip(function(alleleNum, geneName) {
                            var completeName = geneName + '*' + alleleNum;
                            var countDefZero = getValueReturnZeroAsDefault(completeName, res);
                            var toolTipTextToDisplay = completeName + ' ; count=' + countDefZero;
                            return toolTipTextToDisplay;
                        })
                        .groupSpacing(0.1)    //Distance between each group of bars.
                    ;

                    d3.select('.' + classSelector + ' svg')
                        .datum(stackedChartableData)
                        .call(chart)
                    ;

                    nv.utils.windowResize(function() {
                        chart.update;

                        d3.selectAll('.nv-bar')
                            .classed('hidden', function(d) {
                                return d.size <= 0;
                            });
                    });

                    return chart;
                },
                function() {
                    d3.selectAll('.nv-bar')
                        .classed('hidden', function(d) {
                            return d.size <= 0;
                        })
                    ;
                });
            }//stacked data case
        };

        // Kickoff

        var redrawBarChart = function() {
            //call this function to trigger reloading
            //inside redrawBarChart()

            nv.addGraph(function() {
                var chart = nv.models.discreteBarChart()
                    .x(function(d) { return d.label; })
                    .y(function(d) { return d.value; })
                    .staggerLabels(true)
                    .tooltips(true)
                    .showValues(true)
                    .color(['#aec7e8', '#7b94b5', '#486192'])
                    .transitionDuration(500)
                ;

                d3.select('.' + classSelector + ' svg')
                    .datum(currentDataset)
                    .call(chart)
                ;

                nv.utils.windowResize(function() {
                    chart.update();
                });

                return chart;
            },
            function() {
                d3.selectAll('.nv-bar').on('click', function(e) {
                    //get a new 'chartable and invoke redrawChart to get the chart to be re-created
                    var res = findFromLabel(sourceJson, e.label);
                    var chartable = makeChartableFromValidHierarchyObject(res);
                    currentDataset = chartable;
                    redrawBarChart();
                });
            });
        };

        var res = getHierarchySubHierarchyFromObj(sourceJson, 'human');
        redrawGeneDistChart(res);
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
                .axisLabel('Count')
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
