//
// filter-query-view.js
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

// Filter View
// toolbar under the navigation bar
import filter_query_template from 'Templates/util/filter-query.html';
export default Marionette.View.extend({
    template: Handlebars.compile(filter_query_template),

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

        // jquery does not support the search input field
        // so have to handle the scenario where the X is pressed or field is cleared
        'input #filter-query-text-search': function(e) {
            if (e.target.value.length != 0) return;
            console.log('full text search clear');
            e.preventDefault();
            this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
            $('#filter-query-text-search').focus();
        },
        // handle keypress too because some browsers want to submit form with Enter
        'keypress #filter-query-text-search': function(e) {
            // prevent default with the enter key
            if (e.key == 'Enter') {
                e.preventDefault();
                this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
            }
        },

        // when user selects from the dropdown filter
        'click #filter-query-select': function(e) {
            console.log('click #filter-query-select');
            // get updated filters
            this.extractFilters();

            // if the filter has dropdown values
            // apply the filter with default value, currently null
            var v = null;
            var vid = null;
            var doApply = false;
            for (var i = 0; i < this.baseFilters.length; ++i) {
                if ((this.baseFilters[i]['title'] == e.target.title) && (this.baseFilters[i]['values'])) {
                    doApply = true;
                    v = 'null';
                    break;
                }
                if ((this.baseFilters[i]['title'] == e.target.title) && (this.baseFilters[i]['objects'])) {
                    doApply = true;
                    vid = 'null';
                    break;
                }
            }

            if (vid)
                this.filters['filters'].push({ field: e.target.name, object: vid, title: e.target.title });
            else
                this.filters['filters'].push({ field: e.target.name, value: v, title: e.target.title });

            this.controller.applyFilter(this.filters, this.extractSecondaryFilters());
        },

        // when user clicks X on active filter to remove it
        'click #filter-query-active-filter': function(e) {
            console.log('remove active filter');

            for (var f = 0; f < this.filters['filters'].length; ++f) {
                if (this.filters['filters'][f]['field'] == e.target.getAttribute('name')) {
                    this.filters['filters'].splice(f,1);
                    break;
                }
            }
            this.controller.applyFilter(this.filters, this.extractSecondaryFilters());
        },

        // when user hits enter in a filter text box
        'keyup #filter-query-text': function(e) {
            if (e.key == 'Enter') {
                if (e.target.value.length > 0)
                    this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
            }
        },

        // when user selects value from list
        'change #filter-query-text': function(e) {
            console.log('select filter value');
            this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
        },

        // when user clicks apply
        'click #filter-query-apply': function() {
            console.log('apply filter');
            this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
        },

        //
        // Events for the secondary search fields
        //

        // jquery does not support the search input field
        // so have to handle the scenario where the X is pressed or field is cleared
        'input #filter-secondary-text-search': function(e) {
            if (e.target.value.length != 0) return;
            console.log('full text search clear');
            e.preventDefault();
            this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
            $('#filter-secondary-text-search').focus();
        },
        // handle keypress too because some browsers want to submit form with Enter
        'keypress #filter-secondary-text-search': function(e) {
            // prevent default with the enter key
            if (e.key == 'Enter') {
                console.log('secondary hit enter');
                e.preventDefault();
                this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
            }
        },

        // when user selects from the dropdown filter
        'click #filter-secondary-select': function(e) {
            console.log('click #filter-secondary-select');
            // get updated filters
            this.extractSecondaryFilters();

            // if the filter has dropdown values
            // apply the filter with default value, currently null
            var v = null;
            var vid = null;
            var doApply = false;
            for (var i = 0; i < this.secondaryBaseFilters.length; ++i) {
                if ((this.secondaryBaseFilters[i]['title'] == e.target.title) && (this.secondaryBaseFilters[i]['values'])) {
                    doApply = true;
                    v = 'null';
                    break;
                }
                if ((this.secondaryBaseFilters[i]['title'] == e.target.title) && (this.secondaryBaseFilters[i]['objects'])) {
                    doApply = true;
                    vid = 'null';
                    break;
                }
            }

            if (vid)
                this.secondaryFilters['filters'].push({ field: e.target.name, object: vid, title: e.target.title });
            else
                this.secondaryFilters['filters'].push({ field: e.target.name, value: v, title: e.target.title });

            this.controller.applyFilter(this.extractFilters(), this.secondaryFilters, !doApply);
        },

        // when user clicks X on active filter to remove it
        'click #filter-secondary-active-filter': function(e) {
            console.log('remove active filter');

            for (var f = 0; f < this.secondaryFilters['filters'].length; ++f) {
                if (this.secondaryFilters['filters'][f]['field'] == e.target.getAttribute('name')) {
                    this.secondaryFilters['filters'].splice(f,1);
                    break;
                }
            }
            this.controller.applyFilter(this.extractFilters(), this.secondaryFilters, true);
        },

        // when user hits enter in a filter text box
        'keyup #filter-secondary-text': function(e) {
            if (e.key == 'Enter') {
                console.log('secondary hit enter');
                if (e.target.value.length > 0)
                    this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters());
            }
        },

        // when user selects value from list
        'change #filter-secondary-text': function(e) {
            console.log('select filter value');
            this.controller.applyFilter(this.extractFilters(), this.extractSecondaryFilters(), true);
        },
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
        this.setFocus();
    },

    // construct filters from view state
    extractFilters() {
        var filters = { filters: [] };

        // full text search
        var v = $('#filter-query-text-search').val();
        if (v && v.length > 0) {
            filters['full_text_search'] = v;
        }

        // filter dropdowns
        var af = $('[id=filter-query-active-filter]');
        var av = $('[id=filter-query-text]');
        for (var i = 0; i < af.length; ++i) {
            var v = av[i]['value'];
            var vid = null;
            if (av[i].selectedOptions) vid = av[i].selectedOptions[0]['id'];
            if (v.length == 0) {
                v = null;
                vid = null;
            }
            if (vid) {
                // if id set on option then it is an ontology
                filters['filters'].push({ field: af[i]['name'], object: vid, title: av[i].getAttribute('title')});
            } else {
                // otherwise just plain value
                filters['filters'].push({ field: af[i]['name'], value: v, title: av[i].getAttribute('title')});
            }
        }

        this.filters = filters;
        return this.filters;
    },

    // construct secondary filters from view state
    extractSecondaryFilters() {
        if (!this.secondary_model) return null;
        var filters = { filters: [] };

        // full text search
        var v = $('#filter-secondary-text-search').val();
        if (v && v.length > 0) {
            filters['secondary_search'] = v;
        }

        // filter dropdowns
        var af = $('[id=filter-secondary-active-filter]');
        var av = $('[id=filter-secondary-text]');
        for (var i = 0; i < af.length; ++i) {
            var v = av[i]['value'];
            var vid = null;
            if (av[i].selectedOptions) vid = av[i].selectedOptions[0]['id'];
            if (v.length == 0) {
                v = null;
                vid = null;
            }
            if (vid) {
                // if id set on option then it is an ontology
                filters['filters'].push({ field: af[i]['name'], object: vid, title: av[i].getAttribute('title')});
            } else {
                // otherwise just plain value
                filters['filters'].push({ field: af[i]['name'], value: v, title: av[i].getAttribute('title')});
            }
        }

        this.secondaryFilters = filters;
        return this.secondaryFilters;
    },

    setFilterQueryText: function() {
        // console.log('FQV setFilterQueryText: ' + this.filters.filters);
        this.$('#filter-query-text').val(this.filters.filters[0].value);
    },

});

