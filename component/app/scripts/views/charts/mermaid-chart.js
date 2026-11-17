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
    templates: {
        default: Handlebars.compile(
            '<div class="mermaid mermaid-container" id="mermaid_chart"></div>'
        ),
        navbar: Handlebars.compile(
            '<div class="navbar-tool" id="mermaid-chart">'+
            '    <div class="mermaid mermaid-container" id="mermaid_chart"></div>'+
            '</div>'
        ),
    },

    initialize: function(parameters) {
        this.chartDefinition = '';
        this.disabled_node_color = '#C1C1D1';
        this.partial_results_text_color = '#ff0000';

        if (parameters) {
            if (parameters.chartDefinition) this.chartDefinition = parameters.chartDefinition;
            //if (parameters.akResults) this.akResults = parameters.akResults;
            //if (parameters.query) this.query = parameters.query;
            if (parameters.subChart) this.subChart = parameters.subChart;
            if (parameters.statistics) this.statistics = parameters.statistics;
            if (parameters.navbar) this.template = this.templates.navbar;
            else this.template = this.templates.default;
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
            else if (this.statistics.receptor_type == 'heavy-kl')
                this.chartDefinition = this.getHeavyLightDefinition(this.statistics);
            else if (this.statistics.receptor_type == 'heavy-kappa')
                this.chartDefinition = this.getHeavyKappaDefinition(this.statistics);
            else if (this.statistics.receptor_type == 'heavy-lambda')
                this.chartDefinition = this.getHeavyLambdaDefinition(this.statistics);
            else
                this.chartDefinition = this.getIntroChartDefinition(this.statistics);
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
                break;
            //case 'Epitopes':
        }
    },

    //
    getIntroChartDefinition: function(stats) {
        return [
            `graph LR`,
            `classDef disabled fill:`+this.disabled_node_color,
            `subgraph results["AIRR Knowledge"]`,
            `Receptors["${stats.num_of_receptors} All Receptors<br>All Species"]:::disabled`,
            `end`,
            `Complexes["${stats.num_of_complexes} TCRpMHC Complexes"]:::disabled`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]:::disabled`,
            `MHCs["${stats.num_of_mhcs} MHCs"]:::disabled`,
            `Assays["${stats.num_of_assays} Assays"]:::disabled`,
            `Investigations["${stats.num_of_investigations} Investigations"]:::disabled`,
            `PairedChains["${stats.num_of_paired_chains} Paired Chains"]:::disabled`,
            `Chains["${stats.num_of_chains} Chains"]:::disabled`,
            `Participants["${stats.num_of_participants} Participants"]:::disabled`,
            `Specimens["${stats.num_of_specimens} Specimens"]:::disabled`,

            `Investigations --- Receptors`,
            `Participants --- Receptors`,
            `Assays --- Receptors`,
            `Specimens --- Receptors`,
            
            `Receptors --- Complexes`,
            `Complexes --- Epitopes`,
            `Complexes --- MHCs`,
            `Receptors --- PairedChains`,
            `Receptors --- Chains`,

//             `click Complexes mermaidNodeClick`,
//             `click Assays mermaidNodeClick`,
//             `click Epitopes mermaidNodeClick`,
//             `click Investigations mermaidNodeClick`,
//             `click MHCs mermaidNodeClick`,
//             `click Participants mermaidNodeClick`,
//             `click Receptors mermaidNodeClick`,
//             `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getAlphaBetaDefinition: function(stats) {
        let host_species = 'Any Species';
        if (stats['host_species'] == 'NCBITAXON:9606') host_species = 'Human Species';
        if (stats['host_species'] == 'NCBITAXON:10090') host_species = 'Mouse Species';

        let style = '';
        let title = "AIRR Knowledge";
        if (stats['partial']) {
            title = 'AIRR Knowledge PARTIAL Results';
            style = 'style results color:'+this.partial_results_text_color;
        }
        if (stats['partial'] === false) title = "AIRR Knowledge FULL Results"

        return [
            `graph LR`,
            `classDef disabled fill:`+this.disabled_node_color,
            `subgraph results["${title}"]`,
            `ABReceptors["${stats.num_of_receptors} Alpha-Beta Receptors<br>${host_species}"]`,
            `${style}`,
            `end`,

            `ABComplexes["${stats.num_of_complexes} TCRpMHC Complexes"]`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
            `MHCs["${stats.num_of_mhcs} MHCs"]`,
            `Assays["${stats.num_of_assays} Assays"]:::disabled`,
            `Investigations["${stats.num_of_investigations} Investigations"]`,
            `ABPairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
            `Chains["${stats.num_of_chains} Chains"]:::disabled`,
            `AlphaChains["${stats.num_of_alpha_chains} Alpha Chains"]`,
            `BetaChains["${stats.num_of_beta_chains} Beta Chains"]`,
            `Participants["${stats.num_of_participants} Participants"]`,
            `Humans["${stats.num_of_humans} Humans"]`,
            `Mice["${stats.num_of_mice} Mice"]`,
            `Specimens["${stats.num_of_specimens} Specimens"]`,

            `Investigations --- ABReceptors`,
            `Participants --- ABReceptors`,
            `Assays --- ABReceptors`,
            `Specimens --- ABReceptors`,

            `Humans --- Participants`,
            `Mice --- Participants`,
            
            `ABReceptors --- ABComplexes`,
            `ABComplexes --- Epitopes`,
            `ABComplexes --- MHCs`,
            `ABReceptors --- ABPairedChains`,
            `ABReceptors --- Chains`,

            `Chains --- AlphaChains`,
            `Chains --- BetaChains`,

            `click ABReceptors mermaidNodeClick`,
            `click ABPairedChains mermaidNodeClick`,
            `click AlphaChains mermaidNodeClick`,
            `click BetaChains mermaidNodeClick`,
            `click ABComplexes mermaidNodeClick`,
            //`click Assays mermaidNodeClick`,
            `click Epitopes mermaidNodeClick`,
            `click MHCs mermaidNodeClick`,
            `click Investigations mermaidNodeClick`,
            `click Participants mermaidNodeClick`,
            `click Humans mermaidNodeClick`,
            `click Mice mermaidNodeClick`,
            `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getGammaDeltaDefinition: function(stats) {
        let host_species = 'Any Species';
        if (stats['host_species'] == 'NCBITAXON:9606') host_species = 'Human Species';
        if (stats['host_species'] == 'NCBITAXON:10090') host_species = 'Mouse Species';

        let style = '';
        let title = "AIRR Knowledge";
        if (stats['partial']) {
            title = 'AIRR Knowledge PARTIAL Results';
            style = 'style results color:'+this.partial_results_text_color;
        }
        if (stats['partial'] === false) title = "AIRR Knowledge FULL Results"

        return [
            `graph LR`,
            `classDef disabled fill:`+this.disabled_node_color,
            `subgraph results["${title}"]`,
            `GDReceptors["${stats.num_of_receptors} Gamma-Delta Receptors<br>${host_species}"]`,
            `${style}`,
            `end`,

            `GDComplexes["${stats.num_of_complexes} TCRpMHC Complexes"]`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
            `MHCs["${stats.num_of_mhcs} MHCs"]`,
            `Assays["${stats.num_of_assays} Assays"]:::disabled`,
            `Investigations["${stats.num_of_investigations} Investigations"]`,
            `GDPairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
            `Chains["${stats.num_of_chains} Chains"]:::disabled`,
            `GammaChains["${stats.num_of_gamma_chains} Gamma Chains"]`,
            `DeltaChains["${stats.num_of_delta_chains} Delta Chains"]`,
            `Participants["${stats.num_of_participants} Participants"]`,
            `Humans["${stats.num_of_humans} Humans"]`,
            `Mice["${stats.num_of_mice} Mice"]`,
            `Specimens["${stats.num_of_specimens} Specimens"]`,

            `Investigations --- GDReceptors`,
            `Participants --- GDReceptors`,
            `Assays --- GDReceptors`,
            `Specimens --- GDReceptors`,

            `Humans --- Participants`,
            `Mice --- Participants`,
            
            `GDReceptors --- GDComplexes`,
            `GDComplexes --- Epitopes`,
            `GDComplexes --- MHCs`,
            `GDReceptors --- GDPairedChains`,
            `GDReceptors --- Chains`,

            `Chains --- GammaChains`,
            `Chains --- DeltaChains`,

            `click GDReceptors mermaidNodeClick`,
            `click GDPairedChains mermaidNodeClick`,
            `click GammaChains mermaidNodeClick`,
            `click DeltaChains mermaidNodeClick`,
            `click GDComplexes mermaidNodeClick`,
            //`click Assays mermaidNodeClick`,
            `click Epitopes mermaidNodeClick`,
            `click MHCs mermaidNodeClick`,
            `click Investigations mermaidNodeClick`,
            `click Participants mermaidNodeClick`,
            `click Humans mermaidNodeClick`,
            `click Mice mermaidNodeClick`,
            `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getHeavyLightDefinition: function(stats) {
        let host_species = 'Any Species';
        if (stats['host_species'] == 'NCBITAXON:9606') host_species = 'Human Species';
        if (stats['host_species'] == 'NCBITAXON:10090') host_species = 'Mouse Species';

        let style = '';
        let title = "AIRR Knowledge";
        if (stats['partial']) {
            title = 'AIRR Knowledge PARTIAL Results';
            style = 'style results color:'+this.partial_results_text_color;
        }
        if (stats['partial'] === false) title = "AIRR Knowledge FULL Results"

        return [
            `graph LR`,
            `classDef disabled fill:`+this.disabled_node_color,
            `subgraph results["${title}"]`,
            `HKLReceptors["${stats.num_of_receptors} Heavy-Light Receptors<br>${host_species}"]`,
            `${style}`,
            `end`,

            `HKLComplexes["${stats.num_of_complexes} Complexes"]`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
            `Assays["${stats.num_of_assays} Assays"]:::disabled`,
            `Investigations["${stats.num_of_investigations} Investigations"]`,
            `HKLPairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
            `Chains["${stats.num_of_chains} Chains"]:::disabled`,
            `HeavyChains["${stats.num_of_heavy_chains} Heavy Chains"]`,
            `KappaChains["${stats.num_of_kappa_chains} Kappa Chains"]`,
            `LambdaChains["${stats.num_of_lambda_chains} Lambda Chains"]`,
            `Participants["${stats.num_of_participants} Participants"]`,
            `Humans["${stats.num_of_humans} Humans"]`,
            `Mice["${stats.num_of_mice} Mice"]`,
            `Specimens["${stats.num_of_specimens} Specimens"]`,

            `Investigations --- HKLReceptors`,
            `Participants --- HKLReceptors`,
            `Assays --- HKLReceptors`,
            `Specimens --- HKLReceptors`,

            `Humans --- Participants`,
            `Mice --- Participants`,
            
            `HKLReceptors --- HKLComplexes`,
            `HKLComplexes --- Antigens:::disabled`,
            `HKLComplexes --- Epitopes`,
            `HKLReceptors --- HKLPairedChains`,
            `HKLReceptors --- Chains`,

            `Chains --- HeavyChains`,
            `Chains --- KappaChains`,
            `Chains --- LambdaChains`,

            `click HKLReceptors mermaidNodeClick`,
            `click HKLPairedChains mermaidNodeClick`,
            `click HeavyChains mermaidNodeClick`,
            `click KappaChains mermaidNodeClick`,
            `click LambdaChains mermaidNodeClick`,
            `click HKLComplexes mermaidNodeClick`,
            //`click Assays mermaidNodeClick`,
            `click Epitopes mermaidNodeClick`,
            `click MHCs mermaidNodeClick`,
            `click Investigations mermaidNodeClick`,
            `click Participants mermaidNodeClick`,
            `click Humans mermaidNodeClick`,
            `click Mice mermaidNodeClick`,
            `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getHeavyKappaDefinition: function(stats) {
        let host_species = 'Any Species';
        if (stats['host_species'] == 'NCBITAXON:9606') host_species = 'Human Species';
        if (stats['host_species'] == 'NCBITAXON:10090') host_species = 'Mouse Species';

        let style = '';
        let title = "AIRR Knowledge";
        if (stats['partial']) {
            title = 'AIRR Knowledge PARTIAL Results';
            style = 'style results color:'+this.partial_results_text_color;
        }
        if (stats['partial'] === false) title = "AIRR Knowledge FULL Results"

        return [
            `graph LR`,
            `classDef disabled fill:`+this.disabled_node_color,
            `subgraph results["${title}"]`,
            `HKReceptors["${stats.num_of_receptors} Heavy-Kappa Receptors<br>${host_species}"]`,
            `${style}`,
            `end`,

            `HKComplexes["${stats.num_of_complexes} Complexes"]`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
            `Assays["${stats.num_of_assays} Assays"]:::disabled`,
            `Investigations["${stats.num_of_investigations} Investigations"]`,
            `HKPairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
            `Chains["${stats.num_of_chains} Chains"]:::disabled`,
            `HeavyChains["${stats.num_of_heavy_chains} Heavy Chains"]`,
            `KappaChains["${stats.num_of_kappa_chains} Kappa Chains"]`,
            `Participants["${stats.num_of_participants} Participants"]`,
            `Humans["${stats.num_of_humans} Humans"]`,
            `Mice["${stats.num_of_mice} Mice"]`,
            `Specimens["${stats.num_of_specimens} Specimens"]`,

            `Investigations --- HKReceptors`,
            `Participants --- HKReceptors`,
            `Assays --- HKReceptors`,
            `Specimens --- HKReceptors`,

            `Humans --- Participants`,
            `Mice --- Participants`,
            
            `HKReceptors --- HKComplexes`,
            `HKComplexes --- Antigens:::disabled`,
            `HKComplexes --- Epitopes`,
            `HKReceptors --- HKPairedChains`,
            `HKReceptors --- Chains`,

            `Chains --- HeavyChains`,
            `Chains --- KappaChains`,

            `click HKReceptors mermaidNodeClick`,
            `click HKPairedChains mermaidNodeClick`,
            `click HeavyChains mermaidNodeClick`,
            `click KappaChains mermaidNodeClick`,
            `click HKComplexes mermaidNodeClick`,
            //`click Assays mermaidNodeClick`,
            `click Epitopes mermaidNodeClick`,
            `click MHCs mermaidNodeClick`,
            `click Investigations mermaidNodeClick`,
            `click Participants mermaidNodeClick`,
            `click Humans mermaidNodeClick`,
            `click Mice mermaidNodeClick`,
            `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getHeavyLambdaDefinition: function(stats) {
        let host_species = 'Any Species';
        if (stats['host_species'] == 'NCBITAXON:9606') host_species = 'Human Species';
        if (stats['host_species'] == 'NCBITAXON:10090') host_species = 'Mouse Species';

        let style = '';
        let title = "AIRR Knowledge";
        if (stats['partial']) {
            title = 'AIRR Knowledge PARTIAL Results';
            style = 'style results color:'+this.partial_results_text_color;
        }
        if (stats['partial'] === false) title = "AIRR Knowledge FULL Results"

        return [
            `graph LR`,
            `classDef disabled fill:`+this.disabled_node_color,
            `subgraph results["${title}"]`,
            `HLReceptors["${stats.num_of_receptors} Heavy-Lambda Receptors<br>${host_species}"]`,
            `${style}`,
            `end`,

            `HLComplexes["${stats.num_of_complexes} Complexes"]`,
            `Epitopes["${stats.num_of_epitopes} Epitopes"]`,
            `Assays["${stats.num_of_assays} Assays"]:::disabled`,
            `Investigations["${stats.num_of_investigations} Investigations"]`,
            `HLPairedChains["${stats.num_of_paired_chains} Paired Chains"]`,
            `Chains["${stats.num_of_chains} Chains"]:::disabled`,
            `HeavyChains["${stats.num_of_heavy_chains} Heavy Chains"]`,
            `LambdaChains["${stats.num_of_lambda_chains} Lambda Chains"]`,
            `Participants["${stats.num_of_participants} Participants"]`,
            `Humans["${stats.num_of_humans} Humans"]`,
            `Mice["${stats.num_of_mice} Mice"]`,
            `Specimens["${stats.num_of_specimens} Specimens"]`,

            `Investigations --- HLReceptors`,
            `Participants --- HLReceptors`,
            `Assays --- HLReceptors`,
            `Specimens --- HLReceptors`,

            `Humans --- Participants`,
            `Mice --- Participants`,
            
            `HLReceptors --- HLComplexes`,
            `HLComplexes --- Antigens:::disabled`,
            `HLComplexes --- Epitopes`,
            `HLReceptors --- HLPairedChains`,
            `HLReceptors --- Chains`,

            `Chains --- HeavyChains`,
            `Chains --- LambdaChains`,

            `click HLReceptors mermaidNodeClick`,
            `click HLPairedChains mermaidNodeClick`,
            `click HeavyChains mermaidNodeClick`,
            `click LambdaChains mermaidNodeClick`,
            `click HLComplexes mermaidNodeClick`,
            //`click Assays mermaidNodeClick`,
            `click Epitopes mermaidNodeClick`,
            `click MHCs mermaidNodeClick`,
            `click Investigations mermaidNodeClick`,
            `click Participants mermaidNodeClick`,
            `click Humans mermaidNodeClick`,
            `click Mice mermaidNodeClick`,
            `click Specimens mermaidNodeClick`,
        ].join('\n');
    },

    getReceptorsChartDefinition: function() {
        return [
            `graph LR`,
            `classDef disabled fill:`+this.disabled_node_color,
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
            `classDef disabled fill:`+this.disabled_node_color,
            `Receptors:::disabled`,
            `BCR:::disabled`,
            `TCR:::disabled`,
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
