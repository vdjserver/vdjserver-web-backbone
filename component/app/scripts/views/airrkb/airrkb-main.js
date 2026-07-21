
'use strict';

//
// airrkb-main.js
// Main view for the airrkb data page
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2026 The University of Texas Southwestern Medical Center
//
// Author: Sam Wollenburg <samuel.wolleburg@utsouthwestern.edu>
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
import Backbone from 'backbone';

import LoadingView from 'Scripts/views/utilities/loading-view';
import { AirrkbChartsInfoViewTable } from 'Scripts/views/airrkb/airrkb-charts-table';

// import CytoscapeGraph from 'Scripts/views/charts/cytoscape-graph';
import MermaidChart from 'Scripts/views/charts/mermaid-chart';
import PieChart from 'Scripts/views/charts/pie';

import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view-large';
import ModalChartView from 'Scripts/views/utilities/modal-chart-view';

import AKC_image from 'Images/AKC_prime.png';
import AKC_logo from 'Images/AKC_logo_color_2.png';
import IEDB_logo from 'Images/IEDB-logo-full.png';
import OGRDB_logo from 'Images/OGRDB-logo.png';
import VDJbase_logo from 'Images/VDJbase-logo-full.png';
import IRAD_logo from 'Images/irad-logo.png';

// airrkb Buttons View
import button_template from 'Templates/airrkb/airrkb-buttons.html';
var AirrkbButtonsView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function (parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    templateContext() {
        // if (!this.controller) return {};

        // var colls = this.controller.getCollections();
        // var current_sort = colls['studyList']['sort_by'];

        // return {
        //     current_sort: current_sort
        // }

    },

    events: {
        // sort results list
        'click #airrkb-sort-select': function (e) {
            // check it is a new sort
            var colls = this.controller.getCollections();
            var current_sort = colls['studyList']['sort_by'];
            if (e.target.name != current_sort)
                this.controller.applySort(e.target.name);
        },

        // when user needs example
        'click #filter-query-apply-airrkb-example': function() {
            var examples = EnvironmentConfig.airrkb.examples;
            var randIdx = Math.floor(Math.random() * examples.length);

            App.router.navigate('/airrkb', {trigger: false});
            this.controller.filterController.applyFilter(examples[randIdx].filters, examples[randIdx].secondary_filters);
            this.controller.filterController.showFilter();
        },

        'click #airrkb-download': function(e) {
            const fileContent = JSON.stringify(this.controller.akResults, null, 2);
            const mimeType = "text/plain";
            const blob = new Blob([fileContent], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            
            const anchor = document.createElement("a");
            anchor.href = blobUrl;
            anchor.download = "my-results-file.json";
            document.body.appendChild(anchor);
            anchor.click();
            
            // Cleanup
            document.body.removeChild(anchor);
            URL.revokeObjectURL(blobUrl);
        },

    },

});

var ErrorView = Marionette.View.extend({
    template: Handlebars.compile('<div class="text-center"><h4><i class="fas fa-exclamation-circle"></i> Server returned an ERROR!</h4></div><br>'
        + '<div class="text-center"><h4>Please try again or send us Feedback.</h4></div>')
});

