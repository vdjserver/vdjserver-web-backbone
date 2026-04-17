
'use strict';

//
// community-main.js
// Main view for the community data page
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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

import ADCInfo from 'Scripts/models/adc-info';
import { ADCRepertoireCollection, ADCStudyCollection } from 'Scripts/collections/adc-repertoires';

import CommunityListView from 'Scripts/views/community/community-list';
import LoadingView from 'Scripts/views/utilities/loading-adc-view';
import { CommunityChartsInfoViewTable } from 'Scripts/views/community/community-charts-table';

import CytoscapeView from 'Scripts/views/charts/cytoscape-graph';
import MermaidChart from 'Scripts/views/charts/mermaid-chart';
import PieChart from 'Scripts/views/charts/pie';

import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view-large';
import ModalChartView from 'Scripts/views/utilities/modal-chart-view';
//import AddChartView from 'Scripts/views/community/add-chart';

// Community Stats View
import community_stats_template from 'Templates/community/community-stats.html';
var CommunityStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(community_stats_template),

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    templateContext() {
        if (!this.controller) return {};

        var colls = this.controller.getCollections();
        var num_repos = colls['repositoryInfo'].length;
        var num_studies = colls['studyList'].length;
        var num_reps = 0;
        for (var i in colls['repertoireCollection'])
            num_reps += colls['repertoireCollection'][i].length;
        var num_rearrangements = 0;
        for (let i = 0; i < colls['studyList'].length; ++i) {
            var study = colls['studyList'].at(i);
            var repos = study.get('repository');
            for (let j = 0; j < repos.length; ++j) {
                let repo_study = study.get('repos').get(repos[j]);
                let statistics = repo_study.get('statistics');
                if (statistics['num_rearrangements']) num_rearrangements += statistics['num_rearrangements'];
            }
        }
        // this puts in the commas
        num_rearrangements = new Intl.NumberFormat().format(num_rearrangements);


        return {
            num_repos: num_repos,
            num_studies: num_studies,
            num_repertoires: num_reps,
            num_rearrangements: num_rearrangements,
            num_clones: 'XXX',
            num_receptors: 'XXX'
        }
    },

    events: {
    },

    updateStats(studyList) {
    }
});

// Community Buttons View
import button_template from 'Templates/community/community-buttons.html';
var CommunityButtonsView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function (parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    templateContext() {
        if (!this.controller) return {};

        var colls = this.controller.getCollections();
        var current_sort = colls['studyList']['sort_by'];

        return {
            current_sort: current_sort
        }
    },

    events: {
        // sort results list
        'click #community-sort-select': function (e) {
            // check it is a new sort
            var colls = this.controller.getCollections();
            var current_sort = colls['studyList']['sort_by'];
            if (e.target.name != current_sort)
                this.controller.applySort(e.target.name);
        }
    },

});

// Community Charts View
import community_charts_template from 'Templates/community/community-charts.html';
var CommunityChartsView = Marionette.View.extend({
    template: Handlebars.compile(community_charts_template),

    regions: {
        chart1Region: '#chart-1-region',
        chart2Region: '#chart-2-region',
        // chart3Region: '#chart-3-region',
        chartTableRegion: '#chart-table-region'
    },

    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    onAttach() {
        if (this.view) this.view.showChart();
    },

    events: {
        'click .add-chart': 'newChartModal',
        'click #add-chart': 'newChartModal',
        'click .chart-type': 'newChartType',
        'click #create-group': 'newGroup',
        //'click .mainView .node.clickable': 'updateSubChart',
        'click .mainView .node.clickable': 'updateTable',
        'click .subView .node.clickable': 'updateTable',
    },

    updateCharts(studyList) {
        // Build data structure for counts
        if (studyList) var counts = studyList.countByField('subject.sex');

        // Build Mermaid chart
        let chartDefinition;

        if (studyList) {
            var counts = studyList.countByField('subject.sex');
            var series = [{name: "Sex", data:[]}];
            var total = 0;
            for (var i in counts) total += counts[i];
            for (var i in counts) {
                var obj = { name: i, y: 100 * counts[i] / total, count: counts[i], total_count: total };
                series[0]['data'].push(obj);
            }

            var title = 'Subject Sex';
            var subtitle = total + ' subjects among ' + studyList.length + ' studies';
            this.view = new PieChart({series: series, title: title, subtitle: subtitle});
            this.showChildView('chart1Region', this.view);
            this.view.showChart();
        }

        if (this.controller.akResults) {
            var query = this.controller.filterController.secondary_filters.secondary_search;

            this.view = new MermaidChart({
                akResults: this.controller.akResults,
                query: query
            });
            this.showChildView('chart2Region', this.view);
        }

    },

    updateSubChart: function (e) {
        var nonSubChart = ['Receptors', 'Epitopes'];
        var nodeName = e.currentTarget.id.split('-')[1];
        var oldNodeName = '';
        if (this.subView) {
            oldNodeName = this.subView.subChart;
        }
        if (!nonSubChart.includes(nodeName) && oldNodeName !== nodeName) {
            this.subView = new MermaidChart({
                subChart: nodeName
            });
            this.showChildView('chart3Region', this.subView);
        } else if (this.subView) {
            this.subView.destroy(); // or .remove()? oe empty()?
            this.subView = null;
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
                case 'Complexes':
                    headerInfo = { header1: 'TRB Chain', header2: '', header3: 'TRA Chain', header4: '', header5: 'Epitope', header6: 'MHC' };
                    spacingInfo = { class1: 'col-md-4', class2: '', class3: 'col-md-4', class4: '', class5: 'col-md-2', class6: 'col-md-2' }
                    fields = ['trb_chain_display', null, 'tra_chain_display', null, 'epitope_display', 'mhc_display'];
                    bodyInfo = this.controller.akResults;
                    break;
                case 'Receptors':
                    headerInfo = { header1: 'TRB V Call', header2: 'TRB Junction', header3: 'TRB J Call', header4: 'TRA V Call', header5: 'TRA Junction', header6: 'TRA J Call' };
                    fields = ['trb_chain_v_call', 'trb_chain_junction_aa', 'trb_chain_j_call', 'tra_chain_v_call', 'tra_chain_junction_aa', 'tra_chain_j_call'];
                    bodyInfo = colls.receptor;
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
                    headerInfo = { header1: 'Name', header2: 'Age', header3: 'Ethnicity/Race', header4: 'Sex', header5: 'Species', header6: 'Strain' };
                    fields = ['name', 'age', 'race_ethnicity_display', 'sex', 'species', 'strain'];
                    bodyInfo = colls.participant;
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

            this.tableView = new CommunityChartsInfoViewTable({controller: this.controller, collection: bodyInfo, headers: headerInfo, spacing: spacingInfo, tableName: nodeName, fields: fields});
            this.showChildView('chartTableRegion', this.tableView);
        }
    },

    newChartType(e) {
        console.log('selected a chart type');
    },

    newGroup(e) {
        console.log('clicked Create a Group');
    },
});

