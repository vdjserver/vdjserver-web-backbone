
'use strict';

//
// community-main.js
// Main view for the community data page
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import ADCInfo from 'Scripts/models/adc-info';
import { ADCRepertoireCollection, ADCStudyCollection } from 'Scripts/collections/adc-repertoires';

import CommunityListView from 'Scripts/views/community/community-list';
import LoadingView from 'Scripts/views/utilities/loading-adc-view';

import PieChart from 'Scripts/views/charts/pie';
import CytoscapeView from 'Scripts/views/charts/cytoscape-graph';

import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view-large';
import ModalChartView from 'Scripts/views/utilities/modal-chart-view';
//import AddChartView from 'Scripts/views/community/add-chart';

// Community Stats View
import community_stats_template from 'Templates/community/community-stats.html';
var CommunityStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(community_stats_template),

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    templateContext() {
        if (!this.controller) return {};

        var colls = this.controller.getCollections();
        var num_repos = colls['repositoryInfo'].length;
        var num_studies = colls['studyList'].length;
        var current_sort = colls['studyList']['sort_by'];
        var num_reps = 0;
        for (var i in colls['repertoireCollection'])
            num_reps += colls['repertoireCollection'][i].length;
        var num_rearrangements = 0;
        for (let i = 0; i < colls['studyList'].length; ++i) {
            var study = colls['studyList'].at(i);
            var repos = study.get('repository');
            for (let j = 0; j < repos.length; ++j) {
                let repo_study = study.get('repos').get(repos[j]);
                let statistics = repo_study.get('statistics');
                if (statistics['num_rearrangements']) num_rearrangements += statistics['num_rearrangements'];
            }
        }
        // this puts in the commas
        num_rearrangements = new Intl.NumberFormat().format(num_rearrangements);


        return {
            current_sort: current_sort,
            num_repos: num_repos,
            num_studies: num_studies,
            num_repertoires: num_reps,
            num_rearrangements: num_rearrangements,
            num_clones: 'XXX',
            num_receptors: 'XXX'
        }
    },

    events: {
        // sort results list
        'click #community-sort-select': function(e) {
            // check it is a new sort
            var colls = this.controller.getCollections();
            var current_sort = colls['studyList']['sort_by'];
            if (e.target.name != current_sort)
                this.controller.applySort(e.target.name);
        }
    },

    updateStats(studyList) {
    }
});

// Community Buttons View
import button_template from 'Templates/community/community-buttons.html';
var CommunityButtonsView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function(parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    events: {
        // sort results list
        'click #community-sort-select': function(e) {
            // check it is a new sort
            var colls = this.controller.getCollections();
            var current_sort = colls['studyList']['sort_by'];
            if (e.target.name != current_sort)
                this.controller.applySort(e.target.name);
        }
    },

});

