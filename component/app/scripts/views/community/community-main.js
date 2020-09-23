
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

// Community Stats View
import community_stats_template from 'Templates/community/community-stats.html';
var CommunityStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(community_stats_template),

    regions: {
        chartRegion: '#chart-1-region',
    },

    initialize(parameters) {
        this.view = new PieChart();
        this.showChildView('chartRegion', this.view);
    },

    onAttach() {
        this.view.showChart();
    }
});

// Community Query View
import community_query_template from 'Templates/community/community-query.html';
var CommunityQueryView = Marionette.View.extend({
    template: Handlebars.compile(community_query_template)
});

// Community Pagination View
import community_pagination_template from 'Templates/community/community-pagination.html';
var CommunityPaginationView = Marionette.View.extend({
    template: Handlebars.compile(community_pagination_template)
});

// the main community data page
import community_template from 'Templates/community/community-main.html';
export default Marionette.View.extend({
    template: Handlebars.compile(community_template),
    tagName: 'div',
    className: 'community-container',

    // one region for overall statistics
    // one region for query filters
    // one region for results
    // one region for pagination
    regions: {
        statsRegion: '#community-statistics',
        queryRegion: '#community-query',
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

        // setting event for Overview page
        'click #apply-filter': function() {
            console.log('apply filter');
            this.controller.applyFilter();
        }
    },

    // show a loading view, used while fetching the data
    showLoading(ls, lr, tr) {
        this.showChildView('resultsRegion', new LoadingView({loaded_repertoires: ls, loaded_repositories: lr, total_repositories: tr}));
    },

    showResultsList(studyList) {
        console.log(this.controller);
        var view = new CommunityListView({collection: studyList, controller: this.controller});
        this.showChildView('resultsRegion', view);

        this.showChildView('statsRegion', new CommunityStatisticsView ({model: this.model}));

        this.showChildView('queryRegion', new CommunityQueryView ({model: this.model}));

        this.showChildView('paginationRegion', new CommunityPaginationView ({model: this.model}));
    },

});
