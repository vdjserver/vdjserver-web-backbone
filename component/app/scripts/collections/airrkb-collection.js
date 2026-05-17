
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
        this.uniques = null;
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
        let colls = this.getUniqueCollections();
        console.log(colls);

        this.statistics = {};
        this.statistics['num_of_complexes'] = this.length;
        this.statistics['num_of_receptors'] = colls['receptor'].length; // TODO: we need akc_id from API
        this.statistics['num_of_epitopes'] = colls['epitope'].length;
        this.statistics['num_of_mhcs'] = 0;
        this.statistics['num_of_chains'] = colls['chain'].length;
        this.statistics['num_of_paired_chains'] = 0;
        this.statistics['num_of_investigations'] = colls['investigation'].length;
        this.statistics['num_of_assays'] = colls['assay'].length;
        this.statistics['num_of_participants'] = colls['participant'].length;
        this.statistics['num_of_specimens'] = colls['specimen'].length;

    },

    getUniqueCollections: function() {
        if (this.uniques) return this.uniques;

        var timeOpts = {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' };
        this.uniques = { chain: new AKCollection(), receptor: new AKCollection(),
            epitope: new AKCollection(), mhc: new AKCollection(),
            investigation: new AKCollection(), assay: new AKCollection(),
            participant: new AKCollection(), specimen: new AKCollection() };

        // we flatten some nesting to support simple tables
        // and generate display text for some fields
        for (let i = 0; i < this.length; ++i) {
            let m = this.at(i);
            let tcr = m.get('tcr');
            let assay = m.get('assay');
            if (tcr['receptor'] != null) {
                let has_tra = false, has_trb = false;
                if (tcr['receptor']['tra_chain']) {
                    has_tra = true;
                    tcr['receptor']['tra_chain_display'] = tcr['receptor']['tra_chain']['v_call']
                        + ' | ' + tcr['receptor']['tra_chain']['j_call']
                        + ' | ' + tcr['receptor']['tra_chain']['junction_aa']
                    tcr['receptor']['tra_chain_junction_aa'] = tcr['receptor']['tra_chain']['junction_aa'];
                    tcr['receptor']['tra_chain_v_call'] = tcr['receptor']['tra_chain']['v_call'];
                    tcr['receptor']['tra_chain_j_call'] = tcr['receptor']['tra_chain']['j_call'];
                    m.set('tra_chain_display', tcr['receptor']['tra_chain_display']);
                    this.uniques['chain'].add(tcr['receptor']['tra_chain']);
                }
                if (tcr['receptor']['trb_chain']) {
                    has_trb = true;
                    tcr['receptor']['trb_chain_display'] = tcr['receptor']['trb_chain']['v_call']
                        + ' | ' + tcr['receptor']['trb_chain']['j_call']
                        + ' | ' + tcr['receptor']['trb_chain']['junction_aa']
                    tcr['receptor']['trb_chain_junction_aa'] = tcr['receptor']['trb_chain']['junction_aa'];
                    tcr['receptor']['trb_chain_v_call'] = tcr['receptor']['trb_chain']['v_call'];
                    tcr['receptor']['trb_chain_j_call'] = tcr['receptor']['trb_chain']['j_call'];
                    m.set('trb_chain_display', tcr['receptor']['trb_chain_display']);
                    this.uniques['chain'].add(tcr['receptor']['trb_chain']);
                }
                this.uniques['receptor'].add(tcr['receptor']);
            }
            if (tcr['epitope'] != null) {
                this.uniques['epitope'].add(tcr['epitope']);
                m.set('epitope_display', tcr['epitope']['sequence_aa']);
            }
            if (tcr['mhc'] != null) {
                this.uniques['mhc'].add(tcr['mhc']);
                m.set('mhc_display', tcr['mhc']);
            }
            if (assay != null) {
                this.uniques['assay'].add(assay);
                if (assay['investigation'] != null) {
                    let lastUpdate = '';
                    if (assay.investigation.update_date) lastUpdate = new Date(assay.investigation.update_date).toLocaleString(undefined, timeOpts) + ' UTC';
                    else if (assay.investigation.release_date) lastUpdate = new Date(assay.investigation.release_date).toLocaleString(undefined, timeOpts) + ' UTC';
                    assay['investigation']['last_update_display'] = lastUpdate;
                    this.uniques['investigation'].add(assay['investigation']);
                }

                if (assay['participant'] != null) {
                    let ethnicityRace = '';
                    if (assay.participant.ethnicity) ethnicityRace += assay.participant.ethnicity;
                    ethnicityRace += '/';
                    if (assay.participant.race) ethnicityRace += assay.participant.race;
                    assay['participant']['race_ethnicity_display'] = ethnicityRace;
                    this.uniques['participant'].add(assay['participant']);
                }

                if (assay['specimen'] != null) {
                    this.uniques['specimen'].add(assay['specimen']);
                }
            }
        }
        
        return this.uniques;
    },
});

