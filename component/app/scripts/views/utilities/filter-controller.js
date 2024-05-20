
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

function FilterController(controller, filter_type, show_filter, secondary_filter) {
    this.controller = controller;

    // required filter type
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

    this.secondary_filter = secondary_filter;
    if (this.secondary_filter) {
        if (! EnvironmentConfig['filters'][this.secondary_filter]) {
            console.error('Cannot find filter name (' + this.secondary_filter + ') in EnvironmentConfig filters.');
            return;
        }
    }

    // setup filters
    if (show_filter) this.show_filter = true;
    else this.show_filter = false;
    this.filter_model = new FilterModel({filter_type: this.filter_type});
    this.secondary_model = null;
    if (this.secondary_filter) this.secondary_model = new FilterModel({filter_type: this.secondary_filter});
    this.mainView = new FilterQueryView({controller: this, model: this.filter_model, secondary_model: this.secondary_model});
    this.filters = {};
    this.secondary_filters = {};
}

FilterController.prototype = {
    // construct filter values from data/schema
    constructValues: function(collection) {
        this.filter_model.constructValues(collection);
    },

    getFilters: function() {
        return this.filters;
    },

    applyFilter: function(filters, secondary_filters, no_apply=false) {
        this.filters = filters;
        let first_filters = filters;
        if ((!filters['full_text_search']) && (filters['filters'].length == 0))
            first_filters = null;

        let second_filters = null;
        if (this.secondary_model) {
            this.secondary_filters = secondary_filters;
            second_filters = secondary_filters;
            if ((!secondary_filters['secondary_search']) && (secondary_filters['filters'].length == 0))
                second_filters = null;
        }

        if (! no_apply) this.controller.applyFilter(first_filters, second_filters);
        this.showFilter();
    },

    showFilter() {
        this.mainView = new FilterQueryView({controller: this, model: this.filter_model, filters: this.filters, secondary_model: this.secondary_model, secondary_filters: this.secondary_filters});
        App.AppController.navController.setFilterBar(this.mainView, this, this.show_filter);
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

