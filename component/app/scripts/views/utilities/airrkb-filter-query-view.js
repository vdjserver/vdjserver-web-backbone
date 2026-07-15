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

// Filter View
// toolbar under the navigation bar
import airrkb_filter_query_template from 'Templates/util/airrkb-filter-query-3.html';
import airrkb_filter_query_template_2 from 'Templates/util/airrkb-filter-query-2.html';
export default Marionette.View.extend({
    templates: {
        horizontal: Handlebars.compile(airrkb_filter_query_template),
        vertical: Handlebars.compile(airrkb_filter_query_template_2),
    },

    initialize(parameters) {
        // TODO, pull from environment-config?
        this.filters = {};
        this.baseFilters = [];
        this.customFilters = [];
        this.secondaryFilters = {};
        this.secondaryBaseFilters = [];
        this.secondaryCustomFilters = [];

        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;

            // construct base filters
            if (parameters.filter_type) this.filter_type = parameters.filter_type;
            if (parameters.filters) this.filters = parameters.filters;

            // secondary filters
            if (parameters.secondary_model) this.secondary_model = parameters.secondary_model;
            if (parameters.secondary_filters) this.secondaryFilters = parameters.secondary_filters;
        }
        // Select template
        if(EnvironmentConfig.airrkb.filter.layout == "horizontal") {this.template = this.templates.horizontal;}
        if(EnvironmentConfig.airrkb.filter.layout == "vertical") {this.template = this.templates.vertical;}

        this.baseFilters = this.model.baseFilters();
        this.customFilters = this.model.customFilters();
        if (this.secondary_model) this.secondaryBaseFilters = this.secondary_model.baseFilters();
    },

    templateContext() {
        if (!this.controller) return {};

        var f = this.filters['filters'];
        if (f && f.length == 0) f = null;

        var sm = false;
        var sf = null;
        if (this.secondary_model) {
            sm = true;
            sf = this.secondaryFilters['filters'];
            if (sf && sf.length == 0) sf = null;
        }

        return {
            full_text_search: this.filters['full_text_search'],
            base: this.baseFilters,
            filters: f,
            title: this.filters['title'],
            secondary_model: sm,
            secondary_search: this.secondaryFilters['secondary_search'],
            secondary: this.secondaryBaseFilters,
            secondary_filters: sf,
            secondary_title: this.secondaryFilters['title']
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

        // when user needs example AIRRKB
        'click #filter-query-apply-airrkb-example': function() {
            var examples = EnvironmentConfig.airrkb.examples;
            var randIdx = Math.floor(Math.random() * examples.length);

            App.router.navigate('/airrkb', {trigger: false});
            this.controller.applyFilter(examples[randIdx].filters, examples[randIdx].secondary_filters);
            this.controller.showFilter();
        },

        'change #filter-query-chain-selectpicker': function(e) {
            const chain_string = $(e.target).val();
            this.$('[class$="-chain-select"]').attr('hidden', true);
            this.$(`.${chain_string}-chain-select`).removeAttr('hidden').show();
        },

        'click #filter-query-change-template': function(e) {

            switch(this.template) {
                case this.templates.airrkb:
                    this.template = this.templates.airrkb_2;
                    break;
                case this.templates.airrkb_2:
                    this.template = this.templates.airrkb_3;
                    break
                case this.templates.airrkb_3:
                    this.template = this.templates.airrkb_4;
                    break
                default:
                    this.template = this.templates.airrkb;
            }
            this.render();
            $('.selectpicker').selectpicker();
        }
    },

    setFocus() {
        // see if there is a filter text box we should focus on
        var av = $('[id=filter-query-text]');
        for (var i = 0; i < av.length; ++i) {
            if (av[i].getAttribute('type') == 'text') {
                if (av[i]['value'].length == 0) {
                    av[i].focus();
                    break;
                }
            }
        }
        // otherwise focus on full text search
        if (av.length == 0) $('#filter-query-search').focus();
    },

    onAttach() {
        $('.selectpicker').selectpicker();
        //this.setFocus();
    },

    // construct filters from view state
    extractFilters() {
        var filters = { "receptor_type": null, "host_species": null, "junction1": null, "v1": null, "j1": null, "junction2": null, "v2": null, "j2": null };

        // extract form values
        filters['receptor_type'] = $('#filter-query-chain-selectpicker').val();
        var host_species = $('#filter-query-species-selectpicker').val();
        if (host_species != 'any') filters['host_species'] = host_species;

        var junction1 = $('#cdr3-1').val();
        if (junction1.length > 0) filters['junction1'] = junction1;
        var v1 = $('#filter-query-first-v-selectpicker').val()
        if (v1 != 'any') filters['v1'] = v1;
        var j1 = $('#filter-query-first-v-selectpicker').val()
        if (j1 != 'any') filters['j1'] = j1;

        var junction2 = $('#cdr3-2').val();
        if (junction2.length > 0) filters['junction2'] = junction2;
        var v2 = $('#filter-query-second-v-selectpicker').val()
        if (v2 != 'any') filters['v2'] = v2;
        var j2 = $('#filter-query-second-v-selectpicker').val()
        if (j2 != 'any') filters['j2'] = j2;

        this.filters = filters;
        return this.filters;
    },

});

