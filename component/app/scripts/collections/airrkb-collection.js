
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

import TrNames from 'Scripts/utilities/germline-labels/germline-labels.js';

export var AKCollection = AIRRKB.Collection.extend({
    model: AKObject,
    initialize: function(models, parameters) {
        AIRRKB.Collection.prototype.initialize.apply(this, [models, parameters]);
        this.uniques = null;
        this.partial = null;
        this.sort_by = null;
        this.comparator = null;
        this.assays = null;
        if(parameters) {
            if(parameters.sort_by){this.sort_by = parameters.sort_by;}
            if(parameters.sort_by){this.comparator = this.collectionSortBy;}
        }
    },
    url: function() {
        return this.apiHost + '/query';
    },

    parse: function(response) {

        if (response && response['Info']) {
            this.partial = response['Info']['partial_results'];
        }

        if (response && response['Assay']) {
            this.assays = new AKCollection(null);
            for (let a in response['Assay']) {
                this.assays.add(response['Assay'][a]);
            }
        }

        if (response && response['TCRpMHC']) {
            return response['TCRpMHC'];
        }

        if (response && response['AntibodyAntigen']) {
            return response['AntibodyAntigen'];
        }

        return;
    },

    // update the ADC query with filters from the GUI
    addFilters: function(filter) {
        if (!filter) return;
        if (!filter['receptor_type']) return;
        //if (!filter['host_species']) return;

        // determine if chain fields are empty, 0 is null, >0 something not null
        const c1Null = (filter['junction1'] !== null) + (filter['v1'] !== null) + (filter['j1'] !== null);
        const c2Null = (filter['junction2'] !== null) + (filter['v2'] !== null) + (filter['j2'] !== null);
        const allNull = c1Null + c2Null;

        this.data = {};
        const clauses = [];
        if (filter['receptor_type'] == 'alpha-beta') {
            this.data = { complex: { receptor_type: filter['receptor_type'] }};
            if (filter['paired_chain_only']) this.data['complex']['paired_chain_only'] = true;
            if (filter['host_species']) clauses.push({ op: "=", content: { field: "complex.species", value: filter['host_species'] }});

            if (filter['junction1']) clauses.push({ op: "=", content: { field: "tra_chain.junction_aa", value: filter['junction1'] }});
            if (filter['v1']) {
                if (filter['v1_optgroup'] == 'Family') {
                    clauses.push({ op: "=", content: { field: "tra_chain.v_subgroup", value: filter['v1'] }});
                } else if (filter['v1_optgroup'] == 'Gene') {
                    clauses.push({ op: "=", content: { field: "tra_chain.v_gene", value: filter['v1'] }});
                } else {
                    // exact search with allele
                    clauses.push({ op: "=", content: { field: "tra_chain.v_call", value: filter['v1'] }});
                }
            }
            if (filter['j1']) {
                if (filter['j1_optgroup'] == 'Family') {
                    clauses.push({ op: "=", content: { field: "tra_chain.j_subgroup", value: filter['j1'] }});
                } else if (filter['j1_optgroup'] == 'Gene') {
                    clauses.push({ op: "=", content: { field: "tra_chain.j_gene", value: filter['j1'] }});
                } else {
                    clauses.push({ op: "=", content: { field: "tra_chain.j_call", value: filter['j1'] }});
                }
            }

            if (filter['junction2']) clauses.push({ op: "=", content: { field: "trb_chain.junction_aa", value: filter['junction2'] }});
            if (filter['v2']) {
                if (filter['v2_optgroup'] == 'Family') {
                    clauses.push({ op: "=", content: { field: "trb_chain.v_subgroup", value: filter['v2'] }});
                } else if (filter['v2_optgroup'] == 'Gene') {
                    clauses.push({ op: "=", content: { field: "trb_chain.v_gene", value: filter['v2'] }});
                } else {
                    // exact search with allele
                    clauses.push({ op: "=", content: { field: "trb_chain.v_call", value: filter['v2'] }});
                }
            }
            if (filter['j2']) {
                if (filter['j2_optgroup'] == 'Family') {
                    clauses.push({ op: "=", content: { field: "trb_chain.j_subgroup", value: filter['j2'] }});
                } else if (filter['j2_optgroup'] == 'Gene') {
                    clauses.push({ op: "=", content: { field: "trb_chain.j_gene", value: filter['j2'] }});
                } else {
                    clauses.push({ op: "=", content: { field: "trb_chain.j_call", value: filter['j2'] }});
                }
            }


//             if (c1Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.species", value: filter['host_species'] }});
//             if (filter['junction1']) clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.junction_aa", value: filter['junction1'] }});
//             if (filter['v1']) {
//                 let sep = '-';
//                 if (filter['v1_optgroup'] == 'Family') {
//                     // prefix search on family, determine right separator
//                     // if family is same as gene then no dash
//                     if (TrNames[filter['host_species']]['TRA']['V']['gene'].includes(filter['v1'])) sep = '*';
//                     // some have slash (/)
//                     const firstMatch = TrNames[filter['host_species']]['TRA']['V']['gene'].find(item => item.startsWith(filter['v1'] + '/'));
//                     if (firstMatch) sep = '/';
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.tra_chain.v_call", value: filter['v1'] + sep }});
//                 } else if (filter['v1_optgroup'] == 'Gene') {
//                     // prefix search on gene
//                     sep = '*';
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.tra_chain.v_call", value: filter['v1'] + sep }});
//                 } else {
//                     // exact search with allele
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.v_call", value: filter['v1'] }});
//                 }
//             }
//             if (filter['j1']) {
//                 if (filter['j1_optgroup'] == 'Family') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.tra_chain.j_call", value: filter['j1'] + '*' }});
//                 } else if (filter['j1_optgroup'] == 'Gene') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.tra_chain.j_call", value: filter['j1'] + '*' }});
//                 } else {
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.tra_chain.j_call", value: filter['j1'] }});
//                 }
//             }
// 
//             if (c2Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.species", value: filter['host_species'] }});
//             if (filter['junction2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.junction_aa", value: filter['junction2'] }});
//             if (filter['v2']) {
//                 let sep = '-';
//                 if (filter['v2_optgroup'] == 'Family') {
//                     // prefix search on family, determine right separator
//                     // if family is same as gene then no dash
//                     if (TrNames[filter['host_species']]['TRB']['V']['gene'].includes(filter['v2'])) sep = '*';
//                     // some have slash (/)
//                     const firstMatch = TrNames[filter['host_species']]['TRB']['V']['gene'].find(item => item.startsWith(filter['v2'] + '/'));
//                     if (firstMatch) sep = '/';
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trb_chain.v_call", value: filter['v2'] + sep }});
//                 } else if (filter['v2_optgroup'] == 'Gene') {
//                     // prefix search on gene
//                     sep = '*';
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trb_chain.v_call", value: filter['v2'] + sep }});
//                 } else {
//                     // exact search with allele
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.v_call", value: filter['v2'] }});
//                 }
//             }
//             if (filter['j2']) {
//                 if (filter['j2_optgroup'] == 'Family') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trb_chain.j_call", value: filter['j2'] + '*' }});
//                 } else if (filter['j2_optgroup'] == 'Gene') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trb_chain.j_call", value: filter['j2'] + '*' }});
//                 } else {
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.trb_chain.j_call", value: filter['j2'] }});
//                 }
//             }
// 
//             if (filter['paired_chain_only']) {
//                 clauses.push({ op: "=", content: { field: "tcr.receptor.ab_paired", value: true }});
//             } else {
//                 if (!allNull && filter['host_species']) {
//                     clauses.push({ op: "=", content: { field: "assay.participant.species.term_id", value: filter['host_species'] }});
//                     clauses.push({ op: "or", content: [ { op: "not", content: { field: "tcr.receptor.tra_chain" }}, { op: "not", content: { field: "tcr.receptor.trb_chain" }}] });
//                 }
//             }

        } else if (filter['receptor_type'] == 'gamma-delta') {
            this.data = { complex: { receptor_type: filter['receptor_type'] }};
            if (filter['paired_chain_only']) this.data['complex']['paired_chain_only'] = true;
            if (filter['host_species']) clauses.push({ op: "=", content: { field: "complex.species", value: filter['host_species'] }});

//             if (c1Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.species", value: filter['host_species'] }});
//             if (filter['junction1']) clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.junction_aa", value: filter['junction1'] }});
//             if (filter['v1']) {
//                 if (filter['v1_optgroup'] == 'Family') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trg_chain.v_call", value: filter['v1'] + '*' }});
//                 } else if (filter['v1_optgroup'] == 'Gene') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trg_chain.v_call", value: filter['v1'] + '*' }});
//                 } else {
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.v_call", value: filter['v1'] }});
//                 }
//             }
//             if (filter['j1']) {
//                 if (filter['j1_optgroup'] == 'Family') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trg_chain.j_call", value: filter['j1'] + '*' }});
//                 } else if (filter['j1_optgroup'] == 'Gene') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trg_chain.j_call", value: filter['j1'] + '*' }});
//                 } else {
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.trg_chain.j_call", value: filter['j1'] }});
//                 }
//             }
// 
//             if (c2Null && filter['host_species']) clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.species", value: filter['host_species'] }});
//             if (filter['junction2']) clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.junction_aa", value: filter['junction2'] }});
//             if (filter['v2']) {
//                 if (filter['v2_optgroup'] == 'Family') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trd_chain.v_call", value: filter['v2'] + '*' }});
//                 } else if (filter['v2_optgroup'] == 'Gene') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trd_chain.v_call", value: filter['v2'] + '*' }});
//                 } else {
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.v_call", value: filter['v2'] }});
//                 }
//             }
//             if (filter['j2']) {
//                 if (filter['j2_optgroup'] == 'Family') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trd_chain.j_call", value: filter['j2'] + '*' }});
//                 } else if (filter['j2_optgroup'] == 'Gene') {
//                     clauses.push({ op: "prefix", content: { field: "tcr.receptor.trd_chain.j_call", value: filter['j2'] + '*' }});
//                 } else {
//                     clauses.push({ op: "=", content: { field: "tcr.receptor.trd_chain.j_call", value: filter['j2'] }});
//                 }
//             }
// 
//             if (!allNull && filter['host_species']) {
//                 clauses.push({ op: "=", content: { field: "assay.participant.species.term_id", value: filter['host_species'] }});
//                 clauses.push({ op: "or", content: [ { op: "not", content: { field: "tcr.receptor.trg_chain" }}, { op: "not", content: { field: "tcr.receptor.trd_chain" }}] });
//             }

        } else if (filter['receptor_type'] == 'heavy-kl') {
            this.data = { complex: { receptor_type: 'heavy-light' }};
            if (filter['paired_chain_only']) this.data['complex']['paired_chain_only'] = true;
            if (filter['host_species']) clauses.push({ op: "=", content: { field: "complex.species", value: filter['host_species'] }});

        } else if (filter['receptor_type'] == 'heavy-kappa') {
            this.data = { complex: { receptor_type: 'heavy-light' }};
            clauses.push({ op: "not", content: { field: "complex.igk_chain" }});
            if (filter['paired_chain_only']) this.data['complex']['paired_chain_only'] = true;
            if (filter['host_species']) clauses.push({ op: "=", content: { field: "complex.species", value: filter['host_species'] }});

        } else if (filter['receptor_type'] == 'heavy-lambda') {
            this.data = { complex: { receptor_type: 'heavy-light' }};
            clauses.push({ op: "not", content: { field: "complex.igl_chain" }});
            if (filter['paired_chain_only']) this.data['complex']['paired_chain_only'] = true;
            if (filter['host_species']) clauses.push({ op: "=", content: { field: "complex.species", value: filter['host_species'] }});

        } else return;

        if (clauses.length == 0)
            this.data['complex']['filters'] = null;
        else if (clauses.length == 1)
            this.data['complex']['filters'] = clauses[0];
        else {
            this.data['complex']['filters'] = { op: "and", content: clauses };
        }
    },

    initialStatistics: function() {
        // TODO: get this from /statistics endpoint of AK-API
        //var statistics = { };

        var statistics = {
            'receptor_type': 'any',
            'host_species': 'any',
            'num_of_complexes': '996,962,417',
            'num_of_receptors': '996,964,075',
            'num_of_epitopes': '13,744',
            'num_of_mhcs': '198',
            'num_of_chains': '1,061,579,105',
            'num_of_alpha_chains': '163,651,086',
            'num_of_beta_chains': '897,928,019',
            'num_of_paired_chains': '306,681',
            'num_of_investigations': '3,337',
            'num_of_assays': '17,972',
            'num_of_participants': '27,573',
            'num_of_humans': '17,297',
            'num_of_mice': '1,422',
            'num_of_specimens': '17,743',
        };

//         statistics['alpha-beta'] = {};
//         statistics['gamma-delta'] = {};
//         statistics['heavy-light'] = {};
// 
//         // alpha beta
//         statistics['alpha-beta']['NCBITAXON:9606'] = {
//             'receptor_type': 'alpha-beta',
//             'host_species': 'NCBITAXON:9606',
//             'num_of_complexes': 0,
//             'num_of_receptors': '994,613,423',
//             'num_of_epitopes': 0,
//             'num_of_mhcs': 0,
//             'num_of_chains': '1,061,579,105',
//             'num_of_alpha_chains': '163,651,086',
//             'num_of_beta_chains': '897,928,019',
//             'num_of_paired_chains': '306,681',
//             'num_of_investigations': 0,
//             'num_of_assays': 0,
//             'num_of_participants': '17,297',
//             'num_of_humans': '17,297',
//             'num_of_mice': 0,
//             'num_of_specimens': 0,
//         };
// 
//         statistics['alpha-beta']['NCBITAXON:10090'] = {
//             'receptor_type': 'alpha-beta',
//             'host_species': 'NCBITAXON:10090',
//             'num_of_complexes': 0,
//             'num_of_receptors': '1,687,636',
//             'num_of_epitopes': 0,
//             'num_of_mhcs': 0,
//             'num_of_chains': '1,691,193',
//             'num_of_alpha_chains': '1,678,188',
//             'num_of_beta_chains': '12,405',
//             'num_of_paired_chains': '3,037',
//             'num_of_investigations': 0,
//             'num_of_assays': 0,
//             'num_of_participants': '1,422',
//             'num_of_humans': 0,
//             'num_of_mice': '1,422',
//             'num_of_specimens': 0,
//         };
// 
//         statistics['alpha-beta']['any'] = {
//             'receptor_type': 'alpha-beta',
//             'host_species': 'any',
//             'num_of_complexes': 0,
//             'num_of_receptors': '996,302,189',
//             'num_of_epitopes': 0,
//             'num_of_mhcs': 0,
//             'num_of_chains': '1,063,271,298',
//             'num_of_alpha_chains': '165,329,883',
//             'num_of_beta_chains': '897,941,415',
//             'num_of_paired_chains': '310,184',
//             'num_of_investigations': 0,
//             'num_of_assays': 0,
//             'num_of_participants': '27,573',
//             'num_of_humans': '17,297',
//             'num_of_mice': '1,422',
//             'num_of_specimens': 0,
//         };
// 
//         // gamma delta
//         statistics['gamma-delta']['NCBITAXON:9606'] = {
//             'receptor_type': 'gamma-delta',
//             'host_species': 'NCBITAXON:9606',
//             'num_of_complexes': 0,
//             'num_of_receptors': 0,
//             'num_of_epitopes': 0,
//             'num_of_mhcs': 0,
//             'num_of_chains': '652,663',
//             'num_of_gamma_chains': '8,568',
//             'num_of_delta_chains': '644,095',
//             'num_of_paired_chains': '30',
//             'num_of_investigations': 0,
//             'num_of_assays': 0,
//             'num_of_participants': 0,
//             'num_of_specimens': 0,
//         };
// 
//         statistics['gamma-delta']['NCBITAXON:10090'] = {
//             'receptor_type': 'gamma-delta',
//             'host_species': 'NCBITAXON:10090',
//             'num_of_complexes': 0,
//             'num_of_receptors': 0,
//             'num_of_epitopes': 0,
//             'num_of_mhcs': 0,
//             'num_of_chains': '10,042',
//             'num_of_gamma_chains': '145',
//             'num_of_delta_chains': '9,897',
//             'num_of_paired_chains': 0,
//             'num_of_investigations': 0,
//             'num_of_assays': 0,
//             'num_of_participants': 0,
//             'num_of_specimens': 0,
//         };
// 
//         statistics['gamma-delta']['any'] = {
//             'receptor_type': 'gamma-delta',
//             'host_species': 'any',
//             'num_of_complexes': 0,
//             'num_of_receptors': 0,
//             'num_of_epitopes': 0,
//             'num_of_mhcs': 0,
//             'num_of_chains': '662,705',
//             'num_of_gamma_chains': '8,713',
//             'num_of_delta_chains': '653,992',
//             'num_of_paired_chains': '30',
//             'num_of_investigations': 0,
//             'num_of_assays': 0,
//             'num_of_participants': 0,
//             'num_of_specimens': 0,
//         };

        // heavy light

        return statistics;
    },

    calcStatistics: function(filter) {
        let colls = this.getUniqueCollections();
        if(EnvironmentConfig.debug.airrkb) console.log(colls);

        this.statistics = {};
        this.statistics['partial'] = this.partial;
        this.statistics['receptor_type'] = filter['receptor_type'];
        this.statistics['host_species'] = filter['host_species'];
        if (! this.statistics['host_species']) this.statistics['host_species'] = 'any';
        this.statistics['num_of_complexes'] = this.length;
        this.statistics['num_of_receptors'] = colls['receptor'].length;
        this.statistics['num_of_epitopes'] = colls['epitope'].length;
        this.statistics['num_of_mhcs'] = 0;
        this.statistics['num_of_chains'] = colls['chain'].length;
        if (filter['receptor_type'] == 'alpha-beta') {
            this.statistics['num_of_alpha_chains'] = colls['alpha_chain'].length;
            this.statistics['num_of_beta_chains'] = colls['beta_chain'].length;
        } else if (filter['receptor_type'] == 'gamma-delta') {
            this.statistics['num_of_gamma_chains'] = colls['gamma_chain'].length;
            this.statistics['num_of_delta_chains'] = colls['delta_chain'].length;
        } else if (filter['receptor_type'] == 'heavy-kl') {
            this.statistics['num_of_heavy_chains'] = colls['heavy_chain'].length;
            this.statistics['num_of_kappa_chains'] = colls['kappa_chain'].length;
            this.statistics['num_of_lambda_chains'] = colls['lambda_chain'].length;
        } else if (filter['receptor_type'] == 'heavy-kappa') {
            this.statistics['num_of_heavy_chains'] = colls['heavy_chain'].length;
            this.statistics['num_of_kappa_chains'] = colls['kappa_chain'].length;
        } else if (filter['receptor_type'] == 'heavy-lambda') {
            this.statistics['num_of_heavy_chains'] = colls['heavy_chain'].length;
            this.statistics['num_of_lambda_chains'] = colls['lambda_chain'].length;
        }
        this.statistics['num_of_paired_chains'] = colls['paired_chain'].length;
        this.statistics['num_of_investigations'] = colls['investigation'].length;
        this.statistics['num_of_assays'] = colls['assay'].length;
        this.statistics['num_of_participants'] = colls['participant'].length;
        this.statistics['num_of_humans'] = colls['human'].length;
        this.statistics['num_of_mice'] = colls['mouse'].length;
        this.statistics['num_of_specimens'] = colls['specimen'].length;

    },

    getUniqueCollections: function() {
        if (this.uniques) return this.uniques;

        var timeOpts = {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' };
        // UNSORTED COLLECTIONS
        // --------------------
        // chain : not displayable
        // heavy_chain : no data
        // kappa_chain : no data
        // lambda_chain : no data
        // mhc : no data
        // assay : not displayable
        this.uniques = { chain: new AKCollection(), paired_chain: new AKCollection(undefined, {sort_by:'bubble_up'}), receptor: new AKCollection(undefined, {sort_by:'bubble_up'}),
            alpha_chain: new AKCollection(undefined, {sort_by:'bubble_up'}), beta_chain: new AKCollection(undefined, {sort_by:'bubble_up'}),
            gamma_chain: new AKCollection(undefined, {sort_by:'bubble_up'}), delta_chain: new AKCollection(undefined, {sort_by:'bubble_up'}),
            heavy_chain: new AKCollection(), kappa_chain: new AKCollection(), lambda_chain: new AKCollection(),
            epitope: new AKCollection(undefined, {sort_by:'bubble_up'}), mhc: new AKCollection(),
            investigation: new AKCollection(undefined, {sort_by:'alphanum_bubble_up'}), assay: new AKCollection(),
            participant: new AKCollection(undefined, {sort_by:'alphanum_bubble_up'}), human: new AKCollection(undefined,{sort_by:'alphanum_bubble_up'}), mouse: new AKCollection(undefined, {sort_by:'alphanum_bubble_up'}),
            specimen: new AKCollection(undefined, {sort_by:'alphanum_bubble_up'}) };

        // we flatten some nesting to support simple tables
        // and generate display text for some fields
        for (let i = 0; i < this.length; ++i) {
            let m = this.at(i);

            let tra_chain = m.get('tra_chain');
            if (tra_chain) {
                m.set('tra_chain_display', tra_chain['v_call']
                    + ' | ' + tra_chain['j_call']
                    + ' | ' + tra_chain['junction_aa'])
                m.set('tra_chain_junction_aa', tra_chain['junction_aa']);
                m.set('tra_chain_v_call', tra_chain['v_call']);
                m.set('tra_chain_j_call', tra_chain['j_call']);
                this.uniques['chain'].add(tra_chain);
                this.uniques['alpha_chain'].add(tra_chain);
            }

            let trb_chain = m.get('trb_chain');
            if (trb_chain) {
                m.set('trb_chain_display', trb_chain['v_call']
                    + ' | ' + trb_chain['j_call']
                    + ' | ' + trb_chain['junction_aa'])
                m.set('trb_chain_junction_aa', trb_chain['junction_aa']);
                m.set('trb_chain_v_call', trb_chain['v_call']);
                m.set('trb_chain_j_call', trb_chain['j_call']);
                this.uniques['chain'].add(trb_chain);
                this.uniques['beta_chain'].add(trb_chain);
            }

            let trg_chain = m.get('trg_chain');
            if (trg_chain) {
                m.set('trg_chain_display', trg_chain['v_call']
                    + ' | ' + trg_chain['j_call']
                    + ' | ' + trg_chain['junction_aa'])
                m.set('trg_chain_junction_aa', trg_chain['junction_aa']);
                m.set('trg_chain_v_call', trg_chain['v_call']);
                m.set('trg_chain_j_call', trg_chain['j_call']);
                this.uniques['chain'].add(trg_chain);
                this.uniques['gamma_chain'].add(trg_chain);
            }

            let trd_chain = m.get('trd_chain');
            if (trd_chain) {
                m.set('trd_chain_display', trd_chain['v_call']
                    + ' | ' + trd_chain['j_call']
                    + ' | ' + trd_chain['junction_aa'])
                m.set('trd_chain_junction_aa', trd_chain['junction_aa']);
                m.set('trd_chain_v_call', trd_chain['v_call']);
                m.set('trd_chain_j_call', trd_chain['j_call']);
                this.uniques['chain'].add(trd_chain);
                this.uniques['delta_chain'].add(trd_chain);
            }

            let igh_chain = m.get('igh_chain');
            if (igh_chain) {
                m.set('igh_chain_display', igh_chain['v_call']
                    + ' | ' + igh_chain['j_call']
                    + ' | ' + igh_chain['junction_aa'])
                m.set('igh_chain_junction_aa', igh_chain['junction_aa']);
                m.set('igh_chain_v_call', igh_chain['v_call']);
                m.set('igh_chain_j_call', igh_chain['j_call']);
                this.uniques['chain'].add(igh_chain);
                this.uniques['heavy_chain'].add(igh_chain);
            }

            let igk_chain = m.get('igk_chain');
            if (igk_chain) {
                m.set('igk_chain_display', igk_chain['v_call']
                    + ' | ' + igk_chain['j_call']
                    + ' | ' + igk_chain['junction_aa'])
                m.set('igk_chain_junction_aa', igk_chain['junction_aa']);
                m.set('igk_chain_v_call', igk_chain['v_call']);
                m.set('igk_chain_j_call', igk_chain['j_call']);
                this.uniques['chain'].add(igk_chain);
                this.uniques['kappa_chain'].add(igk_chain);
            }

            let igl_chain = m.get('igl_chain');
            if (igl_chain) {
                m.set('igl_chain_display', igl_chain['v_call']
                    + ' | ' + igl_chain['j_call']
                    + ' | ' + igl_chain['junction_aa'])
                m.set('igl_chain_junction_aa', igl_chain['junction_aa']);
                m.set('igl_chain_v_call', igl_chain['v_call']);
                m.set('igl_chain_j_call', igl_chain['j_call']);
                this.uniques['chain'].add(igl_chain);
                this.uniques['lambda_chain'].add(igl_chain);
            }

            this.uniques['receptor'].add(m);
            if (m.get('paired_chain')) this.uniques['paired_chain'].add(m);

            let epitope = m.get('epitope');
            if (epitope != null) {
                this.uniques['epitope'].add(epitope);
                m.set('epitope_display', epitope['sequence_aa']);
            }
            let mhc = m.get('mhc')
            if (mhc != null) {
                this.uniques['mhc'].add(mhc);
                m.set('mhc_display', mhc);
            }
        }

        if (this.assays) {
            this.uniques['assay'] = this.assays;
            for (let i = 0; i < this.assays.length; ++i) {
                let assay = this.assays.at(i);

                let investigation = assay.get('investigation');
                if (investigation) {
                    let lastUpdate = '';
                    if (investigation.update_date) lastUpdate = new Date(investigation.update_date).toLocaleString(undefined, timeOpts) + ' UTC';
                    else if (investigation.release_date) lastUpdate = new Date(investigation.release_date).toLocaleString(undefined, timeOpts) + ' UTC';
                    investigation['last_update_display'] = lastUpdate;
                    this.uniques['investigation'].add(investigation);
                }

                let participant = assay.get('participant');
                if (participant) {
                    let ethnicityRace = '';
                    if (participant.ethnicity) ethnicityRace += participant.ethnicity;
                    ethnicityRace += '/';
                    if (participant.race) ethnicityRace += participant.race;
                    participant['race_ethnicity_display'] = ethnicityRace;
                    this.uniques['participant'].add(participant);
                    if (participant['species']) {
                        if (participant['species']['term_id'] == 'NCBITAXON:9606')
                            this.uniques['human'].add(participant);
                        if (participant['species']['term_id'] == 'NCBITAXON:10090')
                            this.uniques['mouse'].add(participant);
                    }
                }

                let specimen = assay.get('specimen');
                if (specimen) {
                    this.uniques['specimen'].add(specimen);
                }
            }
        }
        return this.uniques;
    },

    collectionSortBy(modela, modelb) {
        var sub_a, sub_b;
        switch (this.sort_by) {
            case 'alphanum_bubble_up': {
                sub_a = 0, sub_b = 0;

                // investigation, participant, human, mouse, specimen
                if (modela.get('name')) sub_a += 1;
                if (modela.get('last_update_display')) sub_a += 1;
                if (modela.get('investigation_type')) sub_a += 1;
                if (modela.get('archival_id')) sub_a += 1;
                if (modela.get('age')) sub_a += 1;
                if (modela.get('sex')) sub_a += 1;
                if (modela.get('species')) sub_a += 1;
                if (modela.get('race')) sub_a += 1;
                if (modela.get('ethnicity')) sub_a += 1;
                if (modela.get('strain')) sub_a += 1;
                if (modela.get('tissue')) sub_a += 1;
                if (modela.get('life_event')) sub_a += 1;
                if (modela.get('description')) sub_a += 1;
                
                if (modelb.get('name')) sub_b += 1;
                if (modelb.get('last_update_display')) sub_b += 1;
                if (modelb.get('investigation_type')) sub_b += 1;
                if (modelb.get('archival_id')) sub_b += 1;
                if (modelb.get('age')) sub_b += 1;
                if (modelb.get('sex')) sub_b += 1;
                if (modelb.get('species')) sub_b += 1;
                if (modelb.get('race')) sub_b += 1;
                if (modelb.get('ethnicity')) sub_b += 1;
                if (modelb.get('strain')) sub_b += 1;
                if (modelb.get('tissue')) sub_b += 1;
                if (modelb.get('life_event')) sub_b += 1;
                if (modelb.get('description')) sub_b += 1;

                if (sub_a > sub_b) 
                    return -1;
                else if (sub_a < sub_b) 
                    return 1;
                else {
                    sub_a = modela.get('name');
                    sub_b = modelb.get('name');
                    if (sub_a > sub_b) return 1;
                    if (sub_a < sub_b) return -1;
                    return 0;
                }
            }
            case 'beta_v_gene': {
                sub_a = modela.get('trb_chain_junction_aa');
                sub_b = modelb.get('trb_chain_junction_aa');
                if (sub_a > sub_b) return 1;
                if (sub_a < sub_b) return -1;
                return 0;
            }
            case 'bubble_up': {
                sub_a = 0, sub_b = 0;

                // receptor, paired chain, chains
                if ((modela.get('tra_chain_v_call')) || (modela.get('trg_chain_v_call'))) sub_a += 1;
                if ((modela.get('tra_chain_j_call')) || (modela.get('trg_chain_j_call'))) sub_a += 1;
                if ((modela.get('tra_chain_junction_aa')) || (modela.get('trg_chain_junction_aa'))) sub_a += 1;
                if ((modela.get('trb_chain_v_call')) || (modela.get('trd_chain_v_call'))) sub_a += 1;
                if ((modela.get('trb_chain_j_call')) || (modela.get('trd_chain_j_call'))) sub_a += 1;
                if ((modela.get('trb_chain_junction_aa')) || (modela.get('trd_chain_junction_aa'))) sub_a += 1;
                
                if ((modelb.get('tra_chain_v_call')) || (modelb.get('trg_chain_v_call'))) sub_b += 1;
                if ((modelb.get('tra_chain_j_call')) || (modelb.get('trg_chain_j_call'))) sub_b += 1;
                if ((modelb.get('tra_chain_junction_aa')) || (modelb.get('trg_chain_junction_aa'))) sub_b += 1;
                if ((modelb.get('trb_chain_v_call')) || (modelb.get('trd_chain_v_call'))) sub_b += 1;
                if ((modelb.get('trb_chain_j_call')) || (modelb.get('trd_chain_j_call'))) sub_b += 1;
                if ((modelb.get('trb_chain_junction_aa')) || (modelb.get('trd_chain_junction_aa'))) sub_b += 1;
                
                // epitope
                if (modela.get('sequence_aa')) sub_a += 1;
                if (modela.get('source_organism')) sub_a += 1;
                if (modela.get('source_protein')) sub_a += 1;
                
                if (modelb.get('sequence_aa')) sub_b += 1;
                if (modelb.get('source_organism')) sub_b += 1;
                if (modelb.get('source_protein')) sub_b += 1;

                // for this.akResults complexes
                if (modela.get('tcr')) {
                    if (modela.get('tcr').epitope) sub_a += 3;
                    if (modela.get('tcr').mhc) sub_a += 3;
                    if (modela.get('tcr').receptor) {
                        if (modela.get('tcr').receptor.tra_chain) {
                            if (modela.get('tcr').receptor.tra_chain.v_call) sub_a += 1;
                            if (modela.get('tcr').receptor.tra_chain.j_call) sub_a += 1;
                            if (modela.get('tcr').receptor.tra_chain.junction_aa) sub_a += 1;
                        } else if (modela.get('tcr').receptor.trg_chain) {
                            if ((modela.get('tcr').receptor.trg_chain.v_call)) sub_a += 1;
                            if ((modela.get('tcr').receptor.trg_chain.j_call)) sub_a += 1;
                            if ((modela.get('tcr').receptor.trg_chain.junction_aa)) sub_a += 1;
                        }
                        if (modela.get('tcr').receptor.trb_chain){
                            if (modela.get('tcr').receptor.trb_chain.v_call) sub_a += 1;
                            if (modela.get('tcr').receptor.trb_chain.j_call) sub_a += 1;
                            if (modela.get('tcr').receptor.trb_chain.junction_aa) sub_a += 1;
                        } else if (modela.get('tcr').receptor.trd_chain) {
                            if (modela.get('tcr').receptor.trd_chain.v_call) sub_a += 1;
                            if (modela.get('tcr').receptor.trd_chain.j_call) sub_a += 1;
                            if (modela.get('tcr').receptor.trd_chain.junction_aa) sub_a += 1;
                        } 
                        
                    }
                }
                if (modelb.get('tcr')) {
                    if (modelb.get('tcr').epitope) sub_b += 3;
                    if (modelb.get('tcr').mhc) sub_b += 3;
                    if (modelb.get('tcr').receptor) {
                        if (modelb.get('tcr').receptor.tra_chain) {
                            if (modelb.get('tcr').receptor.tra_chain.v_call) sub_b += 1;
                            if (modelb.get('tcr').receptor.tra_chain.j_call) sub_b += 1;
                            if (modelb.get('tcr').receptor.tra_chain.junction_aa) sub_b += 1;
                        } else if (modelb.get('tcr').receptor.trg_chain) {
                            if ((modelb.get('tcr').receptor.trg_chain.v_call)) sub_b += 1;
                            if ((modelb.get('tcr').receptor.trg_chain.j_call)) sub_b += 1;
                            if ((modelb.get('tcr').receptor.trg_chain.junction_aa)) sub_b += 1;
                        }
                        if (modelb.get('tcr').receptor.trb_chain){
                            if (modelb.get('tcr').receptor.trb_chain.v_call) sub_b += 1;
                            if (modelb.get('tcr').receptor.trb_chain.j_call) sub_b += 1;
                            if (modelb.get('tcr').receptor.trb_chain.junction_aa) sub_b += 1;
                        } else if (modelb.get('tcr').receptor.trd_chain) {
                            if (modelb.get('tcr').receptor.trd_chain.v_call) sub_b += 1;
                            if (modelb.get('tcr').receptor.trd_chain.j_call) sub_b += 1;
                            if (modelb.get('tcr').receptor.trd_chain.junction_aa) sub_b += 1;
                        } 
                        
                    }
                }
                
                if (sub_a > sub_b) 
                    return -1;
                if (sub_a < sub_b) 
                    return 1;
                return 0;
            }
            case "download_bubble_up": {
                sub_a = 0, sub_b = 0;
                
                // all field paths listed in output tsv for download
                const fieldPaths = [
                    'tra_chain_species','tra_chain_complete_vdj','tra_chain_sequence','tra_chain_sequence_aa','tra_chain_locus','tra_chain_v_call','tra_chain_d_call','tra_chain_j_call','tra_chain_c_call','tra_chain_junction_aa','tra_chain_akc_id',
                    'trb_chain_species','trb_chain_complete_vdj','trb_chain_sequence','trb_chain_sequence_aa','trb_chain_locus','trb_chain_v_call','trb_chain_d_call','trb_chain_j_call','trb_chain_c_call','trb_chain_junction_aa','trb_chain_akc_id',
                    'trg_chain_species','trg_chain_complete_vdj','trg_chain_sequence','trg_chain_sequence_aa','trg_chain_locus','trg_chain_v_call','trg_chain_d_call','trg_chain_j_call','trg_chain_c_call','trg_chain_junction_aa','trg_chain_akc_id',
                    'trd_chain_species','trd_chain_complete_vdj','trd_chain_sequence','trd_chain_sequence_aa','trd_chain_locus','trd_chain_v_call','trd_chain_d_call','trd_chain_j_call','trd_chain_c_call','trd_chain_junction_aa','trd_chain_akc_id',
                    'epitope_sequence_aa','epitope_source_protein','epitope_source_organism','epitope_akc_id'
                ];

                fieldPaths.forEach(field => {
                    if (modela.get(field)) sub_a += 1;
                    if (modelb.get(field)) sub_b += 1;
                });

                if (sub_a > sub_b) 
                    return -1;
                if (sub_a < sub_b) 
                    return 1;
                return 0;
            }
            default: {
                return 0;
            }
        }
        
    },
    
    downloadQueryToFile: function() {

        var jqxhr = $.ajax({
            contentType: 'application/json',
            processData: false,
            type: 'POST',
            url: this.apiHost + '/akc/v1/query/download',
            data: JSON.stringify(this.data)
        })
        
        return jqxhr;
    }

});

