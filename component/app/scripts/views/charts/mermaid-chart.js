'use strict';

//
// mermaid-plots.js
// Generic Mermaid Chart
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2026 The University of Texas Southwestern Medical Center
//
// Author: Sam Wollenburg <Samuel.Wollenburg@utsouthwestern.edu>
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
import mermaid from 'mermaid';

export default Marionette.View.extend({
    template: Handlebars.compile('<div class="mermaid mermaid-container" id="mermaid_chart"></div>'),

    initialize: function(parameters) {
        this.chartDefinition = '';

        if (parameters) {
            if (parameters.chartDefinition) this.chartDefinition = parameters.chartDefinition;
            //if (parameters.akResults) this.akResults = parameters.akResults;
            //if (parameters.query) this.query = parameters.query;
            if (parameters.subChart) this.subChart = parameters.subChart;
            if (parameters.statistics) this.statistics = parameters.statistics;
        }

        mermaid.initialize({ 
            startOnLoad: false,
            securityLevel: 'loose'
        });

        if (this.statistics) {
            if (this.statistics.receptor_type == 'alpha-beta')
                this.chartDefinition = this.getAlphaBetaDefinition(this.statistics);
            else if (this.statistics.receptor_type == 'gamma-delta')
                this.chartDefinition = this.getGammaDeltaDefinition(this.statistics);
            else
                this.chartDefinition = this.getIntroChartDefinition(this.statistics);
        }
//         if (this.akResults && this.query) {
//             var stats = this.akResults.statistics;
//             this.chartDefinition = this.getIntroChartDefinition(stats);
//         } else if (!this.akResults && this.query=='All Results') {
//             var stats = this.statistics;
//             this.chartDefinition = this.getIntroChartDefinition(stats);
//         }

        if (this.subChart) {this.updateSubChart();}
    },

    onAttach: function() {
        window.mermaidNodeClick = (nodeId) => {
            /* 
                This function exists so that the mermaid nodes are clickable.
                While the function of the clicks could be handled here, it 
                was decided to maintain the style and put the event in the events area.
            */
        };

        this.showChart();
    },

    showChart: function() {
        const el = this.$('#mermaid_chart')[0];

        // Insert Mermaid text
        el.innerHTML = this.chartDefinition;

        // Render it
        el.removeAttribute('data-processed');
        // mermaid.init(null, el);
        mermaid.init(undefined, el);
    },

    updateSubChart: function() {
        switch (this.subChart) {
            case 'Receptors':
                this.chartDefinition = this.getReceptorsChartDefinition();
                break;
            case 'PairedChains':
                this.chartDefinition = this.getPairedChainsChartDefinition();
                break;
            //case 'Epitopes':
        }
    },

    getIntroChartDefinition: function(stats) {
        return [
            `graph LR`,
            `subgraph results["AIRR Knowledge results"]`,
            //`Query["TRB junction search<br>${this.query}"]`,
            `Receptors["${stats.num_of_receptors} Receptors"]`,
            `end`,
            `Complexes["${stats.num_of_complexes} TCRpMHC Complexes"]`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
            `MHCs["${stats.num_of_mhcs} MHCs"]`,
            // `Studies`,
            // `Participants`,
            // `Species`,
            // `ReceptorDistanceOne`,
            `Assays["${stats.num_of_assays} Assays"]`,
            `Investigations["${stats.num_of_investigations} Investigations"]`,
            `PairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
            `Chains["${stats.num_of_chains} Chains"]`,
            `Participants["${stats.num_of_participants} Participants"]`,
            // `Receptors["${stats.num_of_receptors} Receptors"]`,
            `Specimens["${stats.num_of_specimens} Specimens"]`,

            `Investigations --- Receptors`,
            `Participants --- Receptors`,
            `Assays --- Receptors`,
            `Specimens --- Receptors`,
            //`Complexes --- Query`,
            
            `Receptors --- Complexes`,
            `Complexes --- Epitopes`,
            `Complexes --- MHCs`,
            `Receptors --- PairedChains`,
            `Receptors --- Chains`,
            // `Receptors --- Epitopes`,
            // `Receptors --- MHCs`,
            // `Epitopes --- MHCs`,

            `click Complexes mermaidNodeClick`,
            `click Assays mermaidNodeClick`,
            `click Epitopes mermaidNodeClick`,
            `click Investigations mermaidNodeClick`,
            `click MHCs mermaidNodeClick`,
            `click Participants mermaidNodeClick`,
            `click Receptors mermaidNodeClick`,
            `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getAlphaBetaDefinition: function(stats) {
        let host_species = 'Any Species';
        if (stats['host_species'] == 'NCBITAXON:9606') host_species = 'Human Species';
        if (stats['host_species'] == 'NCBITAXON:10090') host_species = 'Mouse Species';

        return [
            `graph LR`,
            `subgraph results["AIRR Knowledge results"]`,
            //`Query["TRB junction search<br>${this.query}"]`,
            `Receptors["${stats.num_of_receptors} Alpha-Beta Receptors<br>${host_species}"]`,
            `end`,
            `Complexes["${stats.num_of_complexes} TCRpMHC Complexes"]`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
            `MHCs["${stats.num_of_mhcs} MHCs"]`,
            // `Studies`,
            // `Participants`,
            // `Species`,
            // `ReceptorDistanceOne`,
            `Assays["${stats.num_of_assays} Assays"]`,
            `Investigations["${stats.num_of_investigations} Investigations"]`,
            `PairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
            `Chains["${stats.num_of_chains} Chains"]`,
            `Participants["${stats.num_of_participants} Participants"]`,
            // `Receptors["${stats.num_of_receptors} Receptors"]`,
            `Specimens["${stats.num_of_specimens} Specimens"]`,

            `Investigations --- Receptors`,
            `Participants --- Receptors`,
            `Assays --- Receptors`,
            `Specimens --- Receptors`,
            //`Complexes --- Query`,
            
            `Receptors --- Complexes`,
            `Complexes --- Epitopes`,
            `Complexes --- MHCs`,
            `Receptors --- PairedChains`,
            `Receptors --- Chains`,
            // `Receptors --- Epitopes`,
            // `Receptors --- MHCs`,
            // `Epitopes --- MHCs`,

            `click Complexes mermaidNodeClick`,
            `click Assays mermaidNodeClick`,
            `click Epitopes mermaidNodeClick`,
            `click Investigations mermaidNodeClick`,
            `click MHCs mermaidNodeClick`,
            `click Participants mermaidNodeClick`,
            `click Receptors mermaidNodeClick`,
            `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getReceptorsChartDefinition: function() {
        return [
            `graph LR`,
            `Receptors`,
            `BCR`,
            `TCR`,
            `BCRVCall["V Call"]`,
            // `BCRDCall["D-Call]`,
            `BCRJCall["J Call"]`,
            `TCRVCall["V Call"]`,
            // `TCRDCall["D-Call"]`,
            `TCRJCall["J Call"]`,

            `Receptors --- BCR`,
            `Receptors --- TCR`,
            `BCR --- BCRVCall`,
            // `BCR --- BCRDCall`,
            `BCR --- BCRJCall`,
            `TCR --- TCRVCall`,
            // `TCR --- TCRDCall`,
            `TCR --- TCRJCall`,

            `click Receptors mermaidNodeClick "Open More"`,
            `click BCR mermaidNodeClick "Open More"`,
            `click TCR mermaidNodeClick "Open More"`,
            `click BCRVCall mermaidNodeClick "Open More"`,
            // `click BCRDCall mermaidNodeClick "Open More"`,
            `click BCRJCall mermaidNodeClick "Open More"`,
            `click TCRVCall mermaidNodeClick "Open More"`,
            // `click TCRDCall mermaidNodeClick "Open More"`,
            `click TCRJCall mermaidNodeClick "Open More"`,
        ].join('\n');
    },

    getPairedChainsChartDefinition: function() {
        return [
            `graph LR`,
            `Receptors`,
            `BCR`,
            `TCR`,
            `Receptors --- BCR`,
            `Receptors --- TCR`,
            `BCR --- BCRVCall`,
            // `BCR --- BCRDCall`,
            `BCR --- BCRJCall`,
            `TCR --- TCRVCall`,
            // `TCR --- TCRDCall`,
            `TCR --- TCRJCall`,
        ].join('\n');
    },

});
