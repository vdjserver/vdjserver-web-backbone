
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

import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view-large';

// Community Query/Filter View
import community_query_template from 'Templates/community/community-query.html';
var CommunityQueryView = Marionette.View.extend({
    template: Handlebars.compile(community_query_template),

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    templateContext() {
        if (!this.controller) return {};

        var colls = this.controller.getCollections();
        var current_sort = colls['studyList']['sort_by'];
        console.log(current_sort);

        return {
            current_sort: current_sort
        }
    },

    events: {
        //
        // Overview page specific events
        //

        'click #community-sort-select': function(e) {
            // check it is a new sort
            var colls = this.controller.getCollections();
            var current_sort = colls['studyList']['sort_by'];
            if (e.target.name != current_sort)
                this.controller.applySort(e.target.name);
        },
    }
});

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

        return {
            num_repos: num_repos,
            num_studies: num_studies,
            num_reps: num_reps
        }
    },

    updateStats(studyList) {
    }
});

// Community Charts View
import community_charts_template from 'Templates/community/community-charts.html';
var CommunityChartsView = Marionette.View.extend({
    template: Handlebars.compile(community_charts_template),

    regions: {
        chartRegion: '#chart-1-region',
        chart2Region: '#chart-2-region',
        chart3Region: '#chart-3-region'
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
    }
});

// Community Pagination View
import community_pagination_template from 'Templates/community/community-pagination.html';
var CommunityPaginationView = Marionette.View.extend({
    template: Handlebars.compile(community_pagination_template),

    // Trying to access data to produce paging
    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    templateContext(){
        if (!this.controller) return{};

        // What's in the data?
        console.log(this.controller);

        var colls = this.controller.getCollections();
        var num_studies = colls['studyList'].length;

        return {
            num_studies: num_studies,
        }
    },

    updatePagination(studyList) {
        // set up pagination settings
        var paging = {
            total: num_studies,
            perPage: 10,
            pages: Math.ceil(this.total / this.perPage),
        };

        // get number of studies
        console.log("update pagination: " + num_studies);

        // divide by number of studies we want per page

        // create pagination links for each number of page sets


    }

    // showResultsList(studyList) {
    //     console.log(this.controller);
    // }
});

// the main community data page
import community_template from 'Templates/community/community-main.html';
export default Marionette.View.extend({
    template: Handlebars.compile(community_template),
    tagName: 'div',
    className: 'community-container',

    // one region for query filters
    // one region for dynamic stats
    // one region for dynamic charts
    // one region for results
    // one region for pagination
    regions: {
        queryRegion: '#community-query',
        statsRegion: '#community-statistics',
        chartsRegion: '#community-charts',
        resultsRegion: '#community-results',
        paginationRegion: '#community-pagination'
    },

    initialize(parameters) {
        console.log('Initialize');
        this.studyList = null;
        this.filteredStudyList = null;

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    events: {
        //
        // Overview page specific events
        //

        'click #community-filter-button': function() {
            $("#community-filter").toggle();
        },

        // Hiding Studies Filter when removed
        'click #remove-filter-studies': function() {
            $("#filter-studies").toggle();
        },

        // Hiding Repertoires Filter when removed
        'click #remove-filter-reps': function() {
            $("#filter-reps").toggle();
        },

        // Hiding ADC Filter when removed
        'click #remove-filter-adc': function() {
            $("#filter-adc").toggle();
        },

        // setting event for Overview page
        'click #apply-filter': function() {
            console.log('apply filter');
            this.controller.applyFilter();
        },

        // Setting event for "New Filter" Modal
        'click #new-community-filter': 'newFilterModal'
    },

    // show a loading view, used while fetching the data
    showLoading(ls, lr, tr) {
        this.showChildView('resultsRegion', new LoadingView({loaded_repertoires: ls, loaded_repositories: lr, total_repositories: tr}));
        $("#community-charts").addClass("no-display");
    },

    showResultsList(studyList) {
        console.log(this.controller);
        $("#community-charts").removeClass("no-display");

        this.filterView = new CommunityQueryView ({model: this.model, controller: this.controller});
        this.showChildView('queryRegion', this.filterView);

        this.statsView = new CommunityStatisticsView ({collection: studyList, controller: this.controller});
        this.showChildView('statsRegion', this.statsView);
        this.statsView.updateStats(studyList);

        this.chartsView = new CommunityChartsView ({model: this.model, controller: this.controller});
        this.showChildView('chartsRegion', this.chartsView);
        this.chartsView.updateCharts(studyList);

        this.resultsView = new CommunityListView({collection: studyList, controller: this.controller});
        this.showChildView('resultsRegion', this.resultsView);

        this.paginationView = new CommunityPaginationView ({collection: studyList, controller: this.controller});
        this.showChildView('paginationRegion', this.paginationView);
        this.paginationView.updatePagination(studyList);
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
    }

});
