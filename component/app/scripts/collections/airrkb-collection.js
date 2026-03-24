
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
import { AIRRKB } from 'Scripts/backbone/backbone-airrkb';
import { AKObject } from 'Scripts/models/airrkb-model';

export var AKCollection = AIRRKB.Collection.extend({
    model: AKObject,
    initialize: function(models, parameters) {
        AIRRKB.Collection.prototype.initialize.apply(this, [models, parameters]);
    },
    url: function() {
        return this.apiHost + '/akc/v1/query';
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

        if (filters['secondary_search']) {
            this.data = { filters: { op: "in", content: { field: "tcr.receptor.trb_chain.junction_aa", value: filters['secondary_search'] }}};
        } else this.data = null;
    },

});

