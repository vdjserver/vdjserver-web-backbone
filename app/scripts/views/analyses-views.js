/* global ss */

define([
    'app',
    'handlebars',
    'moment',
    'd3',
    'nvd3',
    'box',
    'slickgrid.core',
    'slickgrid.grid',
    'simple-statistics'
], function(
    App,
    Handlebars,
    moment,
    d3,
    nv,
    box,
    Slick
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

        var extension = false;

        if (filename) {
            var split = filename.split('.');
            extension = split.pop();
        }

        // TEMP - remove this once heat map charts are in place
        if (filename === 'post-filter_heat_map.csv' || filename === 'pre-filter_heat_map.csv') {
            return options.inverse(this);
        }

        if (extension === 'csv') {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }

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

    Analyses.SelectAnalyses = Backbone.View.extend({
        template: 'analyses/select-analyses',
        initialize: function(parameters) {

            this.projectUuid = parameters.projectUuid;
            this.jobId = parameters.jobId;

            var loadingView = new App.Views.Util.Loading({keep: true});
            this.setView(loadingView);
            loadingView.render();

            this.collection = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: this.jobId});

            var that = this;
            this.collection.fetch()
                .done(function() {
                    loadingView.remove();
                    that.render();
                })
                .fail(function() {

                });
        },
        serialize: function() {
            return {
                outputFiles: this.collection.toJSON(),
            };
        },
        events: {
            'click .show-chart': 'showChart',

            'click .download-file': 'downloadFile',
            'click .chart-reset-btn': 'clearChart',
            'click .toggle-legend-btn': 'toggleLegend',

            'click .cdr3-histogram': 'cdr3Histogram',
            'click .gene-dist-chart-btn': 'geneDistChart',
            'click .giant-table-btn': 'giantTable',
            'click .quality-chart-btn': 'qualityScoreChart',
        },
        showChart: function(e) {
            e.preventDefault();

            var filename = e.target.dataset.id;

            // Select current button
            $('.show-chart').removeClass('btn-success');
            $(e.target).addClass('btn-success');

            // Clean up any charts that are currently displayed
            this.clearChart();
            this.hideWarning();
            $('#chart-legend').hide();

            var that = this;

            var file = this.collection.get(filename);
            file.downloadFileToCache()
                .done(function(response) {

                    switch (filename) {
                        case 'pre-filter_composition.csv':
                            $('#chart-legend').show();
                            Analyses.Charts.Composition(file, response, that.clearSVG);
                            break;

                        case 'pre-filter_gc_hist.csv':
                            $('#chart-legend').show();
                            Analyses.Charts.PercentageGcHistogram(file, response, that.clearSVG());
                            break;

                        case 'pre-heat_map.csv':
                            break;

                        case 'pre-filter_len_hist.csv':
                            $('#chart-legend').show();
                            Analyses.Charts.LengthHistogram(file, response, that.clearSVG());
                            break;

                        case 'pre-filter_mean_q_hist.csv':
                            $('#chart-legend').show();
                            Analyses.Charts.MeanQualityScoreHistogram(file, response, that.clearSVG);
                            break;

                        case 'pre-filter_qstats.csv':
                            $('#chart-legend').show();
                            Analyses.Charts.QualityScore(file, response);
                            break;

                        default:
                            break;
                    }
                })
                .fail(function(response) {
                    var errorMessage = this.getErrorMessageFromResponse(response);
                    this.showWarning(errorMessage);
                })
                ;
        },

        downloadFile: function(e) {
            e.preventDefault();

            var fileName = e.target.dataset.filename;
            var outputFile = this.collection.get(fileName);
            outputFile.downloadFileToDisk();
        },
        clearChart: function() {
            // clear announcements
            $('#chart-right-announcement').empty();

            // hide delete button
            $('.download-btn').hide();

            // remove SVG elements
            this.hideWarning();

            var oldSVGs = document.getElementsByTagName('svg');
            for (var i = 0; i < oldSVGs.length; i++) {
                oldSVGs[i].parentNode.removeChild(oldSVGs[i]);
            }

            //get rid of the download-btn if it exists
            //remove the svg container as well because some events get tied to it
            var chartContainer = document.getElementsByClassName('svg-container');
            for (var j = 0; j < chartContainer.length; j++) {
                chartContainer[j].parentNode.removeChild(chartContainer[j]);
            }

            //add them back in
            d3.select('.row .analyses')
                .append('div')
                    .attr('id','analyses-chart')
                    .attr('class','svg-container')
                    .attr('style','position:relative; top:1px;left:0px;')
            ;

            d3.select('.svg-container')
                .append('svg')
                    .attr('style','height:600px;')
            ;

            $('#chart-file-well').text('No data loaded. Select an Analysis.');
        },
        clearSVG: function() {

            //remove SVG elements
            var oldSVGs = document.getElementsByTagName('svg');

            for (var i = 0; i < oldSVGs.length; i++) {
                while (oldSVGs[i].hasChildNodes()) {
                    oldSVGs[i].removeChild(oldSVGs[i].firstChild);
                }
            }

            //add them back in
            d3.select('.row .analyses')
                .append('div')
                    .attr('id','analyses-chart')
                    .attr('class','svg-container')
                    .attr('style','position:relative; top:1px;left:0px;')
            ;
/*
            d3.select('.svg-container')
                .append('svg')
                    .attr('style','height:600px;')
            ;
*/
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

            $('.alert-message').text(message);
            $('.alert').show();
        },
        hideWarning: function() {
            $('.alert').hide();
        },
        toggleLegend: function() {
            $('.nv-legendWrap').toggle();
        },
        giantTable: function() {

            this.clearChart();
            this.hideWarning();

            //get file name post-filter_mean_q_hist.csv
            var file = this.collection.get('human.IG.fna.igblast.kabat.out.rc_out.tsv');
            file.downloadFileToCache()
                .done(function(tsv) {
                    Analyses.Charts.GiantTable(file, tsv);
                })
                .fail(function(response) {
                    var errorMessage = this.getErrorMessageFromResponse(response);
                    this.showWarning(errorMessage);
                });
        },
        cdr3Histogram: function() {

            this.clearChart();
            this.hideWarning();

            var that = this;

            var file = this.collection.get('cdr3-hist-data.json');
            file.downloadFileToCache()
                .done(function(text) {
                    Analyses.Charts.Cdr3(file, text, that.clearSVG);
                 })
                .fail(function(response) {
                    var errorMessage = this.getErrorMessageFromResponse(response);
                    this.showWarning(errorMessage);
                });
        },
        //edward salinas
        geneDistChart: function() {
            this.clearChart();
            this.hideWarning();

            var that = this;

            //get file name post-filter_mean_q_hist.csv
            var file = this.collection.get('real_discrete_bar_chart.json');
            file.downloadFileToCache()
                .done(function(text) {
                    Analyses.Charts.GeneDistribution(file, text, that.clearSVG());
                })
                .fail(function(response) {
                    var errorMessage = this.getErrorMessageFromResponse(response);
                    this.showWarning(errorMessage);
                });
        },
    });

    Analyses.Charts.LengthHistogram = function(file, text, clearSVG) {
        //$('#chart-file-well').text(file.name);

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
            d3.select('#analyses-chart svg')    //Select the <svg> element you want to render the chart in.
                .datum(myData)
                .call(chart)    //Finally, render the chart!
            ;

            //Update the chart when window resizes.
            nv.utils.windowResize(function() {
                clearSVG();
                chart.update();
            });

            return chart;
        });
    };

    Analyses.Charts.MeanQualityScoreHistogram = function(file, text, clearSVG) {
        //$('#chart-file-well').text(file.name);

        //remove commented out lines (header info)
        text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

        var data = d3.tsv.parse(text);
        var otherD = [];
        var medianD = [];
        var nonZeroCount=[];
        data.forEach(function(d) {
            if(+d['count'] !== 0){
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
            d3.select('#analyses-chart svg')    //Select the <svg> element you want to render the chart in.
                .datum(myData)
                .call(chart)    //Finally, render the chart!
            ;

            //Update the chart when window resizes.
            nv.utils.windowResize(function() {
                clearSVG();
                chart.update();
            });

            return chart;
        });
    };

    Analyses.Charts.QualityScore = function(file, text) {
        var margin = {
            top: 30,
            right: 50,
            bottom: 100,
            left: 70,
        };

        var width = 1200
                  - margin.left
                  - margin.right;

        var height = 600
                   - margin.top
                   - margin.bottom;

        var min = Infinity;
        var max = -Infinity;

        //$('#chart-file-well').text(file.name);

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

        var barWidth = x(1) / 4;

        // topSVG
        d3.select('svg')
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

        var tip = d3.select('.d3-tip');

        var boxG = d3.select('svg').append('g');
        boxG
            .attr('class','boxG')
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
                return x(+d.position) + barWidth/2;
            })
            .attr('y1', function(d) {
                return y(+d['10%']);
            })
            .attr('x2', function(d) {
                return x(+d.position) + barWidth/2;
            })
            .attr('y2', function(d) {
                return y(+d['90%']);
            })
        ;

        //add the background boxes
        //add a group
        var bgGroup = d3.select('svg').append('g')
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
            .attr('width', width )
            .attr('height', y(0) - y(20))
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + y(20)) + ')')
            .attr('class', 'bg_20')
        ;

        bgGroup.append('rect')
            .attr('width', width )
            .attr('height', y(20) - y(28)) //30
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + y(28)) + ')')
            .attr('class', 'bg_28')
        ;

        bgGroup.append('rect')
            .attr('width', width )
            .attr('height', y(28) - y(max))
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + y(max)) + ')')
            .attr('class','bg_40')
        ;

        var svg = d3.select('svg')
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
                tip.transition()
                    .duration(200)
                    .style('opacity', 0.9)
                ;

                tip
                    .html('Read Position: ' + d.position + '<br/>'
                        + 'Mean: ' + d['mean'] + '<br/>'
                        + '90%: &nbsp;&nbsp;' + d['90%'] + '<br/>'
                        + '75%: &nbsp;&nbsp;' + d['75%'] + '<br/>'
                        + '50%: &nbsp;&nbsp;' + d['50%'] + '<br/>'
                        + '25%: &nbsp;&nbsp;' + d['25%'] + '<br/>'
                        + '10%: &nbsp;&nbsp;' + d['10%'] + '<br/>'
                    )
                    .style('left', (+d3.event.layerX + 50) + 'px')
                    .style('top', (+d3.event.layerY + 150) + 'px')
                ;
             })
            .on('mouseout', function(/* d */) {
                tip.transition()
                    .duration(300)
                    .style('opacity', 0);
             })
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
            .append('text')             // text label for the x axis
            .attr('x', (width / 2) )
            .attr('y',  25)
            .attr('dy', '.71em')
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .text('Position in Read')
        ;

        // Define the mean line
        var	meanLine = d3.svg.line()								// set 'valueline' to be a line
            .x(function(d) {
                return x(+d.position) + barWidth / 2;
            })
            .y(function(d) {
                return y(+d.mean);
            })
        ;

        var meanGroup = d3.select('svg').append('g')
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
                .attr('cx', function (d) {
                    return x(+d.position) + barWidth / 2;
                })
                .attr('cy', function (d) {
                    return y(+d.mean);
                })
                .attr('r', 3)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('class', 'meanPoints')
        ;
    };

    Analyses.Charts.PercentageGcHistogram = function(file, text, clearSVG) {
        //$('#chart-file-well').text(file.name);

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
            if (! otherD[i]) {
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
            d3.select('#analyses-chart svg')    //Select the <svg> element you want to render the chart in.
                .datum(myData)
                .call(chart)    //Finally, render the chart!
            ;

            //Update the chart when window resizes.
            nv.utils.windowResize(function() {
                clearSVG();
                chart.update();
            });

            return chart;
        });
    };

    Analyses.Charts.GeneDistribution = function(file, text, clearSVG) {

        var sourceJson = JSON.parse(text);

        var stackStatus = false;
        var drillStack = ['human']; //keep track of drill-down location
        var currentDataset;

        //$('#chart-file-well').text(file.name);

        d3.select('#analyses-chart')
            .insert('div', 'svg')
            .attr('id','stackdiv')
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
                    else{
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

            if ( !cond1 && cond2 && cond3 && !cond4 && !cond5) {
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
                //colorArray = [' #FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#4B0082','#8F00FF']; //rainbow http://suddenwhims.com/2012/10/html-rainbow-color-codes-color-hex/
                var stackDataArray = [];
                var alleleNum = 1;
                var immediateChildren = o.children;

                for (alleleNum = 1; alleleNum <= maxa; alleleNum++) {
                    var immediateChildIndex = 0;
                    var alleleNumZeroPadded = zeroPadToDigits(alleleNum, 2);

                    var objectColorIndex = ((alleleNum -1) % colorArray.length);
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
                if (buttonIndex === (d.length -1)) {
                    buttonHTML = buttonHTML
                               + '<li class="active">'
                                    + d[buttonIndex]
                               + '</li>';
                }
                else {
                    buttonHTML = buttonHTML
                               + '<li>'
                                    + '<a class="stack-btn" id="stack-btn-' + d[buttonIndex] + '" data-button-index="' + d[buttonIndex] + '" >' + d[buttonIndex] + '</a>'
                               +'</li>';
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
            document.getElementById('stackdiv').innerHTML = getHTMLButtonsFromDrillStack(drillStack);
            $('.stack-btn').click(function(breadcrumb) {
                var value = breadcrumb.toElement.attributes.getNamedItem('data-button-index').value;
                drillStack = resetDrillStackUpTo(value, drillStack);
                var res = getHierarchySubHierarchyFromObj(sourceJson, value);
                redrawGeneDistChart(res);
            });

            //call this function to trigger reloading inside redrawChart()
            var prevStackStatus = stackStatus;
            stackStatus = doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic(sourceJson, res.label);

            if (prevStackStatus !== stackStatus) {
                //clear chart
                d3.select('#analyses-chart svg')
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

                        d3.select('#analyses-chart svg')
                            .datum(plainChartable)
                            .call(chart);

                        nv.utils.windowResize(chart.update);

                        return chart;
                    },
                    function(){
                        d3.selectAll('.nv-bar').on('click', function(e){
                            //get a new 'chartable and invoke redrawChart to get the chart to be re-created

                            var countUnderClick = getValueReturnZeroAsDefault(e.label, sourceJson);
                            if (countUnderClick === 0 && doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic(sourceJson, e.label) === true) {
                            }
                            else {
                                var res = getHierarchySubHierarchyFromObj(sourceJson, e.label);
                                drillStack.push(e.label);
                                redrawGeneDistChart(res);
                            }
                        });
                    });
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

                        d3.select('#analyses-chart svg')
                            .datum(stackedChartableData)
                            .call(chart)
                        ;

                        nv.utils.windowResize(function() {
                            chart.update;

                            d3.selectAll('.nv-bar')
                                .classed('hidden', function(d){
                                    return d.size <= 0;
                            });
                        });

                        return chart;
                    },
                    function(){
                        d3.selectAll('.nv-bar')
                            .classed('hidden', function(d){
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
            clearSVG();

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

                d3.select('#analyses-chart svg')
                    .datum(currentDataset)
                    .call(chart)
                ;

                nv.utils.windowResize(function() {
                    clearSVG();
                    chart.update();
                });

                return chart;
            },
            function() {
                d3.selectAll('.nv-bar').on('click', function(e){
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

    Analyses.Charts.Cdr3 = function(file, text, clearSVG) {

        //$('#chart-file-well').text(file.name);
        var cdr3Data = JSON.parse(text);

        nv.addGraph(function() {
            var chart = nv.models.multiBarChart()
                .transitionDuration(350)
                .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
                .rotateLabels(0)      //Angle to rotate x-axis labels.
                .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                .tooltips(true)
                .groupSpacing(0.1)    //Distance between each group of bars.
            ;

            chart.xAxis
                .tickFormat(d3.format(',f'))
            ;

            chart.yAxis
                .tickFormat(d3.format(',.1f'))
            ;

            d3.select('#analyses-chart svg')
                .datum(cdr3Data)
                .call(chart)
            ;

            nv.utils.windowResize(function() {
                clearSVG();
                chart.update();
            });

            return chart;
        });
    };

    Analyses.Charts.GiantTable = function(file, tsv) {

        //$('#chart-file-well').text(file.name);

        //this.tableTSV = tsv;

        var width = $('#analyses-chart').width();
        var height = $('#analyses-chart').height();

        d3.select('#analyses-chart')
            .attr('style',
                d3.select('#analyses-chart').attr('style') + ';'
                + 'width:' + (+width - 40) + 'px;'
                + 'height:' + (+height - 20) + 'px;'
             )
        ;

        //that.downloadData = tsv;
        $('.download-btn').show();

        var data = d3.tsv.parse(tsv);

        var defaultColumns = [
            {
                id: 'read_id#',
                name: 'Read Sequence Number',
                field: 'read_id#',
            },
            {
                id: 'read_name',
                name: 'Read Identifier',
                field: 'read_name',
            },
            {
                id: 'top_V',
                name: 'Highest Scoring V Segment',
                field: 'top_V',
            },
            {
                id: 'top_D',
                name: 'Highest Scoring D Segment',
                field: 'top_D',
            },
            {
                id: 'top_J',
                name: 'Highest Scoring J Segment',
                field: 'top_J',
            },
            {
                id: 'vdj_server_ann_imgt_cdr3_na_len',
                name: 'IMGT-CDR3 Nucleotide Sequence Length',
                field: 'vdj_server_ann_imgt_cdr3_na_len',
            },
            {
                id: 'vdj_server_ann_imgt_cdr3_tr_len',
                name: 'IMGT-CDR3 AA Sequence Length',
                field: 'vdj_server_ann_imgt_cdr3_tr_len',
            },
            {
                id: 'vdj_server_ann_kabat_cdr3_na_len',
                name: 'Kabat-CDR3 Nucleotide Sequence Length',
                field: 'vdj_server_ann_kabat_cdr3_na_len',
            },
            {
                id: 'vdj_server_ann_kabat_cdr3_tr_len',
                name: 'Kabat-CDR3 AA Sequence Length',
                field: 'vdj_server_ann_kabat_cdr3_tr_len',
            },
            {
                id: 'vdj_server_ann_whole_seq_bsb_freq',
                name: 'Base Substitution Frequency (Over V and J )',
                field: 'vdj_server_ann_whole_seq_bsb_freq',
            },
            {
                id: 'vdj_server_ann_whole_seq_ns_rto',
                name: 'Nonsynonymous/Synonymous Substitution Ratio (Over V and J)',
                field: 'vdj_server_ann_whole_seq_ns_rto',
            },
            {
                id: 'vdj_server_ann_whole_seq_indel_freq',
                name: 'Indel Frequency (Over V and J)',
                field: 'vdj_server_ann_whole_seq_indel_freq',
            },
            {
                id: 'vdj_server_ann_productive_rearrangement',
                name: 'Productive/Non-Productive Rearrangement',
                field: 'vdj_server_ann_productive_rearrangement',
            },
            {
                id: 'vdj_server_whole_vj_stp_cdn',
                name: 'Stop Codon? (from beginning of V to the last aligned base)',
                field: 'vdj_server_whole_vj_stp_cdn',
            }
        ];

        var keys = Object.keys(data[0]);
        var columns = [];
        for (var i = 0; i < keys.length; i++) {
            columns.push({
                id: keys[i],
                name: keys[i],
                field: keys[i],
            });
        }

        var options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            defaultColumnWidth: 120,
            editable: true,
        };

        // Grid
        //var grid = new Slick.Grid(
        Slick.Grid(
            '#analyses-chart',
            data,
            defaultColumns,
            options
        );

        $('.slick-column-name').each(function()  {
            $(this).attr('title', $(this).text());
            $(this).attr('data-toggle', 'tooltip');
        });

        $('.slick-header-column').tooltip({
            tooltipClass: 'custom-tooltip-styling',
        });

    };

    Analyses.Charts.Composition = function(file, response, clearSVG) {
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
            d3.select('.svg-container svg')    //Select the <svg> element you want to render the chart in.
                .datum(myData)
                .call(chart)    //Finally, render the chart!
            ;

            //Update the chart when window resizes.
            nv.utils.windowResize(function() {
                clearSVG();
                chart.update();
            });

            return chart;
        });

    };


    App.Views.Analyses = Analyses;
    return Analyses;
});
