
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

import AIRRSchema from 'airr-schema';
import ADCInfo from 'Scripts/models/adc-info';
import { ADCRepertoireCollection, ADCStudyCollection } from 'Scripts/collections/adc-repertoires';

import CommunityListView from 'Scripts/views/community/community-list';
import LoadingView from 'Scripts/views/utilities/loading-adc-view';

import PieChart from 'Scripts/views/charts/pie';

import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view-large';
import ModalChartView from 'Scripts/views/utilities/modal-chart-view';

// Community Query/Filter View
// toolbar under the navigation bar
import community_query_template from 'Templates/community/community-query.html';
var CommunityQueryView = Marionette.View.extend({
    template: Handlebars.compile(community_query_template),

    initialize(parameters) {
        this.filters = {};
        this.baseFilters = [];

        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.filters) this.filters = parameters.filters;
            if (parameters.base) this.baseFilters = parameters.base;
        }
    },

    templateContext() {
        if (!this.controller) return {};

        var f = this.filters['filters'];
        if (f && f.length == 0) f = null;
        console.log(this.filters);

        return {
            full_text_search: this.filters['full_text_search'],
            base: this.baseFilters,
            filters: f,
            title: this.filters['title']
        }
    },

    events: {
        // perform search when user hits enter in full text search box
        'search #community-text-search': function(e) {
            console.log('search');
            this.controller.applyFilter(this.extractFilters());
        },

        // when user selects from the dropdown filter
        'click #community-filter-select': function(e) {
            // get updated filters
            this.extractFilters();

            // if the filter has dropdown values
            // apply the filter with default value, currently null
            var v = null;
            var doApply = false;
            for (var i = 0; i < this.baseFilters.length; ++i) {
                if ((this.baseFilters[i]['title'] == e.target.title) && (this.baseFilters[i]['values'])) {
                    doApply = true;
                    v = 'null';
                    break;
                }
            }

            this.filters['filters'].push({ field: e.target.name, value: v, title: e.target.title });

            if (doApply)
                this.controller.applyFilter(this.filters);
            else
                this.controller.updateFilters(this.filters);
        },

        // when user clicks X on active filter to remove it
        'click #community-active-filter': function(e) {
            console.log('remove active filter');
            console.log(e);

            for (var f = 0; f < this.filters['filters'].length; ++f) {
                if (this.filters['filters'][f]['field'] == e.target.getAttribute('name')) {
                    this.filters['filters'].splice(f,1);
                    break;
                }
            }
            this.controller.updateFilters(this.filters);
            this.controller.applyFilter(this.extractFilters());
        },

        // when user hits enter in a filter text box
        'keyup #community-filter-text': function(e) {
            if (e.key == 'Enter') {
                if (e.target.value.length > 0)
                    this.controller.applyFilter(this.extractFilters());
            }
        },

        // when user selects value from list
        'change #community-filter-text': function(e) {
            console.log('select filter value');
            this.controller.applyFilter(this.extractFilters());
        },

        // when user clicks apply
        'click #community-filter-apply': function() {
            console.log('apply filter');
            this.controller.applyFilter(this.extractFilters());
        },
    },

    onAttach() {
        // see if there is a filter text box we should focus on
        var av = $('[id=community-filter-text]');
        for (var i = 0; i < av.length; ++i) {
            if (av[i].getAttribute('type') == 'text') {
                if (av[i]['value'].length == 0) {
                    av[i].focus();
                    break;
                }
            }
        }
        // otherwise focus on full text search
        if (av.length == 0) $('#community-text-search').focus();
    },

    // construct filters from view state
    extractFilters() {
        var filters = { filters: [] };

        // full text search
        var v = $('#community-text-search').val();
        if (v && v.length > 0) {
            filters['full_text_search'] = v;
        }

        // filter dropdowns
        var af = $('[id=community-active-filter]');
        var av = $('[id=community-filter-text]');
        for (var i = 0; i < af.length; ++i) {
            var v = av[i]['value'];
            if (v.length == 0) v = null;
            //if (v == 'null') v = 'null';
            filters['filters'].push({ field: af[i]['name'], value: v, title: av[i].getAttribute('title')});
        }

        this.filters = filters;
        return this.filters;
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
        var current_sort = colls['studyList']['sort_by'];
        var num_reps = 0;
        for (var i in colls['repertoireCollection'])
            num_reps += colls['repertoireCollection'][i].length;


        return {
            current_sort: current_sort,
            num_repos: num_repos,
            num_studies: num_studies,
            num_reps: num_reps
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

    // templateContext() {
    //     if (!this.controller) return {};
    //
    //     var colls = this.controller.getCollections();
    //     var num_repos = colls['repositoryInfo'].length;
    //     var num_studies = colls['studyList'].length;
    //     var current_sort = colls['studyList']['sort_by'];
    //     var num_reps = 0;
    //     for (var i in colls['repertoireCollection'])
    //         num_reps += colls['repertoireCollection'][i].length;
    //
    //
    //     return {
    //         current_sort: current_sort,
    //         num_repos: num_repos,
    //         num_studies: num_studies,
    //         num_reps: num_reps
    //     }
    // },

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
    },

    newChartModal(e) {
        console.log('add new chart page will appear');

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
    },

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

    // one region for query filters
    // one region for dynamic stats
    // one region for dynamic charts
    // one region for results
    // one region for pagination
    regions: {
        chartsRegion: '#community-charts',
        resultsRegion: '#community-results',
        paginationRegion: '#community-pagination'
    },

    initialize(parameters) {
        console.log('Initialize');
        this.studyList = null;
        this.filteredStudyList = null;

        // predefined filters
        this.baseFilters = [];
        this.baseFilters.push({ title: "Study ID", field: "study.study_id"});
        this.baseFilters.push({ title: "Subject ID", field: "subject.subject_id"});
        this.baseFilters.push({ title: "Subject Organism", field: "subject.organism", data: true});
        this.baseFilters.push({ title: "Subject Sex", field: "subject.sex",
            values: AIRRSchema['Subject']['properties']['sex']['enum'] });
        this.baseFilters.push({ title: "Subject Diagnosis", field: "subject.organism", data: true});
        this.baseFilters.push({ title: "Sample ID", field: "sample.sample_id"});
        console.log(this.baseFilters);

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    // show a loading view, used while fetching the data
    showLoading(ls, lr, tr) {
        this.showChildView('resultsRegion', new LoadingView({loaded_repertoires: ls, loaded_repositories: lr, total_repositories: tr}));
        $("#community-charts").addClass("no-display");
    },

    showResultsList(studyList, filters) {
        $("#community-charts").removeClass("no-display");

        // What's in the data?
        // console.log("what is here: " + this.controller);
        // console.log("studyList " + JSON.stringify(studyList));

            console.log("update pagination function");
            var tableView;
            var pageQty = 1;
            var options = {
              collection: studyList,
              paginatedCollection: [],
              // url: '/'
            };

            // console.log("options: " + JSON.stringify(options));

            options.collection.fetch({url:'/'}).then(_.bind(function () {
             // The collection is guaranteed to be filled
             // Set up your paginated collection
              for (var i = 0; i < options.collection.length; i += pageQty) {
                options.paginatedCollection[i/pageQty] =
                  options.collection.models.slice(i, i + pageQty);
              }

              // Load your first page
              options.collection.reset(options.paginatedCollection[0]);

              // Submit both the first page collection and your paginatedCollection to the view
              tableView = new CommunityListView(options);
              // console.log("tableView: " + tableView);
              tableView.render(resultsView) // Append the tableView.el wherever you want
            }, this));

        // show filters as toolbar under navigation bar
        this.filterView = new CommunityQueryView ({model: this.model, controller: this.controller, base: this.baseFilters, filters: filters});
        App.AppController.navController.showToolbar1Bar(this.filterView);
        //this.showChildView('queryRegion', this.filterView);

        this.statsView = new CommunityStatisticsView ({collection: studyList, controller: this.controller});
        App.AppController.navController.showToolbar2Bar(this.statsView);
        //this.showChildView('statsRegion', this.statsView);
        this.statsView.updateStats(studyList);

        this.chartsView = new CommunityChartsView ({model: this.model, controller: this.controller});
        this.showChildView('chartsRegion', this.chartsView);
        this.chartsView.updateCharts(studyList);

        this.resultsView = new CommunityListView({collection: studyList, controller: this.controller});
        this.showChildView('resultsRegion', this.resultsView);

        this.paginationView = new CommunityPaginationView ({collection: studyList, controller: this.controller});
        this.showChildView('paginationRegion', this.paginationView);
        // this.paginationView.updatePagination(studyList);
    },

    updateFilters(filters) {
        this.filterView = new CommunityQueryView ({model: this.model, controller: this.controller, base: this.baseFilters, filters: filters});
        App.AppController.navController.showToolbar1Bar(this.filterView);
        //this.showChildView('queryRegion', this.filterView);
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
