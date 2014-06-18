define(['app'], function(App) {

    'use strict';

    var Analyses = {};

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
                    console.log("fetch ok. data is: " + JSON.stringify(that.collection.toJSON()));
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
        downloadFile: function(e) {
            e.preventDefault();

            var fileName = e.target.dataset.filename;
            var outputFile = this.collection.get(fileName);
            outputFile.downloadFile();
        },
        events: {
            'click .download-file': 'downloadFile',

            'click .cdr3-histogram': 'cdr3Histogram',
            'click .gene-dist-chart-btn': 'geneDistChart',
            'click .composition-chart-btn': 'compositionChart', //!
            'click .quality-chart-btn': 'qualityScoreChart', // ok
            'click .mean-q-hist-btn': 'meanQHist', // ok
            'click .length-hist-btn': 'lengthHist', // ok
            'click .gc-hist-btn': 'gcHist', //!

            'click .toggle-legend-btn': 'toggleLegend',
            'click .chart-reset-btn': 'clearChart',
            'click .stack-btn': 'buttonDrill',
            'click .giant-table-btn': 'giantTable',
        },
        giantTable: function() {

            this.clearChart();
            this.hideWarning();

            var that = this;

            //get file name post-filter_mean_q_hist.csv
            var file  = new Backbone.Agave.Model.File();
            file.getFile('human.IG.fna.igblast.kabat.out.rc_out.tsv')
                .done(function(tsv) {
                    $('#chartFileWell').text(file.name);

                    this.tableTSV = tsv;

                    var width = $('#analyses-chart').width();
                    var height = $('#analyses-chart').height();

                    d3.select('#analyses-chart')
                        .attr('style',
                            d3.select('#analyses-chart').attr('style') + ';'
                            + 'width:' + (+width-40) + 'px;'
                            + 'height:' + (+height -20) + 'px;'
                         )
                    ;

                    that.downloadData = tsv;
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
                    for (var i=0; i< keys.length; i++) {
                        columns.push({
                            id: keys[i],
                            name: keys[i],
                            field: keys[i]
                        });
                    }

                    var options = {
                        enableCellNavigation: true,
                        enableColumnReorder: false,
                        defaultColumnWidth: 120,
                        editable: true,
                    };

                    var grid = new Slick.Grid(
                        '#analyses-chart',
                        data,
                        defaultColumns,
                        options
                    );

                    $('.slick-column-name').each(function()  {
                        $(this).attr('title', $(this).text());
                        $(this).attr('data-toggle', 'tooltip');
                    });

                    $('.slick-header-column').tooltip({ tooltipClass: 'custom-tooltip-styling' });
                 })
                .fail (function(response) {

                    var message = 'An error occurred. ';

                    if (response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }

                    that.showWarning(message);
                });
        },
        cdr3Histogram: function() {

            this.clearChart(); 
            this.hideWarning();

            var that = this;
            //get file name post-filter_mean_q_hist.csv
            var file = new Backbone.Agave.Model.File();
            file.getFile('cdr3-hist-data.json')
                .done(function(text) {
                    $('#chartFileWell').text(file.name);
                    var CDR3_data = JSON.parse(text);

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
                            .tickFormat(d3.format(',f'));

                        chart.yAxis
                            .tickFormat(d3.format(',.1f'));

                        d3.select('#analyses-chart svg')
                        .datum(CDR3_data)
                            .call(chart);

                        nv.utils.windowResize(function() { that.clearSVG(); chart.update(); });
                        return chart;
                    });

                 })
                .fail (function(response) {
                    var message = 'An error occurred. ';
                    if(response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }
                    that.showWarning(message);
                }); //end getFile.fail()
        },
        clearChart: function() {
            //hide delete button
            $('.download-btn').hide();
            //remove SVG elements
            this.hideWarning();
            var oldSVGs = document.getElementsByTagName('svg');
             for(var i = 0; i < oldSVGs.length ; i++) {
                oldSVGs[i].parentNode.removeChild(oldSVGs[i]);
            }
            //get rid of the download-btn if it exists
            //remove the svg container as well because some events get tied to it
            var chartContainer = document.getElementsByClassName('svg-container');
              for(var i = 0; i < chartContainer.length ; i++) {
                chartContainer[i].parentNode.removeChild(chartContainer[i]);
            }
            //add them back in
            d3.select('.row .analyses').append('div').attr('id','analyses-chart').attr('class','svg-container').attr('style','position:relative; top:1px;left:0px;');
            d3.select('.svg-container').append('svg').attr('style','height:600px;');
            $('#chartFileWell').text('No data loaded. Select an Analysis.');
        },
        clearSVG: function() {
            //remove SVG elements
            var oldSVGs = document.getElementsByTagName('svg');
             for(var i = 0; i < oldSVGs.length ; i++) {
                while(oldSVGs[i].hasChildNodes()) {
                    oldSVGs[i].removeChild(oldSVGs[i].firstChild);
                }
            }
            //add them back in
            d3.select('.row .analyses').append('div').attr('id','analyses-chart').attr('class','svg-container').attr('style','position:relative; top:1px;left:0px;');
            d3.select('.svg-container').append('svg').attr('style','height:600px;');
        },
        findFromLabel: function(o,label) {
            if('label' in o) {
                if(o.label === label) {
                    return o;
                } else {
                    if('children' in o) {
                        var kids = o.children;
                        for(var k=0; k < kids.length; k++) {
                            var result = this.findFromLabel(kids[k],label);
                            if(result != null) {
                                return result;
                            }
                        }
                    } else {
                        return null;
                    }
                }
            }
            //not in the object, not there at all
            return null;
        },
        makeChartableFromValidHierarchyObject: function(o) {
                var values=[];
                if('children' in o) {
                    //iterate throuch children
                    //for each child, make an object with
                    //2(two) items, 'label' and 'value'
                    //      {
                    //        'label' : 'A' ,
                    //        'value' : 29.765957771107
                    //      } ,
                    var kids=o.children;
                    var numKids=kids.length;
                    for(var k=0;k<numKids;k++) {
                        var tempObj={'label':kids[k].label,'value':kids[k].value};
                        values.push(tempObj);
                        }
                    } else {
                    //no children
                    //just use self!
                    var singleObj={'label':o.label,'value':o.value};
                    values.push(singleObj);
                    }
                var topobj={key: 'Cumulative Return','values':values};
                var l1=[];
                l1.push(topobj);
                //l1 'level 1' is the chartable! :)
                return l1;
        },
        redrawBarChart: function() {
            //call this function to trigger reloading
            //inside redrawBarChart()
            this.clearSVG();
            var that = this;
            nv.addGraph(function() {
              var chart = nv.models.discreteBarChart()
                  .x(function(d) { return d.label })
                  .y(function(d) { return d.value })
                  .staggerLabels(true)
                  .tooltips(true)
                  .showValues(true)
                  .color(['#aec7e8', '#7b94b5', '#486192'])
                  .transitionDuration(500)
                  ;
              d3.select('#analyses-chart svg')
                  .datum(that.currentDataset)
                  .call(chart);

              nv.utils.windowResize(function() { that.clearSVG(); chart.update(); });
              return chart;
            },function(){
                d3.selectAll('.nv-bar').on('click',
                    function(e){
                        //get a new 'chartable and invoke redrawChart to get the chart to be re-created
                        var res=that.findFromLabel(that.BIGJSON,e.label);
                        var chartable=that.makeChartableFromValidHierarchyObject(res);
                        that.currentDataset=chartable;
                        that.redrawBarChart()
                    });
            });
        },

        compositionChart: function () {

            this.clearChart();
            this.hideWarning();

            var that = this;
            var file = new Backbone.Agave.Model.File();
            file.getFile('post-filter_composition.csv')
                .done(function(response) {

                    $('#chartFileWell').text(file.name);
                    response = response.replace(/^[##][^\r\n]+[\r\n]+/mg, '');
                    var data = d3.tsv.parse(response);
                    var aData= []; var cData= []; var gData= []; var tData= []; var nData= []; var gcData = [];

                    data.forEach(function(d) {
                        aData.push({x: +d['position'], y: +d['A%']});
                        cData.push({x: +d['position'], y: +d['C%']});
                        gData.push({x: +d['position'], y: +d['G%']});
                        tData.push({x: +d['position'], y: +d['T%']});
                        nData.push({x: +d['position'], y: +d['N%']});
                        gcData.push({x: +d['position'], y: +d['GC%']});
                    });

                    var myData = [{
                        key: 'A%',
                        values: aData
                    },
                    {
                        key: 'C%',
                        values: cData
                    },
                    {
                        key: 'G%',
                        values: gData
                    },
                    {
                        key: 'T%',
                        values: tData
                    },
                    {
                        key: 'N%',
                        values: nData
                    },
                    {
                        key: 'GC%',
                        values: gcData
                    }
                    ];

                    nv.addGraph(function() {
                        var chart = nv.models.lineChart()
                            .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                            .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                            .transitionDuration(350)  //how fast do you want the lines to transition?
                            .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                            .showYAxis(true)        //Show the y-axis
                            .showXAxis(true)        //Show the x-axis
                        ;

                        chart.xAxis     //Chart x-axis settings
                          .axisLabel('Read Position')
                          .tickFormat(d3.format(',r'));

                        chart.yAxis     //Chart y-axis settings
                          .axisLabel('Percent')
                          .tickFormat(d3.format(',r'));

                        /* Done setting the chart up? Time to render it!*/
                        d3.select('.svg-container svg')    //Select the <svg> element you want to render the chart in.
                         .datum(myData)
                          .call(chart);          //Finally, render the chart!

                        //Update the chart when window resizes.
                        nv.utils.windowResize(function() { that.clearSVG(); chart.update() });
                        return chart;
                    }); //end nv.addGraph(function(){})

                }) //end getFile.done()
                .fail (function(response) {
                    var message = 'An error occurred. ';
                    if(response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }
                    that.showWarning(message);
                }); //end getFile.fail()

        },

        qualityScoreChart: function() {

            this.clearChart();
            this.hideWarning();

            var that = this;

            var labels = true; // show the text labels beside individual boxplots?

            var margin = {
                top: 30,
                right: 50,
                bottom: 100,
                left: 70
            };

            var width = 1200
                      - margin.left
                      - margin.right;

            var height = 600
                       - margin.top
                       - margin.bottom;

            var min = Infinity;
            var max = -Infinity;

            var file = this.collection.get('pre-qstats.csv');
            file.downloadFile()
                .done(function(text) {
                    $('#chartFileWell').text(file.name);

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
                        .whiskers(that.iqr(1.5))
                        .height(height)
                        .width(width)
                        .domain([min, max])
                        //.showLabels(labels)
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
                    var y0 = d3.scale.linear()
                        .domain([0,max])
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

                    var barWidth = x(1)/4;

                    var topSVG = d3.select('svg')
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
                        .on('mouseout', function(d) {
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
                                return y(+d.mean)
                            })
                            .attr('r', 3)
                            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                            .attr('class', 'meanPoints');
                    ;


                })
                .fail (function(response) {
                    var message = 'An error occurred. ';

                    if(response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }

                    that.showWarning(message);
                });
        },

        // Returns a function to compute the interquartile range.
        // already computed in our data
        iqr: function(k) {
          return function(d, i) {
            var q1 = d.quartiles[0],
                q3 = d.quartiles[2],
                iqr = (q3 - q1) * k,
                i = -1,
                j = d.length;
            while (d[++i] < q1 - this.iqr);
            while (d[--j] > q3 + this.iqr);
            return [i, j];
          };
        },

        meanQHist: function() {

            this.clearChart();
            this.hideWarning();

            var that = this;

            var file = this.collection.get('pre-mean_q_hist.csv');
            file.downloadFile()
                .done(function(text) {

                    $('#chartFileWell').text(file.name);

                    //remove commented out lines (header info)
                    text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

                    var data = d3.tsv.parse(text);
                    var otherD = [];
                    data.forEach(function(d) {
                        otherD.push({
                            x: +d['read_quality'],
                            y: +d['count'],
                        });
                    });

                    var myData = [{
                        key: 'Quality Score',
                        values: otherD,
                    }];

                    nv.addGraph(function() {
                        var chart = nv.models.lineChart()
                            .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
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
                            that.clearSVG();
                            chart.update();
                        });

                        return chart;
                    });

                })
                .fail (function(response) {
                    var message = 'An error occurred. ';

                    if (response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }

                    that.showWarning(message);
                });
        },

        lengthHist: function () {

            this.clearChart();
            this.hideWarning();

            var that = this;

            var file = this.collection.get('pre-len_hist.csv');
            console.log("file is: " + JSON.stringify(file));
            file.downloadFile()
                .done(function(text) {

                    $('#chartFileWell').text(file.name);

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
                            .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
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
                            that.clearSVG();
                            chart.update();
                        });

                        return chart;
                    });
                })
                .fail (function(response) {
                    var message = 'An error occurred. ';

                    if (response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }

                    that.showWarning(message);
                });
        },

        gcHist: function () {
            this.clearChart(); this.hideWarning();
            var that = this;
            //get file name post-filter_mean_q_hist.csv
            var file  = new Backbone.Agave.Model.File();
            file.getFile('pre-filter_gc_hist.csv')
                .done(function(text) {
                    $('#chartFileWell').text(file.name);
                    //remove commented out lines (header info)
                    text = text.replace(/^[##][^\r\n]+[\r\n]+/mg, '');

                    var data = d3.tsv.parse(text);
                    var otherD = [];
                    data.forEach(function(d) {
                    otherD.push({x: +d['GC%'], y: +d['read_count']});
                    });

                    //fill in any up to 100
                    for(var i = 0; i <= 100; i++) {
                    if(! otherD[i]) {
                      otherD.push({x: +i, y: 0});
                    }
                    }

                    var myData = [{
                    key: 'Mean GC %',
                    values: otherD
                    }];

                    nv.addGraph(function() {
                      var chart = nv.models.lineChart()

                                    .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
                                    .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
                                    .transitionDuration(350)  //how fast do you want the lines to transition?
                                    .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
                                    .showYAxis(true)        //Show the y-axis
                                    .showXAxis(true)        //Show the x-axis
                      ;

                      chart.xAxis     //Chart x-axis settings
                          .axisLabel('Mean GC Content %')
                          .tickFormat(d3.format(',r'));

                      chart.yAxis     //Chart y-axis settings
                          .axisLabel('Read Count')
                          .tickFormat(d3.format(',r'));

                      /* Done setting the chart up? Time to render it!*/
                      d3.select('#analyses-chart svg')    //Select the <svg> element you want to render the chart in.
                         .datum(myData)
                          .call(chart);          //Finally, render the chart!

                      //Update the chart when window resizes.
                      nv.utils.windowResize(function() { that.clearSVG(); chart.update() });
                      return chart;
                    });

                })
                .fail (function(response) {
                    var message = 'An error occurred. ';
                    if(response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }
                    that.showWarning(message);
                }); //end getFile.fail()
        },

        showWarning: function(message) {
            $('.alert-message').text(message);
            $('.alert').show();
        },
        hideWarning: function() {
            $('.alert').hide();
        },
        toggleLegend: function() {
            $('.nv-legendWrap').toggle();
        },

        //edward salinas
        geneDistChart: function() {
            this.clearChart(); this.hideWarning();
            var that = this;
            //get file name post-filter_mean_q_hist.csv
            var file  = new Backbone.Agave.Model.File();
            file.getFile('real_discrete_bar_chart.json')
                .done(function(text) {
                    $('#chartFileWell').text(file.name);
                    d3.select('#analyses-chart').insert('div', 'svg').attr('id','stackdiv');
                    var BIGJSON = JSON.parse(text);
                    that.BIGJSON = BIGJSON;

                    var res=that.getHierarchySubHierarchyFromObj(BIGJSON,'human');
                    var initialChartable=that.makeChartableFromValidHierarchyObject(res);
                    var currentDataset=initialChartable;
                    that.stackStatus=false;
                    that.drillStack=['human']; //keep track of drill-down location
                    that.redrawGeneDistChart(res);

                })
                .fail (function(response) {
                    var message = 'An error occurred. ';
                    if(response && response.responseText) {
                        var txt = JSON.parse(response.responseText);
                        message = message + txt.message;
                    }
                    that.showWarning(message);
                }); //end getFile.fail()
        }, //end redrawGeneDistChart

        //edward salinas
        resetDrillStackUpTo: function(u,ds) {
            var newDrillStack=[];
            var di=ds.length;
            for(di=0;di<ds.length;di++) {
                newDrillStack.push(ds[di]);
                if(u===ds[di]) {
                    di=ds.length+1;
                }
            }
	        return newDrillStack;
        },

        //edward salinas
        buttonDrill: function(x, y) {
            var value = x.toElement.attributes.getNamedItem('data-button-index').value;
            this.drillStack=this.resetDrillStackUpTo(value,this.drillStack);
            var res=this.getHierarchySubHierarchyFromObj(this.BIGJSON,value);
            this.redrawGeneDistChart(res);
        },

        //edward salinas
        getHTMLButtonsFromDrillStack: function(d) {
            var buttonIndex=0;
            var buttonHTML='<ol class="breadcrumb">';
            for (buttonIndex=0;buttonIndex<d.length;buttonIndex++){
                if (buttonIndex == (d.length -1)) {
                    buttonHTML = buttonHTML + '<li class="active">' + d[buttonIndex] + '</li>';
                }
                else {
                    buttonHTML = buttonHTML + '<li><a class="stack-btn" id="stack-btn-' + d[buttonIndex] + '" data-button-index="' + d[buttonIndex] + '" >' + d[buttonIndex] + '</a></li>';
                }
            }
            buttonHTML = buttonHTML + '</ol>';
            return buttonHTML;
        },

        //does the tree have children and there's more than zero of them
        //edward salinas
        doesThisRootHaveChildren: function(o,rootName) {
            var rooted_hierarchy=this.getHierarchySubHierarchyFromObj(o,rootName)
            if('children' in rooted_hierarchy) {
                var children=rooted_hierarchy.children
                if(children.length==0) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return false;
            }
        },

        isAllelicString: function(s) {
            var allelePattern=/\S\*\d+$/i;
            if(s.match(allelePattern)) {
                return true;
            } else {
                return false;
            }
        },

        //edward salinas
        areALLStringsInArrayNONAllelic: function(a) {
            var i=0;
            for(i=0;i<a.length;i++)
                {
                var allelic=this.isAllelicString(a[i]);
                if(allelic) {
                    return false;
                    }
                }
            return true;
        },

        //edward salinas
        areALLStringsInArrayAllelic: function(a) {
            var i=0;
            for(i=0;i<a.length;i++)
                {
                var allelic=this.isAllelicString(a[i]);
                if(!allelic) {
                    return false;
                    }
                }
            return true;
        },

        //edward salinas
        doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic: function(o,rootName) {
            var rooted_hierarchy=this.getHierarchySubHierarchyFromObj(o,rootName)
            var has_kids=this.doesThisRootHaveChildren(o,rootName)
            var grandKidsLabels=[]
            var kidsLabels=[]
            var self=rootName
            if(has_kids) {
                var children=rooted_hierarchy.children;
                var c=0;
                for(c=0;c<children.length;c++) {
                    var child=children[c];
                    if('label' in child) {
                        kidsLabels.push(child.label);
                    }

                    if('children' in child) {
                        var grandChildren=child.children;
                        for(var gc=0;gc<grandChildren.length;gc++) {
                            grandKidsLabels.push(grandChildren[gc].label);
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

            var cond1=this.isAllelicString(rootName);
            var cond2=this.areALLStringsInArrayNONAllelic(kidsLabels);
            var cond3=this.areALLStringsInArrayAllelic(grandKidsLabels);
            var cond4=(kidsLabels.length==0);
            var cond5=(grandKidsLabels.length==0);

            if( !cond1 && cond2 && cond3 && !cond4 && !cond5) {
                return true;
            } else {
                return false;
            }
        }, //end doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic

        //edward salinas
        getValueReturnZeroAsDefault: function(s,hierarchy) {
            var subtree=this.getHierarchySubHierarchyFromObj(hierarchy,s);
            if(subtree==null)
            {
                return 0;
            }
            else
            {
                return subtree.value;
            }
        },

        getGrandChildrenLabelArray: function(o) {
            var gcArray=[];
            if('children' in o) {
                var children=o.children;
                for(var c=0;c<children.length;c++)
                    {
                    if('children' in children[c])
                        {
                        var gKids=children[c].children;
                        for(var g=0;g<gKids.length;g++)
                            {
                            gcArray.push(gKids[g].label);
                            }
                        }
                    }
                }
            return gcArray;
        },

        //edward salinas
        getHighestAlleleValueFromAllelicOnlyList: function(aol) {
            var maxa=(1);
            for(var a=0;a<aol.length;a++) {
                var myRegexp = /\*(\d+)$/;
                var reMatch=myRegexp.exec(aol[a]);
                if(reMatch) {
                    if(maxa<reMatch[1]) {
                        maxa=reMatch[1];
                    }
                }
            }
            return maxa;
        },

        //zero pad a digit string a up to pl digits
        zeroPadToDigits: function(a,pl) {
            a=a.toString()
            while(a.length<pl) {
                a='0'.concat(a);
            }
            return a;
        },

        //given a full gene name with allele
        //split it into two parts
        //edward salinas
        separateGeneAndAllele: function(a) {
            var myRegexp = /(.+)\*(\d+)$/;
            var reMatch=myRegexp.exec(a);
            var toReturn=[]
            if(reMatch) {
                var gene=reMatch[1]
                var allele=reMatch[2]
                toReturn.push(gene)
                toReturn.push(allele)
            }
            return toReturn;
        },

        //rooted somewhere, make a stacked chart table
        //edward salinas
        makeStackChartableFromValidHierarchyObject:function(o) {
                /*
                It's assumed that the root exists and is non-allelic
                It's assumed that at least one child exists under the root and that it is non-allelic
                It's assumed that all children have hildren and that all these 'grandchildren' are allelic /.+\*\d+/
                */
                var gcLabels=this.getGrandChildrenLabelArray(o);
                var maxa=this.getHighestAlleleValueFromAllelicOnlyList(gcLabels);

                //these colors need to go but they can be used for now
                //colorArray=['#51A351','#BD362F','#11162F'];    //dirty christmas
                var colorArray=['#aec7e8', '#7b94b5', '#486192'];  //hues of blues
                //colorArray=[' #FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#4B0082','#8F00FF']; //rainbow http://suddenwhims.com/2012/10/html-rainbow-color-codes-color-hex/
                var stackDataArray=[];
                var alleleNum=1;
                var immediateChildren=o.children;

                for(alleleNum=1;alleleNum<=maxa;alleleNum++) {
                    var immediateChildIndex=0;
                    var alleleNumZeroPadded=this.zeroPadToDigits(alleleNum,2);

                    var objectColorIndex=((alleleNum-1)%colorArray.length);
                    var color=colorArray[objectColorIndex];
                    var key=alleleNumZeroPadded.toString();


                    var xList=[];
                    var yList=[];
                    var values=[];
                    for(immediateChildIndex=0;immediateChildIndex<immediateChildren.length;immediateChildIndex++) {
                        var withStar=immediateChildren[immediateChildIndex].label+'*'+alleleNumZeroPadded;
                        var geneAndAllele=this.separateGeneAndAllele(withStar);
                        var genex=geneAndAllele[0];
                        var valy=this.getValueReturnZeroAsDefault(withStar,o)
                        xList.push(genex)
                        yList.push(valy);
                    }//for each immediate child

                    for(var v=0;v<xList.length;v++) {
                        var xyObj={'x':xList[v],'y':parseInt(yList[v])};
                        values.push(xyObj);
                    }

                    var keyObj={'key':key,'color':color,'values':values};
                    stackDataArray.push(keyObj);

                }//for each allele up to maximum

            return stackDataArray;
        },

        //edward salinas
        redrawGeneDistChart: function(res) {
            var that = this;
            document.getElementById('stackdiv').innerHTML = this.getHTMLButtonsFromDrillStack(this.drillStack);
            //call this function to trigger reloading
            //inside redrawChart()
            var prevStackStatus=this.stackStatus;
            this.stackStatus=this.doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic(this.BIGJSON,res.label);

            if(prevStackStatus!=this.stackStatus) {
                //clear chart
                d3.select('#analyses-chart svg')
                    .selectAll('g').remove();
            }

            if(!this.stackStatus) {
                var plainChartable=this.makeChartableFromValidHierarchyObject(res);
                nv.addGraph(
                  function() {
                      var chart = nv.models.discreteBarChart()
                          .x(function(d) { return d.label })
                          .y(function(d) { return d.value })
                          .staggerLabels(true)
                          //.staggerLabels(historicalBarChart[0].values.length > 8)
                          .tooltips(true)
                          .showValues(true)
                          .color(['#aec7e8', '#7b94b5', '#486192'])
                          .transitionDuration(500)
                          ;

                      d3.select('#analyses-chart svg')
                          //.datum(historicalBarChart)
                          .datum(plainChartable)
                          .call(chart);

                      nv.utils.windowResize(chart.update);

                      return chart;
                  },
                  function(){
                    d3.selectAll('.nv-bar').on('click',
                        function(e){
                            //get a new 'chartable and invoke redrawChart to get the chart to be re-created

                            var countUnderClick=that.getValueReturnZeroAsDefault(e.label,that.BIGJSON);
                            if(countUnderClick==0 && that.doGrandchildrenExistAndONLYGrandchildrenAreTerminalAndAllelic(that.BIGJSON,e.label)==true) {
                            }
                            else {
                                var res=that.getHierarchySubHierarchyFromObj(that.BIGJSON,e.label);
                                that.drillStack.push(e.label);
                                that.redrawGeneDistChart(res);
                            }


                        });
                    });


                }//plain/discrete data case
            else
                {
                var stackedChartableData=this.makeStackChartableFromValidHierarchyObject(res);
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
                         .tooltip(function(alleleNum,geneName) {
                                var completeName=geneName+'*'+alleleNum;
                                var countDefZero=that.getValueReturnZeroAsDefault(completeName,res);
                                var toolTipTextToDisplay=completeName+' ; count='+countDefZero;
                                return toolTipTextToDisplay;
                          })
                         .groupSpacing(0.1)    //Distance between each group of bars.
                    ;

                    d3.select('#analyses-chart svg')
                       .datum(stackedChartableData)
                       .call(chart);

                    nv.utils.windowResize(function() {
                     chart.update;
                     d3.selectAll('.nv-bar')
                        .classed('hidden', function(d){
                            return d.size <= 0;
                        });
                    });

                    return chart;
                }
                ,function(){
                    d3.selectAll('.nv-bar')
                    .classed('hidden', function(d){
                        return d.size <= 0;
                    })
                    ;
                });


                }//stacked data case


            //inside redrawGeneDistChart
        },//end redrawGeneDistChart



        //given the entire hierarchy, traverse to the location to
        //find the subhierarchy rooted with the given label/name
        getHierarchySubHierarchyFromObj: function(o,desiredLabel) {
            if('label' in o) {

            if(o.label===desiredLabel) {
                return o;
                } else {

                if('children' in o) {
                    var kids=o.children;
                    var numKids=kids.length;
                    for(var k=0;k<numKids;k++) {
                        //var particularKidResult=getHierarchySubHierarchyFromObj(o,desiredLabel)
                        var particularKidResult=this.getHierarchySubHierarchyFromObj(kids[k],desiredLabel);
                        if(particularKidResult!=null) {
                            return particularKidResult;
                            }
                        }
                    } else {
                    return null;
                    }
                return null;
                }
            } else {
            return null;
            }
        }, //end getHierarchySubHierarchyFromObj


    });

    App.Views.Analyses = Analyses;
    return Analyses;
});
