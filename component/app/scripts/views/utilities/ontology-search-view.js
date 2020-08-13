//
// ontology-search-view.js
// Generic ontology search view
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
import OntologySearch from 'Scripts/models/ontology-search';

// This shows search results within the dropdown
var OntologyResultsView = Marionette.View.extend({
    template: Handlebars.compile('{{#each terms}}<a class="dropdown-item" id="ontology-select" name="{{this.id}}" title="{{this.label}}">{{this.label}}</a>{{/each}}'),
});

// use Message as the model

import template from 'Templates/util/ontology-search.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),
    regions: {
        resultsRegion: '#ontology-search-results'
    },

    initialize: function(parameters) {

        // customize the view
        this.common = null;
        this.button_label = 'Choose a value';
        this.field_label = 'Ontology';
        this.schema = null;
        this.field = null;
        this.context = null;
        this.selectFunction = null;

        // search results
        this.search = null;

        if (parameters) {
            if (parameters.common) this.common = parameters.common;
            if (parameters.button_label) this.button_label = parameters.button_label;
            if (parameters.field_label) this.field_label = parameters.field_label;
            if (parameters.schema) this.schema = parameters.schema;
            if (parameters.field) this.field = parameters.field;
            if (parameters.context) this.context = parameters.context;
            if (parameters.selectFunction) this.selectFunction = parameters.selectFunction;
        }
    },

    events: {
        // ontology search for study tupe
        'keyup #ontology-search-input': function(e) {
            this.searchOntology(e);
        },

        'click #ontology-select': function(e) {
            this.selectOntology(e);
        },
    },

    templateContext() {
        return {
            // common ontologies
            common_list: this.common,

            // selected ontology label
            button_label: this.button_label,
            field_label: this.field_label
        }
    },

    // when ontology is selected from dropdown, change the title
    // and pass info to callback function
    selectOntology(e) {
        this.selected_ontology = { id: e.target.name, label: e.target.title };
        $('#dropdownOntology').html(e.target.title);
        if (this.selectFunction) this.selectFunction(this.context, this.selected_ontology);
    },

    // perform ontology search as user types
    searchOntology(e) {
        var that = this;
        console.log("search ontology");
        console.log(e.target.value);
        if (e.target.value.length >= 3) {
            that.search = new OntologySearch({schema: that.schema, field: that.field, query: e.target.value});
            that.search.performSearch()
                .then(function(terms) {
                    console.log("search results");
                    console.log(terms);
                    var view = new OntologyResultsView({model: that.search});
                    that.showChildView('resultsRegion', view);
                });
        }
    },

});