// Community Charts View
import community_charts_template from 'Templates/community/community-charts.html';
var CommunityChartsView = Marionette.View.extend({
    template: Handlebars.compile(community_charts_template),

    regions: {
        chartRegion: '#chart-1-region',
        chart3Region: '#chart-3-region'
    },

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
        //this.view = new CytoscapeView({controller: this.controller});
        //this.showChildView('chart5Region', this.view);
    },

    onAttach() {
        if (this.view) this.view.showChart();

/*
        let properties = window.airrvisualization.createProperties();
        properties.setDataType('VGeneUsage');
        properties.setDataDrilldown(true);
        properties.setSubtitle(["Subgroup/Family", "Gene", "Allele"]);
        properties.setSeriesColors(["rgb(124,181,226)"]);

        properties.setId('chart-2-region').setSort(true).setData(example_stats).setTitle(' ');
        let chart = window.airrvisualization.createChart(properties);
        chart.plot(); */

    },

    updateCharts(studyList) {
        var counts = studyList.countByField('subject.sex');
        console.log(counts);
        var series = [{name: "Sex", data:[]}];
        var total = 0;
        for (var i in counts) total += counts[i];
        for (var i in counts) {
            var obj = { name: i, y: 100 * counts[i] / total, count: counts[i], total_count: total };
            series[0]['data'].push(obj);
        }

        var title = 'Subject Sex';
        var subtitle = total + ' subjects among ' + studyList.length + ' studies';
        this.view = new PieChart({series: series, title: title, subtitle: subtitle});
        this.showChildView('chartRegion', this.view);
        this.view.showChart();
    },

/*
    newChartModal(e) {
        console.log('add new chart page will appear');

        App.router.navigate('/community/addchart', {trigger:false});

        this.showChildView('mainRegion', new AddChartView());

        this.chartView = new AddChartView();

        // var message = new MessageModel({
        //     'header': 'Add a new chart',
        //     'body': '<p>Please select from the options below to create a new chart.</p>',
        //     'confirmText': 'Next',
        //     'cancelText': 'Cancel'
        // });
        //
        // var view = new ModalChartView({model: message});
        // App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        // $('#modal-message').modal('show');
        //
        // console.log(message);
    }, */

    newChartType(e) {
        console.log('selected a chart type');
        // $(this).addClass('selected-chart-type');
    },

    newGroup(e) {
        console.log('clicked Create a Group');
    },

    events: {
        'click .add-chart': 'newChartModal',
        'click #add-chart': 'newChartModal',
        'click .chart-type': 'newChartType',
        'click #create-group': 'newGroup'
    }
});

// Community Pagination View
import community_pagination_template from 'Templates/community/community-pagination.html';
var CommunityPaginationView = Marionette.View.extend({
    template: Handlebars.compile(community_pagination_template),

    // good implementation
    // https://stackoverflow.com/questions/34456577/marionette-collection-pagination

    // Trying to access data to produce paging
    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    templateContext(studyList){
        if (!this.controller) return{};
    }
});

// the main community data page
import community_template from 'Templates/community/community-main.html';
export default Marionette.View.extend({
    template: Handlebars.compile(community_template),
    tagName: 'div',
    className: 'community-container m-0 p-0',

    // one region for dynamic charts
    // one region for results
    // one region for pagination
    regions: {
        chartsRegion: '#community-charts',
        resultsRegion: '#community-results',
        paginationRegion: '#community-pagination'
    },

    initialize(parameters) {
        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    // show a loading view, used while fetching the data
    showLoading(ls, lr, tr, lst) {
        this.showChildView('resultsRegion', new LoadingView({loaded_repertoires: ls, loaded_repositories: lr, total_repositories: tr, loaded_statistics: lst}));
        $("#community-charts").addClass("no-display");
    },

    showResultsList(studyList) {
        $("#community-charts").removeClass("no-display");

        // What's in the data?
        // console.log("what is here: " + this.controller);
        // console.log("studyList " + JSON.stringify(studyList));

        this.statsView = new CommunityStatisticsView ({collection: studyList, controller: this.controller});
        App.AppController.navController.showToolBar(this.statsView);
        this.statsView.updateStats(studyList);

        this.buttonsView = new CommunityButtonsView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);

        this.chartsView = new CommunityChartsView ({model: this.model, controller: this.controller});
        this.showChildView('chartsRegion', this.chartsView);
        this.chartsView.updateCharts(studyList);

        this.resultsView = new CommunityListView({collection: studyList, controller: this.controller});
        this.showChildView('resultsRegion', this.resultsView);

        this.paginationView = new CommunityPaginationView ({collection: studyList, controller: this.controller});
        this.showChildView('paginationRegion', this.paginationView);
        // this.paginationView.updatePagination(studyList);
    },

    updateSummary(studyList) {
        this.statsView = new CommunityStatisticsView ({collection: studyList, controller: this.controller});
        App.AppController.navController.showToolBar(this.statsView);
    },

    newFilterModal(e) {
        console.log('new community filter modal will appear');
        var message = new MessageModel({
            'header': 'Custom Filter',
            'body': '<p>Please select from the options below to set a custom filter.</p>',
            'confirmText': 'Create Filter',
            'cancelText': 'Cancel'
        });

        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');

        console.log(message);
    },
});
