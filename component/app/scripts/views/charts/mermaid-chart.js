'use strict';

//
// mermaid-plots.js
// Generic Mermaid Chart
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
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
// import mermaid from 'mermaid/dist/mermaid.min.js';

export default Marionette.View.extend({
    template: Handlebars.compile('<div class="mermaid" id="mermaid_chart"></div>'),

    initialize: function(parameters) {
        this.chartDefinition = '';

        if (parameters) {
            if (parameters.chartDefinition) this.chartDefinition = parameters.chartDefinition;
            if (parameters.akResults) this.akResults = parameters.akResults;
            if (parameters.query) this.query = parameters.query;
            if (parameters.subChart) this.subChart = parameters.subChart;
        }

        mermaid.initialize({ 
            startOnLoad: false,
            securityLevel: 'loose'
        });

        if (this.akResults && this.query) {
            var stats = this.akResults.statistics;
            this.chartDefinition = [
                `graph LR`,
                `Query[${this.query}]`,
                // `Studies`,
                // `Participants`,
                // `Species`,
                // `ReceptorDistanceOne`,
                `Assays["${stats.num_of_assays} Assays"]`,
                `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
                `Investigations["${stats.num_of_investigations} Investigations"]`,
                `MHCs["${stats.num_of_mhcs} MHCs"]`,
                `PairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
                `Participants["${stats.num_of_participants} Participants"]`,
                `Receptors["${stats.num_of_receptors} Receptors"]`,
                `Specimens["${stats.num_of_specimens} Specimens"]`,

                `Investigations --- Query`,
                `Participants --- Query`,
                `Assays --- Query`,
                `Specimens --- Query`,
                `Query --- Receptors`,
                `Query --- PairedChains`,
                `Query --- Epitopes`,
                `Query --- MHCs`,

                `click Query mermaidNodeClick "Open More"`,
                `click Assays mermaidNodeClick "Open More"`,
                `click Epitopes mermaidNodeClick "Open More"`,
                `click Investigations mermaidNodeClick "Open More"`,
                `click MHCs mermaidNodeClick "Open More"`,
                `click PairedChains mermaidNodeClick "Open More"`,
                `click Participants mermaidNodeClick "Open More"`,
                `click Receptors mermaidNodeClick "Open More"`,
                `click Specimens mermaidNodeClick "Open More"`,
            ].join('\n');
        }

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
        }
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
