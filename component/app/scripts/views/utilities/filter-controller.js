
'use strict';

//
// filter-controller.js
// Manage a filter and its view
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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

import { Agave } from 'Scripts/backbone/backbone-agave';

import FilterQueryView from 'Scripts/views/utilities/filter-query-view';
import FilterModel from 'Scripts/models/filter-model';

function FilterController(controller, filter_type, show_filter) {
    this.controller = controller;

    // manages just one type
    this.filter_type = filter_type;
    if (! this.filter_type) {
        // TODO: error modal to user?
        console.error('No filter name provided for filter manager.');
        return;
    }

    // find filter in environment config
    if (! EnvironmentConfig['filters']) {
        console.error('Cannot find filters in EnvironmentConfig.');
        return;
    }
    if (! EnvironmentConfig['filters'][this.filter_type]) {
        console.error('Cannot find filter name (' + this.filter_type + ') in EnvironmentConfig filters.');
        return;
    }

    // setup filters
    if (show_filter) this.show_filter = true;
    else this.show_filter = false;
    this.filter_model = new FilterModel({filter_type: this.filter_type});
    this.mainView = new FilterQueryView({controller: this, model: this.filter_model});
    this.filters = {};
}

FilterController.prototype = {
    // construct filter values from data/schema
    constructValues: function(collection) {
        this.filter_model.constructValues(collection);
    },

    getFilters: function() {
        return this.filters;
    },

    applyFilter: function(filters) {
        this.filters = filters;
        if ((!filters['full_text_search']) && (filters['filters'].length == 0))
            this.controller.applyFilter(null);
        else
            this.controller.applyFilter(this.filters);
        this.showFilter();
    },

    showFilter() {
        this.mainView = new FilterQueryView({controller: this, model: this.filter_model, filters: this.filters});
        App.AppController.navController.setController(this);
        App.AppController.navController.setFilterBarStatus(this.mainView, this.show_filter);
        if (this.show_filter) this.mainView.setFocus();
    },

    shouldToggleFilterBar: function() {
        return true;
    },

    didToggleFilterBar: function(status) {
        this.show_filter = status;
    },

};
export default FilterController;

