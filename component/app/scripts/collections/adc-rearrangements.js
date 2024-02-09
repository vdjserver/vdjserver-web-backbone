
'use strict';

//
// adc-rearrangements.js
// AIRR Rearrangement collection from ADC query
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
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

import Backbone from 'backbone';
import { ADC } from 'Scripts/backbone/backbone-adc';
import { ADCRearrangement } from 'Scripts/models/adc-rearrangement';

import Project from 'Scripts/models/agave-project';
import { Subject, SampleProcessing, Repertoire } from 'Scripts/models/agave-metadata';

export var ADCRearrangementCollection = ADC.Collection.extend({
    model: ADCRearrangement,
    initialize: function(models, parameters) {
        if (parameters && parameters.repertoires) {
            this.repertoires = parameters.repertoires;
            if (! parameters.repository) parameters['repository'] = this.repertoires.repository;
        }

        ADC.Collection.prototype.initialize.apply(this, [models, parameters]);

        // construct basic query limited by repertoires
        this.baseQuery();
    },
    url: function() {
        return this.apiHost + ADC.Repositories()[this.repository]['adc_path'] + '/rearrangement';
    },

    parse: function(response) {

        if (response && response['Rearrangement']) {

            for (var i = 0; i < response['Rearrangement'].length; ++i)
                response['Rearrangement'][i]['repository'] = this.repository;
            return response['Rearrangement'];
        }

        return;
    },

    // construct basic query limited by repertoires
    baseQuery: function() {
        if (this.repertoires) {
            let rep_ids = [];
            for (let i = 0; i < this.repertoires.length; ++i) {
                let model = this.repertoires.at(i);
                rep_ids.push(model.get('repertoire_id'));
            }

            this.data = { filters: { op: "in", content: { field: "repertoire_id", value: rep_ids }}};

            // by default
            this.data['size'] = 1;
            this.data['facets'] = 'repertoire_id';
        } else {
            // this shouldn't really occur
            console.log('ADCRearrangementCollection without any repertoires!')
            // just in case, a simple query
            this.data = { size: 1 };
        }
    },

    // update the ADC query with filters from the GUI
    addFilters: function(filters, size) {
        if (!filters) return;

        // TODO: this assumes the base query is present

        // extend the base query with AND operator
        let rep_query = this.data['filters'];
        let content = [ rep_query ];

        this.data['filters'] = { op: "and", content: content };
        if (filters['secondary_search']) {
            content.push({op: "contains", content: { field: "junction_aa", value: filters['secondary_search']}});
        }
        for (let i = 0; i < filters['filters'].length; ++i) {
            let entry = filters['filters'][i];
            content.push({op: "=", content: { field: entry['field'], value: entry['value']}});
        }
    },

});

