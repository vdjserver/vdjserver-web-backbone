//
// airrkb-filter-query-view.js
// Generic filter view, used in toolbar
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import TrNames from 'Scripts/views/airrkb/germline-labels.js';

// Filter View
// toolbar under the navigation bar
import airrkb_filter_query_template from 'Templates/util/airrkb-filter-query.html';
import airrkb_filter_query_template_2 from 'Templates/util/airrkb-filter-query-2.html';
export default Marionette.View.extend({
    templates: {
        horizontal: Handlebars.compile(airrkb_filter_query_template),
        vertical: Handlebars.compile(airrkb_filter_query_template_2),
    },

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;

            // construct base filters
            if (parameters.filter_type) this.filter_type = parameters.filter_type;
            if (parameters.filters) this.filters = parameters.filters;
        }
        // Select template
        if (EnvironmentConfig.airrkb.filter.layout == "horizontal") {this.template = this.templates.horizontal;}
        if (EnvironmentConfig.airrkb.filter.layout == "vertical") {this.template = this.templates.vertical;}
    },

    templateContext() {
        if (!this.controller) return {};

        return {
            filters: this.filters,
            tr_names: TrNames,
        }
    },

    events: {
        //
        // Events for the primary search fields
        //

        // when user clicks search button
        'click #filter-query-apply': function() {
            console.log('apply filter');
            this.controller.applyFilter(this.extractFilters());
        },

        // when user clicks clear button
        'click #filter-query-clear': function() {
            this.controller.clearFilter();
        },

        // when user needs example AIRRKB
        'click #filter-query-apply-airrkb-example': function() {
            let receptor_type = $('#filter-query-chain-selectpicker').val();
            var examples = EnvironmentConfig.airrkb.examples[receptor_type];
            if (!examples) return;
            if (examples.length == 0) return;

            var randIdx = Math.floor(Math.random() * examples.length);
            this.filters = examples[randIdx];
            this.controller.applyFilter(this.filters, true);
        },

        // switch chain
        'change #filter-query-chain-selectpicker': function(e) {
            const chain_string = $(e.target).val();
            this.$('[class$="-chain-select"]').attr('hidden', true);
            this.$(`.${chain_string}-chain-select`).removeAttr('hidden').show();
            this.$(`.both-chain-select`).removeAttr('hidden').show();
        },

    },

    onAttach() {
        $('.selectpicker').selectpicker();
    },

    // construct filters from view state
    extractFilters() {
        var filters = { "receptor_type": null, "host_species": null, "junction1": null, "v1": null, "j1": null, "junction2": null, "v2": null, "j2": null };

        // extract form values
        filters['receptor_type'] = $('#filter-query-chain-selectpicker').val();
        var host_species = $('#filter-query-species-selectpicker').val();
        if (host_species != 'any') filters['host_species'] = host_species;

        if (filters['receptor_type'] == 'alpha-beta') {
            var junction1 = $('#alpha-junction').val();
            if (junction1.length > 0) filters['junction1'] = junction1.toUpperCase();
            var v1 = $('#alpha-v-selectpicker').val()
            if (v1 != 'any') filters['v1'] = v1;
            var j1 = $('#alpha-j-selectpicker').val()
            if (j1 != 'any') filters['j1'] = j1;
    
            var junction2 = $('#beta-junction').val();
            if (junction2.length > 0) filters['junction2'] = junction2.toUpperCase();
            var v2 = $('#beta-v-selectpicker').val()
            if (v2 != 'any') filters['v2'] = v2;
            var j2 = $('#beta-j-selectpicker').val()
            if (j2 != 'any') filters['j2'] = j2;
        } else if (filters['receptor_type'] == 'gamma-delta') {
            var junction1 = $('#gamma-junction').val();
            if (junction1.length > 0) filters['junction1'] = junction1.toUpperCase();
            var v1 = $('#gamma-v-selectpicker').val()
            if (v1 != 'any') filters['v1'] = v1;
            var j1 = $('#gamma-j-selectpicker').val()
            if (j1 != 'any') filters['j1'] = j1;
    
            var junction2 = $('#delta-junction').val();
            if (junction2.length > 0) filters['junction2'] = junction2.toUpperCase();
            var v2 = $('#delta-v-selectpicker').val()
            if (v2 != 'any') filters['v2'] = v2;
            var j2 = $('#delta-j-selectpicker').val()
            if (j2 != 'any') filters['j2'] = j2;
        }

        this.filters = filters;
        return this.filters;
    },

});