// Community Pagination View
import community_pagination_template from 'Templates/community/community-pagination.html';
var CommunityPaginationView = Marionette.View.extend({
    template: Handlebars.compile(community_pagination_template),
    
    // good implementation
    // https://stackoverflow.com/questions/34456577/marionette-collection-pagination

    // Trying to access data to produce paging
    initialize(parameters) {
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    templateContext(studyList) {
        if (!this.controller) return {};
    }
});

// the main community data page
import community_template from 'Templates/community/community-main.html';
export default Marionette.View.extend({
    template: Handlebars.compile(community_template),
    tagName: 'div',
    className: 'community-container m-0 p-0',

    // one region for dynamic charts
    // one region for results
    // one region for pagination
    regions: {
        chartsRegion: '#community-charts',
        resultsRegion: '#community-results',
        paginationRegion: '#community-pagination'
    },

    initialize(parameters) {
        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }
    },

    // show a loading view, used while fetching the data
    showLoading(ls, lr, tr, lst) {
        this.showChildView('resultsRegion', new LoadingView({ loaded_repertoires: ls, loaded_repositories: lr, total_repositories: tr, loaded_statistics: lst }));
        $("#community-charts").addClass("no-display");
    },

    showResultsList(studyList) {
        $("#community-charts").removeClass("no-display");

        // What's in the data?
        // console.log("what is here: " + this.controller);
        // console.log("studyList " + JSON.stringify(studyList));

        this.statsView = new CommunityStatisticsView({ collection: studyList, controller: this.controller });
        App.AppController.navController.setStatisticsBar(this.statsView, this.controller, this.controller.showStatistics());
        this.statsView.updateStats(studyList);

        this.buttonsView = new CommunityButtonsView({ controller: this.controller });
        App.AppController.navController.showButtonsBar(this.buttonsView);

        this.chartsView = new CommunityChartsView({ model: this.model, controller: this.controller });
        this.showChildView('chartsRegion', this.chartsView);
        this.chartsView.updateCharts(studyList, null);

        this.resultsView = new CommunityListView({ collection: studyList, controller: this.controller });
        this.showChildView('resultsRegion', this.resultsView);

        this.paginationView = new CommunityPaginationView({ collection: studyList, controller: this.controller });
        this.showChildView('paginationRegion', this.paginationView);
        // this.paginationView.updatePagination(studyList);
    },

    updateCharts(akResults) {
        this.chartsView.updateCharts(null, akResults);
    },

    updateSummary(studyList) {
        // update stats
        this.statsView = new CommunityStatisticsView({ collection: studyList, controller: this.controller });
        App.AppController.navController.setStatisticsBar(this.statsView, this.controller, this.controller.showStatistics());

        // update buttons
        this.buttonsView = new CommunityButtonsView({ controller: this.controller });
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

    newFilterModal(e) {
        console.log('new community filter modal will appear');
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
