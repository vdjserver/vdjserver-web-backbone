
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

    // update the ADC query with filters from the GUI
    addFilters: function(filters) {
        if (!filters) return;

        if (filters['secondary_search']) {
            this.data = { filters: { op: "=", content: { field: "tcr.receptor.trb_chain.junction_aa", value: filters['secondary_search'] }}};
        } else this.data = null;
    },

    calcStatistics: function() {
        this.statistics = {};
        this.statistics['num_of_complexes'] = this.length;
        this.statistics['num_of_receptors'] = this.length; // TODO: we need akc_id from API
        this.statistics['num_of_epitopes'] = 0;
        this.statistics['num_of_mhcs'] = 0;
        this.statistics['num_of_chains'] = 0;
        this.statistics['num_of_paired_chains'] = 0;
        this.statistics['num_of_investigations'] = 0;
        this.statistics['num_of_assays'] = 0;
        this.statistics['num_of_participants'] = 0;
        this.statistics['num_of_specimens'] = 0;

        let objs = { chain: {}, receptor: {}, epitope: {}, mhc: {}, investigation: {}, assay: {}, participant: {}, specimen: {} };
        for (let i = 0; i < this.length; ++i) {
            let m = this.at(i);
            let tcr = m.get('tcr');
            let assay = m.get('assay');
            if (tcr['receptor'] != null) {
                let has_tra = false, has_trb = false;
                if (tcr['receptor']['tra_chain']) {
                    has_tra = true;
                    if (! objs['chain'][tcr['receptor']['tra_chain']['akc_id']]) {
                        objs['chain'][tcr['receptor']['tra_chain']['akc_id']] = true;
                        this.statistics['num_of_chains'] += 1;
                    }
                }
                if (tcr['receptor']['trb_chain']) {
                    has_trb = true;
                    if (! objs['chain'][tcr['receptor']['trb_chain']['akc_id']]) {
                        objs['chain'][tcr['receptor']['trb_chain']['akc_id']] = true;
                        this.statistics['num_of_chains'] += 1;
                    }
                }
                if (has_tra && has_trb) {
                    if (! objs['receptor'][tcr['receptor']['akc_id']]) {
                        objs['receptor'][tcr['receptor']['akc_id']] = true;
                        this.statistics['num_of_paired_chains'] += 1;
                    }
                }
            }
            if (tcr['epitope'] != null)
                if (! objs['epitope'][tcr['epitope']['akc_id']]) {
                    objs['epitope'][tcr['epitope']['akc_id']] = true;
                    this.statistics['num_of_epitopes'] += 1;
                }
            if (tcr['mhc'] != null)
                if (! objs['mhc'][tcr['mhc']]) {
                    objs['mhc'][tcr['mhc']] = true;
                    this.statistics['num_of_mhcs'] += 1;
                }
            if (assay != null) {
                if (! objs['assay'][assay['akc_id']]) {
                    objs['assay'][assay['akc_id']] = true;
                    this.statistics['num_of_assays'] += 1;
                }
                if (assay['investigation'] != null)
                    if (! objs['investigation'][assay['investigation']['akc_id']]) {
                        objs['investigation'][assay['investigation']['akc_id']] = true;
                        this.statistics['num_of_investigations'] += 1;
                    }
                if (assay['participant'] != null)
                    if (! objs['participant'][assay['participant']['akc_id']]) {
                        objs['participant'][assay['participant']['akc_id']] = true;
                        this.statistics['num_of_participants'] += 1;
                    }
                if (assay['specimen'] != null)
                    if (! objs['specimen'][assay['specimen']['akc_id']]) {
                        objs['specimen'][assay['specimen']['akc_id']] = true;
                        this.statistics['num_of_specimens'] += 1;
                    }
            }
        }


    },
});

