
'use strict';

//
// community-controller.js
// Manages the community data page
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

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import { AIRRKB } from 'Scripts/backbone/backbone-airrkb';
import AIRRKBInfo from 'Scripts/models/airrkb-info';

import { AKCollection } from 'Scripts/collections/airrkb-collection';

import AirrkbMainView from 'Scripts/views/airrkb/airrkb-main';

import FilterController from 'Scripts/views/utilities/filter-controller';

// Community controller
function AirrkbController() {
    // the project view
    this.projectView = new AirrkbMainView({controller: this});

    // maintain state across multiple views
    this.repositoires = null;
    this.repositoryInfo = null;
    this.repertoireCollections = null;
    this.studies = null;
    this.publications = null;
    this.repertoireFilters = null;
    this.filteredStudies = null;
    this.projectList = null;
    this.currentProject = null;
    this.studyCache = null;
    this.repertoireCache = null;
    this.rearrangementCounts = null;

    // active filters
    this.filterController = new FilterController(this, "adc_rearrangement", true, "adc_rearrangement");
    this.filterController.airrkbSearch = true;
    this.filterController.showFilter();

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
        this.statistics = {};
        this.statistics['num_of_complexes'] = 'XXX'; // this.length;
        this.statistics['num_of_receptors'] = 'XXX'; // colls['receptor'].length; // TODO: we need akc_id from API
        this.statistics['num_of_epitopes'] = 'XXX'; // colls['epitope'].length;
        this.statistics['num_of_mhcs'] = 0;
        this.statistics['num_of_chains'] = 'XXX'; // colls['chain'].length;
        this.statistics['num_of_paired_chains'] = 0;
        this.statistics['num_of_investigations'] = 'XXX'; // colls['investigation'].length;
        this.statistics['num_of_assays'] = 'XXX'; // colls['assay'].length;
        this.statistics['num_of_participants'] = 'XXX'; // colls['participant'].length;
        this.statistics['num_of_specimens'] = 'XXX'; // colls['specimen'].length;

        this.projectView.showChart();
        this.filterController.showFilter();
    },

    doQuery: function(coll) {
        return new Promise((resolve, reject) => {
            coll.fetch()
                .then(function(data) { resolve(data); })
                .fail(function(error) { reject(error); });
            });
    },

    queryRearrangements: async function(filters) {
        // generate query to AIRR Knowledge first
        var ak = new AKCollection(null);
        ak.addFilters(filters);
        var that = this;
        let akResults = await this.doQuery(ak)
            .then(function() {
                that.akResults = ak;
                that.akResults.calcStatistics();
                console.log('akResults', ak);
            })
            .catch(function(error) {
                console.log('error from query: ' + JSON.stringify(error));
            });

        if (this.akResults) this.projectView.updateCharts(null, this.akResults);
    },

    applyFilter: function(_, filter) {
        if (filter) {
            this.queryRearrangements(filter);
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
