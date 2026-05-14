
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
import Backbone from 'backbone';

import ADCInfo from 'Scripts/models/adc-info';
import { ADCRepertoireCollection, ADCStudyCollection } from 'Scripts/collections/adc-repertoires';

import CommunityListView from 'Scripts/views/community/community-list';
import LoadingView from 'Scripts/views/utilities/loading-adc-view';

import PieChart from 'Scripts/views/charts/pie';

import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view-large';
import ModalChartView from 'Scripts/views/utilities/modal-chart-view';

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
            num_repos: num_repos,
            num_studies: num_studies,
            num_repertoires: num_reps,
            num_rearrangements: num_rearrangements,
            num_clones: 'XXX',
            num_receptors: 'XXX'
        }
    },

    events: {
    },

    updateStats(studyList) {
    }
});

// Community Buttons View
import button_template from 'Templates/community/community-buttons.html';
var CommunityButtonsView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function (parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    templateContext() {
        if (!this.controller) return {};

        var colls = this.controller.getCollections();
        var current_sort = colls['studyList']['sort_by'];

        return {
            current_sort: current_sort
        }
    },

    events: {
        // sort results list
        'click #community-sort-select': function (e) {
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
        chart1Region: '#chart-1-region',
        chart2Region: '#chart-2-region',
        chart3Region: '#chart-3-region',
        chartTableRegion: '#chart-table-region'
    },

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    onAttach() {
        if (this.view) this.view.showChart();
    },

    events: {
        'click .add-chart': 'newChartModal',
        'click #add-chart': 'newChartModal',
        'click .chart-type': 'newChartType',
        'click #create-group': 'newGroup',
    },

    updateCharts(studyList, akResults) {
        // Build data structure for counts
        // if (studyList) var counts = studyList.countByField('subject.sex');

        // Build Pie charts
        if (studyList) {
            // subject sex
            var title = 'Subject Sex';
            var counts = studyList.countByField('subject.sex');
            var series = [{name: "Sex", data:[]}];
            var total = 0;
            for (var i in counts) total += counts[i];
            for (var i in counts) {
                var obj = { name: i, y: 100 * counts[i] / total, count: counts[i], total_count: total };
                series[0]['data'].push(obj);
            }
            var subtitle = total + ' subjects among ' + studyList.length + ' studies';
            this.pieChartView1 = new PieChart({series: series, title: title, subtitle: subtitle});
            this.showChildView('chart1Region', this.pieChartView1);
            this.pieChartView1.showChart('chart-1-region');

            // subject race
            var title = 'Subject Race';
            var counts = studyList.countByField('subject.race');
            var series = [{name: "Race", data:[]}];
            var total = 0;
            for (var i in counts) total += counts[i];
            for (var i in counts) {
                var obj = { name: i, y: 100 * counts[i] / total, count: counts[i], total_count: total };
                series[0]['data'].push(obj);
            }
            var subtitle = total + ' subjects among ' + studyList.length + ' studies';
            this.pieChartView2 = new PieChart({series: series, title: title, subtitle: subtitle});
            this.showChildView('chart2Region', this.pieChartView2);
            this.pieChartView2.showChart('chart-2-region');

            // Disease Diagnosis
            var title = 'Disease Diagnosis';
            var counts = studyList.countByField('diagnosis.disease_diagnosis');
            var series = [{name: "Diagnosis", data:[]}];
            var total = 0;
            for (var i in counts) total += counts[i];
            for (var i in counts) {
                var obj = { name: i, y: 100 * counts[i] / total, count: counts[i], total_count: total };
                series[0]['data'].push(obj);
            }
            var subtitle = total + ' subjects among ' + studyList.length + ' studies';
            this.pieChartView3 = new PieChart({series: series, title: title, subtitle: subtitle});
            this.showChildView('chart3Region', this.pieChartView3);
            this.pieChartView3.showChart('chart-3-region');
        }
    },

    newChartType(e) {
        console.log('selected a chart type');
    },

    newGroup(e) {
        console.log('clicked Create a Group');
    },
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

    templateContext(studyList) {
        if (!this.controller) return {};
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
        this.showChildView('resultsRegion', new LoadingView({ loaded_repertoires: ls, loaded_repositories: lr, total_repositories: tr, loaded_statistics: lst }));
        $("#community-charts").addClass("no-display");
    },

    showResultsList(studyList) {
        $("#community-charts").removeClass("no-display");

        // What's in the data?
        // console.log("what is here: " + this.controller);
        // console.log("studyList " + JSON.stringify(studyList));

        this.statsView = new CommunityStatisticsView({ collection: studyList, controller: this.controller });
        App.AppController.navController.setStatisticsBar(this.statsView, this.controller, this.controller.showStatistics());
        this.statsView.updateStats(studyList);

        this.buttonsView = new CommunityButtonsView({ controller: this.controller });
        App.AppController.navController.showButtonsBar(this.buttonsView);

        this.chartsView = new CommunityChartsView({ model: this.model, controller: this.controller });
        this.showChildView('chartsRegion', this.chartsView);
        this.chartsView.updateCharts(studyList, null);

        this.resultsView = new CommunityListView({ collection: studyList, controller: this.controller });
        this.showChildView('resultsRegion', this.resultsView);

        this.paginationView = new CommunityPaginationView({ collection: studyList, controller: this.controller });
        this.showChildView('paginationRegion', this.paginationView);
        // this.paginationView.updatePagination(studyList);
    },

    updateCharts(studyList, akResults) {
        this.chartsView.updateCharts(studyList, akResults);
    },

    updateSummary(studyList) {
        // update stats
        this.statsView = new CommunityStatisticsView({ collection: studyList, controller: this.controller });
        App.AppController.navController.setStatisticsBar(this.statsView, this.controller, this.controller.showStatistics());

        // update buttons
        this.buttonsView = new CommunityButtonsView({ controller: this.controller });
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

    newFilterModal(e) {
        console.log('new community filter modal will appear');
        var message = new MessageModel({
            'header': 'Custom Filter',
            'body': '<p>Please select from the options below to set a custom filter.</p>',
            'confirmText': 'Create Filter',
            'cancelText': 'Cancel'
        });

        var view = new ModalView({ model: message });
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');

        console.log(message);
    },
});