// airrkb Charts View
import airrkb_charts_template from 'Templates/airrkb/airrkb-charts.html';
var AirrkbChartsView = Marionette.View.extend({
    template: Handlebars.compile(airrkb_charts_template),

    regions: {
        chartRegion: '#chart-region',
        chartTableRegion: '#chart-table-region'
    },

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }

        this.buttonsView = new AirrkbButtonsView({ controller: this.controller });
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

//     onAttach() {
//         if (this.view) this.view.showChart();
//     },

    events: {
        'click .mainView .node.clickable': 'updateTable',
    },

    updateCharts(statistics) {
        // Build Mermaid chart
        if (statistics) {
            // clear old mermaid chart and associated table view
            if (this.mermaidChartView) { this.mermaidChartView.destroy(); this.mermaidChartView = null; }
            if (this.tableView) { this.tableView.destroy(); this.tableView = null; }

            this.mermaidChartView = new MermaidChart({
                statistics: statistics
            });

            this.showChildView('chartRegion', this.mermaidChartView);

            if (statistics.partial === false) {
                $('#airrkb-download').attr('disabled', false);
            }
        }
    },

    updateTable: function (e) {
        var nodeName = e.currentTarget.id.split('-')[1];
        var oldTableName = '';
        if (this.tableView) {
            oldTableName = this.tableView.tableName;
        }
        if (oldTableName === nodeName) {
            this.tableView.destroy(); // or .remove()? oe empty()?
            this.tableView = null;
        } else {
            var colls = this.controller.akResults.getUniqueCollections();
            var headerInfo = { header1: '', header2: '', header3: '', header4: '', header5: '', header6: '' };
            var spacingInfo = { class1: 'col-md-2', class2: 'col-md-2', class3: 'col-md-2', class4: 'col-md-2', class5: 'col-md-2', class6: 'col-md-2' }
            var bodyInfo = new Backbone.Collection();
            var fields = [];

            switch(nodeName) {
                case 'ABComplexes':
                    headerInfo = { header1: 'TRB Chain', header2: '', header3: 'TRA Chain', header4: '', header5: 'Epitope', header6: 'MHC' };
                    spacingInfo = { class1: 'col-md-4', class2: '', class3: 'col-md-4', class4: '', class5: 'col-md-2', class6: 'col-md-2' }
                    fields = ['trb_chain_display', null, 'tra_chain_display', null, 'epitope_display', 'mhc_display'];
                    bodyInfo = this.controller.akResults;
                    break;
                case 'ABReceptors':
                    headerInfo = { header1: 'TRB V Call', header2: 'TRB Junction', header3: 'TRB J Call', header4: 'TRA V Call', header5: 'TRA Junction', header6: 'TRA J Call' };
                    fields = ['trb_chain_v_call', 'trb_chain_junction_aa', 'trb_chain_j_call', 'tra_chain_v_call', 'tra_chain_junction_aa', 'tra_chain_j_call'];
                    bodyInfo = colls.receptor;
                    break;
                case 'ABPairedChains':
                    headerInfo = { header1: 'TRB V Call', header2: 'TRB Junction', header3: 'TRB J Call', header4: 'TRA V Call', header5: 'TRA Junction', header6: 'TRA J Call' };
                    fields = ['trb_chain_v_call', 'trb_chain_junction_aa', 'trb_chain_j_call', 'tra_chain_v_call', 'tra_chain_junction_aa', 'tra_chain_j_call'];
                    bodyInfo = colls.paired_chain;
                    break;
                case 'AlphaChains':
                    headerInfo = { header1: 'TRA V Call', header2: 'TRA Junction', header3: 'TRA J Call', header4: '', header5: '', header6: '' };
                    fields = ['tra_chain_v_call', 'tra_chain_junction_aa', 'tra_chain_j_call', null, null, null];
                    bodyInfo = colls.alpha_chain;
                    break;
                case 'BetaChains':
                    headerInfo = { header1: 'TRB V Call', header2: 'TRB Junction', header3: 'TRB J Call', header4: '', header5: '', header6: '' };
                    fields = ['trb_chain_v_call', 'trb_chain_junction_aa', 'trb_chain_j_call', null, null, null];
                    bodyInfo = colls.beta_chain;
                    break;
                case 'GDComplexes':
                    headerInfo = { header1: 'TRG Chain', header2: '', header3: 'TRD Chain', header4: '', header5: 'Epitope', header6: 'MHC' };
                    spacingInfo = { class1: 'col-md-4', class2: '', class3: 'col-md-4', class4: '', class5: 'col-md-2', class6: 'col-md-2' }
                    fields = ['trg_chain_display', null, 'trd_chain_display', null, 'epitope_display', 'mhc_display'];
                    bodyInfo = this.controller.akResults;
                    break;
                case 'GDReceptors':
                    headerInfo = { header1: 'TRG V Call', header2: 'TRG Junction', header3: 'TRG J Call', header4: 'TRD V Call', header5: 'TRD Junction', header6: 'TRD J Call' };
                    fields = ['trg_chain_v_call', 'trg_chain_junction_aa', 'trg_chain_j_call', 'trd_chain_v_call', 'trd_chain_junction_aa', 'trd_chain_j_call'];
                    bodyInfo = colls.receptor;
                    break;
                case 'GDPairedChains':
                    headerInfo = { header1: 'TRG V Call', header2: 'TRG Junction', header3: 'TRG J Call', header4: 'TRD V Call', header5: 'TRD Junction', header6: 'TRD J Call' };
                    fields = ['trg_chain_v_call', 'trg_chain_junction_aa', 'trg_chain_j_call', 'trd_chain_v_call', 'trd_chain_junction_aa', 'trd_chain_j_call'];
                    bodyInfo = colls.paired_chain;
                    break;
                case 'GammaChains':
                    headerInfo = { header1: 'TRG V Call', header2: 'TRG Junction', header3: 'TRG J Call', header4: '', header5: '', header6: '' };
                    fields = ['trg_chain_v_call', 'trg_chain_junction_aa', 'trg_chain_j_call', null, null, null];
                    bodyInfo = colls.gamma_chain;
                    break;
                case 'DeltaChains':
                    headerInfo = { header1: 'TRD V Call', header2: 'TRD Junction', header3: 'TRD J Call', header4: '', header5: '', header6: '' };
                    fields = ['trd_chain_v_call', 'trd_chain_junction_aa', 'trd_chain_j_call', null, null, null];
                    bodyInfo = colls.delta_chain;
                    break;
                case 'Epitopes':
                    headerInfo = { header1: 'Sequence AA', header2: 'Source Organism', header3: 'Source Protein', header4: '', header5: '', header6: '' };
                    fields = ['sequence_aa', 'source_organism', 'source_protein', null, null, null];
                    bodyInfo = colls.epitope;
                    break;
                case 'Investigations':
                    headerInfo = { header1: 'Study Name', header2: '', header3: '', header4: 'Investigation Type', header5: 'Archival ID', header6: 'Last Updated' };
                    spacingInfo = { class1: 'col-md-6', class2: '', class3: '', class4: 'col-md-2', class5: 'col-md-2', class6: 'col-md-2' }
                    fields = ['name', null, null, 'investigation_type', 'archival_id', 'last_update_display'];
                    bodyInfo = colls.investigation;
                    break;
                case 'Participants':
                    headerInfo = { header1: 'Participant ID', header2: 'Age', header3: 'Sex', header4: 'Species', header5: '', header6: '' };
                    fields = ['name', 'age', 'sex', 'species', null, null];
                    bodyInfo = colls.participant;
                    break;
                case 'Humans':
                    headerInfo = { header1: 'Participant ID', header2: 'Age', header3: 'Sex', header4: 'Race', header5: 'Ethnicity', header6: '' };
                    fields = ['name', 'age', 'sex', 'race', 'ethnicity', null, null];
                    bodyInfo = colls.human;
                    break;
                case 'Mice':
                    headerInfo = { header1: 'Participant ID', header2: 'Age', header3: 'Sex', header4: 'Strain', header5: '', header6: '' };
                    fields = ['name', 'age', 'sex', 'strain', null, null];
                    bodyInfo = colls.mouse;
                    break;
                case 'Specimens':
                    headerInfo = { header1: 'Name', header2: 'Tissue', header3: 'Life Event', header4: 'Description', header5: '', header6: '' };
                    spacingInfo = { class1: 'col-md-2', class2: 'col-md-2', class3: 'col-md-4', class4: 'cold-md-4', class5: '', class6: '' }
                    fields = ['name', 'tissue', 'life_event', 'description', null, null];
                    bodyInfo = colls.specimen;
                    break;
                case 'Assays':
                    headerInfo = { header1: 'Assay', header2: 'Type', header3: 'Description', header4: '', header5: '', header6: '' };
                    spacingInfo = { class1: 'col-md-2', class2: 'col-md-2', class3: 'col-md-8', class4: '', class5: '', class6: '' }
                    fields = ['assay_type', 'type', 'description', null, null, null];
                    bodyInfo = colls.assay;
                    break;
            }

            this.tableView = new AirrkbChartsInfoViewTable({controller: this.controller, collection: bodyInfo, headers: headerInfo, spacing: spacingInfo, tableName: nodeName, fields: fields});
            this.showChildView('chartTableRegion', this.tableView);
            var headerElement = document.getElementById('airrkb-charts-table-header');
            if (headerElement) {
                headerElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
            }
        }
    },
});

