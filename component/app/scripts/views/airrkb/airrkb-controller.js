
'use strict';

//
// airrkb-controller.js
// Manages the airrkb data page
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2026 The University of Texas Southwestern Medical Center
//
// Author: Sam Wollenburg <samuel.wollenburg@utsouthwestern.edu>
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

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import { AIRRKB } from 'Scripts/backbone/backbone-airrkb';
import AIRRKBInfo from 'Scripts/models/airrkb-info';

import { AKCollection } from 'Scripts/collections/airrkb-collection';

import AirrkbMainView from 'Scripts/views/airrkb/airrkb-main';

import AirrkbFilterController from 'Scripts/views/utilities/airrkb-filter-controller';

// Community controller
function AirrkbController() {
    // the project view
    this.projectView = new AirrkbMainView({controller: this});

    // query results
    this.akResults = null;
    this.initAK = new AKCollection(null);

    // active filters
    this.airrkbFilterController = new AirrkbFilterController(this, "adc_rearrangement", true, "adc_rearrangement");
    this.airrkbFilterController.airrkbSearch = true;
    this.airrkbFilterController.showFilter();

    // statistics
    this.show_statistics = true;

    // active visualizations
    this.visualizationController = null;
}

AirrkbController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.projectView)
            this.projectView = new AirrkbMainView({controller: this});
        else if (this.projectView.isDestroyed())
            this.projectView = new AirrkbMainView({controller: this});
        return this.projectView;
    },

    showInitStatistics(queryString) {
        let statistics = this.initAK.initialStatistics();

        this.projectView.showChart(statistics);
        this.airrkbFilterController.showFilter();
    },

    doQuery: function(coll) {
        return new Promise((resolve, reject) => {
            coll.fetch()
                .then(function(data) { resolve(data); })
                .fail(function(error) { reject(error); });
            });
    },

    queryAK: async function(first_filter, second_filter) {
        // generate collection with the API query based upon the filters
        var ak = new AKCollection(null);
        ak.addFilters(first_filter, second_filter);

        this.projectView.showLoading();

        // do the query
        this.akResults = null;
        var that = this;
        const rand_button = document.getElementById('filter-query-apply-airrkb-example');
        rand_button.disabled = true;
        
        await this.doQuery(ak)
            .then(function() {
                that.akResults = ak;
                that.akResults.calcStatistics();
                console.log('akResults', ak);
            })
            .catch(function(error) {
                console.log('error from query: ' + JSON.stringify(error));
                that.projectView.showError();
            });

        if (this.akResults) {
            if (second_filter && second_filter.secondary_search)
                this.akResults.statistics.query = second_filter.secondary_search;
            else
                this.akResults.statistics.query = '';
            this.projectView.showChart(this.akResults.statistics);
            rand_button.disabled = false;
        }
    },

    applyFilter: function(first_filter, second_filter) {
//         if (this.filterController) this.filterController.secondary_filters = filter;
//         else console.log("Where's the filter controller?!?!");  // shouldn't hit...

        if (first_filter || second_filter) {
            this.queryAK(first_filter, second_filter);
        } else this.showInitStatistics();
    },

    shouldToggleStatisticsBar: function() {
        return true;
    },

    didToggleStatisticsBar: function(status) {
        this.show_statistics = status;
    },

    showStatistics: function() {
        return this.show_statistics;
    },
};
export default AirrkbController;
