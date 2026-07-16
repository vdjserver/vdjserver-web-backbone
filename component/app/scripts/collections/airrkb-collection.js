
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
        this.partial = false;
    },
    url: function() {
        return this.apiHost + '/akc/v1/query';
    },

    parse: function(response) {

        if (response && response['Info']) {
            this.partial = response['Info']['partial'];
        }

        if (response && response['TCRpMHC']) {
            return response['TCRpMHC'];
        }

        return;
    },

    // update the ADC query with filters from the GUI
    addFilters: function(filter) {
        if (!filter) return;
        if (!filter['receptor_type']) return;

        // determine if chain fields are empty
        const c1Null = (filter['junction1'] !== null) + (filter['v1'] !== null) + (filter['j1'] !== null);
        const c2Null = (filter['junction2'] !== null) + (filter['v2'] !== null) + (filter['j2'] !== null);

        const clauses = [];
        if (filter['receptor_type'] == 'alpha-beta') {
            if (c1Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.species", value: filter['host_species'] }})
            if (filter['junction1']) clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.junction_aa", value: filter['junction1'] }})
            if (filter['v1']) clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.v_call", value: filter['v1'] }})
            if (filter['j1']) clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.j_call", value: filter['j1'] }})

            if (c2Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.species", value: filter['host_species'] }})
            if (filter['junction2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.junction_aa", value: filter['junction2'] }})
            if (filter['v2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.v_call", value: filter['v2'] }})
            if (filter['j2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.j_call", value: filter['j2'] }})

        } else if (filter['receptor_type'] == 'gamma-delta') {
            if (c1Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.species", value: filter['host_species'] }})
            if (filter['junction1']) clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.junction_aa", value: filter['junction1'] }})
            if (filter['v1']) clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.v_call", value: filter['v1'] }})
            if (filter['j1']) clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.j_call", value: filter['j1'] }})

            if (c2Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.species", value: filter['host_species'] }})
            if (filter['junction2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.junction_aa", value: filter['junction2'] }})
            if (filter['v2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.v_call", value: filter['v2'] }})
            if (filter['j2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.j_call", value: filter['j2'] }})

        } else return;

        if (clauses.length == 0)
            this.data = null;
        else if (clauses.length == 1)
            this.data = { filters: clauses[0] };
        else {
            this.data = { filters: { op: "and", content: clauses }};
        }
    },

    initialStatistics: function() {
        // TODO: get this from /statistics endpoint of AK-API
        var statistics = { };

        statistics['alpha-beta'] = {};
        statistics['gamma-delta'] = {};
        statistics['heavy-light'] = {};

        // alpha beta
        statistics['alpha-beta']['NCBITAXON:9606'] = {
            'receptor_type': 'alpha-beta',
            'host_species': 'NCBITAXON:9606',
            'num_of_complexes': 0,
            'num_of_receptors': '994,613,423',
            'num_of_epitopes': 0,
            'num_of_mhcs': 0,
            'num_of_chains': '1,061,579,105',
            'num_of_alpha_chains': '163,651,086',
            'num_of_beta_chains': '897,928,019',
            'num_of_paired_chains': '306,681',
            'num_of_investigations': 0,
            'num_of_assays': 0,
            'num_of_participants': 0,
            'num_of_specimens': 0,
        };

        statistics['alpha-beta']['NCBITAXON:10090'] = {
            'receptor_type': 'alpha-beta',
            'host_species': 'NCBITAXON:10090',
            'num_of_complexes': 0,
            'num_of_receptors': '1,687,636',
            'num_of_epitopes': 0,
            'num_of_mhcs': 0,
            'num_of_chains': '1,691,193',
            'num_of_alpha_chains': '1,678,188',
            'num_of_beta_chains': '12,405',
            'num_of_paired_chains': '3,037',
            'num_of_investigations': 0,
            'num_of_assays': 0,
            'num_of_participants': 0,
            'num_of_specimens': 0,
        };

        statistics['alpha-beta']['any'] = {
            'receptor_type': 'alpha-beta',
            'host_species': 'any',
            'num_of_complexes': 0,
            'num_of_receptors': '996,302,189',
            'num_of_epitopes': 0,
            'num_of_mhcs': 0,
            'num_of_chains': '1,063,271,298',
            'num_of_alpha_chains': '165,329,883',
            'num_of_beta_chains': '897,941,415',
            'num_of_paired_chains': '310,184',
            'num_of_investigations': 0,
            'num_of_assays': 0,
            'num_of_participants': 0,
            'num_of_specimens': 0,
        };

        // gamma delta
        statistics['gamma-delta']['NCBITAXON:9606'] = {
            'receptor_type': 'gamma-delta',
            'host_species': 'NCBITAXON:9606',
            'num_of_complexes': 0,
            'num_of_receptors': 0,
            'num_of_epitopes': 0,
            'num_of_mhcs': 0,
            'num_of_chains': '652,663',
            'num_of_gamma_chains': '8,568',
            'num_of_delta_chains': '644,095',
            'num_of_paired_chains': '30',
            'num_of_investigations': 0,
            'num_of_assays': 0,
            'num_of_participants': 0,
            'num_of_specimens': 0,
        };

        statistics['gamma-delta']['NCBITAXON:10090'] = {
            'receptor_type': 'gamma-delta',
            'host_species': 'NCBITAXON:10090',
            'num_of_complexes': 0,
            'num_of_receptors': 0,
            'num_of_epitopes': 0,
            'num_of_mhcs': 0,
            'num_of_chains': '10,042',
            'num_of_gamma_chains': '145',
            'num_of_delta_chains': '9,897',
            'num_of_paired_chains': 0,
            'num_of_investigations': 0,
            'num_of_assays': 0,
            'num_of_participants': 0,
            'num_of_specimens': 0,
        };

        statistics['gamma-delta']['any'] = {
            'receptor_type': 'gamma-delta',
            'host_species': 'any',
            'num_of_complexes': 0,
            'num_of_receptors': 0,
            'num_of_epitopes': 0,
            'num_of_mhcs': 0,
            'num_of_chains': '662,705',
            'num_of_gamma_chains': '8,713',
            'num_of_delta_chains': '653,992',
            'num_of_paired_chains': '30',
            'num_of_investigations': 0,
            'num_of_assays': 0,
            'num_of_participants': 0,
            'num_of_specimens': 0,
        };

        // heavy light

        return statistics;
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