// the main airrkb data page
import airrkb_template from 'Templates/airrkb/airrkb-main.html';
export default Marionette.View.extend({
    template: Handlebars.compile(airrkb_template),
    tagName: 'div',
    className: 'airrkb-container m-0 p-0',

    // one region for dynamic charts
    // one region for results
    // one region for pagination
    regions: {
        chartsRegion: '#airrkb-charts',
        resultsRegion: '#airrkb-results',
        paginationRegion: '#airrkb-pagination'
    },

    initialize(parameters) {
        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.chartsView = null;
        this.getRegion('chartsRegion').empty();
        this.showChildView('chartsRegion', new LoadingView({ }));
    },

    showError() {
        this.chartsView = null;
        this.getRegion('chartsRegion').empty();
        this.showChildView('chartsRegion', new ErrorView({ }));
    },

    showChart(statistics) {
        this.chartsView = new AirrkbChartsView({ model: this.model, controller: this.controller });
        this.showChildView('chartsRegion', this.chartsView);
        this.chartsView.updateCharts(statistics);
    },

    updateCharts(statistics) {
        this.chartsView.updateCharts(statistics);
    },

    newFilterModal(e) {
        console.log('new airrkb filter modal will appear');
        var message = new MessageModel({
            'header': 'Custom Filter',
            'body': '<p>Please select from the options below to set a custom filter.</p>',
            'confirmText': 'Create Filter',
            'cancelText': 'Cancel'
        });

        var view = new ModalView({ model: message });
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');

        console.log(message);
    },
});
