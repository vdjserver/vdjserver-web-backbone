
'use strict';

//
// airrkb-filter-controller.js
// Manage a filter and its view
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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
import { Agave } from 'Scripts/backbone/backbone-agave';

import AirrkbFilterQueryView from 'Scripts/views/utilities/airrkb-filter-query-view';
import FilterModel from 'Scripts/models/filter-model';

const querystring = require("querystring");

function AirrkbFilterController(controller, show_filter) {
    this.controller = controller;
    this.show_filter = show_filter;

    // find airrkb section in environment config
    if (! EnvironmentConfig['airrkb']) {
        console.error('Cannot find airrkb section in EnvironmentConfig!');
        return;
    }
    if (! EnvironmentConfig['airrkb']['filter']) {
        console.error('Cannot find airrkb.filter section in EnvironmentConfig!');
        return;
    }
    if (! EnvironmentConfig['airrkb']['filter']['default']) {
        console.error('Cannot find airrkb.filter.default section in EnvironmentConfig!');
        return;
    }

    // default filter
    this.filters = EnvironmentConfig['airrkb']['filter']['default'];

    // TODO: do we need a specialized model?
    this.filter_model = new Backbone.Model();
    this.mainView = new AirrkbFilterQueryView({controller: this, model: this.filter_model, filters: this.filters});
}

AirrkbFilterController.prototype = {
    getFilters: function() {
        return this.filters;
    },

    applyFilter: function(filters, no_search=false) {
        this.filters = filters;
        // call our controller will perform the search
        if (! no_search) this.controller.applyFilter(filters);
        this.showFilter();
    },

    showFilter() {
        console.log("I'm in airrkb-filter-controller showFilter()!");
        this.mainView = new AirrkbFilterQueryView({controller: this, model: this.filter_model, filters: this.filters});
        App.AppController.navController.setFilterBar(this.mainView, this, this.show_filter);
        //if (this.show_filter) this.mainView.setFocus();
    },

    clearFilter() {
        this.filters = EnvironmentConfig['airrkb']['filter']['default'];
        this.mainView = new AirrkbFilterQueryView({controller: this, model: this.filter_model, filters: this.filters});
        App.AppController.navController.setFilterBar(this.mainView, this, this.show_filter);

        this.controller.applyFilter(null);
        //if (this.show_filter) this.mainView.setFocus();
    },

    setFilter(element, val) {
        this.filters[element] = val;
        this.filters.v1 = null;
        if (this.filters.v1_optgroup) delete this.filters.v1_optgroup;
        this.filters.j1 = null;
        if (this.filters.j1_optgroup) delete this.filters.j1_optgroup;
        
        this.filters.v2 = null;
        if (this.filters.v2_optgroup) delete this.filters.v2_optgroup;
        this.filters.j2 = null;
        if (this.filters.j2_optgroup) delete this.filters.j2_optgroup;
        
        this.mainView = new AirrkbFilterQueryView({controller: this, model: this.filter_model, filters: this.filters});
        App.AppController.navController.setFilterBar(this.mainView, this, this.show_filter);
    },

    shouldToggleFilterBar: function() {
        return true;
    },

    didToggleFilterBar: function(status) {
        this.show_filter = status;
    },

};
export default AirrkbFilterController;

