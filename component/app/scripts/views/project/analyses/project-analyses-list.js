//
// project-analyses-list.js
// List of analyses for projects
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
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

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import 'bootstrap-select';

import { VDJPipeParameters } from 'Scripts/models/agave-job';
import {PrestoParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-presto.js'
import {VDJPipeParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-vdjpipe.js'
import {IgBlastParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-igblast.js'
import {RepCalcParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-repcalc.js'
import {StatisticsParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-statistics.js'
import {CellrangerParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-cellranger.js'
import {TCRMatchParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-tcrmatch.js'
import {TRUST4ParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-trust4.js'
import {CompAIRRParameterView} from 'Scripts/views/project/analyses/tools/project-analyses-compairr.js'

// analysis summary view
import summary_template from 'Templates/project/analyses/project-analyses-summary.html';
var AnalysisSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

    },

    templateContext() {
        return {
            // age_display: this.model.getAgeDisplay(),
            // species_display: this.model.getSpeciesDisplay(),
        }
    },

});

// analysis detail/edit view
import detail_template from 'Templates/project/analyses/project-analyses-detail.html';
import { findLastIndex } from 'underscore';
var AnalysisDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),
    analysisDetailView: this,

    regions: {
        parameterRegion: '#project-analysis-parameter'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // this.showParameterVDJPipe = true;
    },

    templateContext() {
        console.log('pal templateContext this.model:', this.model);
        console.log(this.controller);
        
        var colls = this.controller.getCollections();
        var value = this.model.get('value');

        var workflow_mode = value['workflow_mode']; // 'IG' '10X' or 'comparative'

        // create displayName for repertoires
        var rep_list = [];
        colls.repertoireList.models.forEach(repertoire => {
            // Define the display name
            var displayName = "";
            var rep_value = repertoire.get('value');
            
            // Add repertoire name
            var repertoireName = rep_value['repertoire_name'];
            if(repertoireName) {displayName += "Repertoire: " + repertoireName + ",";}
            
            // Add subject name
            var subjectName = rep_value['subject_id'];
            if(subjectName) {
                if(displayName) {displayName += " ";}
                displayName += "Subject: " + subjectName + ",";
            }
            
            // Add sample names
            var sampleNames = [];
            repertoire.sample.models.forEach(sample => {
                sampleNames.push(sample.get('value')['sample_id']);
            })
            if(sampleNames) {
                if(displayName) {displayName += " ";}
                displayName += "Sample";
                if(sampleNames.length > 1) {displayName += "s";}
                displayName += ":";
                sampleNames.forEach(sampleName => {
                    displayName += " " + sampleName + ",";
                });
            }
            
            // Remove dangling ","
            if(displayName) {displayName = displayName.slice(0,-1);}
            
            var selected = false;
            for (let i in value['repertoires'])
                if (value['repertoires'][i]['repertoire_id'] == repertoire.get('uuid'))
                    selected = true;
                
            rep_list.push({ uuid:repertoire.get('uuid'), displayName:displayName, selected:selected });
        });
        
        // create displayName for repertoire groups
        var group_list = [];        
        colls.groupList.models.forEach(group => {
            // Define the display name
            var displayName = "";
            var group_value = group.get('value')
                
            // Add group name
            var groupName = group_value['repertoire_group_name'];
            if(groupName) {displayName += "Group: " + groupName;} // should always be truthy

            // Add number of repertoires
            var numReps = group_value['length'];
            if(numReps) { // should always be truthy
                if(displayName) {displayName += " ";} // should always be truthy
                displayName += "("+numReps+" repertoires)";
            }

            var selected = false;
            for (let i in value['repertoires'])
                if (value['repertoires'][i]['repertoire_id'] == group.get('uuid'))
                    selected = true;

            group_list.push({ uuid:group.get('uuid'), displayName:displayName, selected:selected });
        });

        return {
            showPrestoDiv: workflow_mode === "TCR-Presto Workflow" || workflow_mode === "Presto Single-Tool",
            showVDJPipeDiv: workflow_mode === "TCR-VDJPipe Workflow" || workflow_mode === "VDJPipe Single-Tool",
            showCellrangerDiv: workflow_mode === "10X Workflow" || workflow_mode === "Cellranger Single-Tool",
            showIgBlastDiv: workflow_mode.split("-")[0] === "TCR" || workflow_mode.split(' ')[0] === "IgBlast",
            showTRUST4Div: workflow_mode === "TRUST4 Single-Tool",
            showRepCalcDiv: workflow_mode.split("-")[0] === "TCR" || workflow_mode === "IgBlast Workflow" || workflow_mode === "10X Workflow" || workflow_mode === "RepCalc Single-Tool",
            showStatisticsDiv: workflow_mode === "Statistics Single-Tool",
            showTCRMatchDiv: workflow_mode === "TCRMatch Single-Tool",
            showCompAIRRDiv: workflow_mode === "CompAIRR Single-Tool",
            showStartArrowDiv: workflow_mode.split("-")[0] === "TCR",
            showMidArrowDiv: workflow_mode === "10X Workflow",
            showEndArrowDiv: workflow_mode.split("-")[0] === "TCR" || workflow_mode === "IgBlast Workflow",
            showPipeline: workflow_mode != "Comparative Workflow",
            workflow_mode: workflow_mode,
            view_mode: this.model.view_mode,
            rep_list: rep_list,
            group_list: group_list, 
            is_complete: true
        }
    },

    onAttach() {
        // setup popovers and tooltips
        $('[datatoggle="popover"]').popover({
            trigger: 'hover'
        });

        $('[data-toggle="tooltip"]').tooltip();

        // init boostrap-select
        $('.selectpicker').selectpicker();
        
    },

    events: {
        'click #project-analysis-presto' : 'toggleParametersPresto',
        'click #project-analysis-vdjpipe' : 'toggleParametersVDJPipe',
        'click #project-analysis-igblast' : 'toggleParametersIgBlast',
        'click #project-analysis-repcalc' : 'toggleParametersRepCalc',
        'click #project-analysis-statistics' : 'toggleParametersStatistics',
        'click #project-analysis-cellranger' : 'toggleParametersCellranger',
        'click #project-analysis-tcrmatch' : 'toggleParametersTCRMatch',
        'click #project-analysis-trust4' : 'toggleParametersTRUST4',
        'click #project-analysis-compairr' : 'toggleParametersCompAIRR',
    },

    toggleParametersPresto: function(e) {
        e.preventDefault();
        this.toggleSubview('presto', new PrestoParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },

    toggleParametersVDJPipe: function(e) {
        e.preventDefault();
        this.toggleSubview('vdjpipe', new VDJPipeParameterView({controller: this.controller, model: this.model.VDJPipeParameters, analysisDetailView: this}));
    },
    
    toggleParametersIgBlast: function(e) {
        e.preventDefault();
        this.toggleSubview('igblast', new IgBlastParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },
    
    toggleParametersRepCalc: function(e) {
        e.preventDefault();
        this.toggleSubview('repcalc', new RepCalcParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },
    
    toggleParametersStatistics: function(e) {
        e.preventDefault();
        this.toggleSubview('statistics', new StatisticsParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },
    
    toggleParametersCellranger: function(e) {
        e.preventDefault();
        this.toggleSubview('cellranger', new CellrangerParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },
    
    toggleParametersTCRMatch: function(e) {
        e.preventDefault();
        this.toggleSubview('tcrmatch', new TCRMatchParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },
    
    toggleParametersTRUST4: function(e) {
        e.preventDefault();
        this.toggleSubview('trust4', new TRUST4ParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },
    
    toggleParametersCompAIRR: function(e) {
        e.preventDefault();
        this.toggleSubview('compairr', new CompAIRRParameterView({controller: this.controller, model: this.model, analysisDetailView: this}));
    },
    
    /**
    * Toggles the subview for the pipeline tool clicked.
    * Either replaces or removes the subview.
    * For highlighting to work, tool div needs ".subview-button" class and have an id of "project-analysis-<subviewName>"
    * @param {string} subviewName Tool name: 'presto', 'vdjpipe', 'igblast', 'repcalc', 'statistics', 'cellranger', 'tcrmatch', 'trust4', 'compairr'
    * @param {Marionette.View} subview Marionette view instance
    */
    toggleSubview: function(subviewName, subview) {
        // highlights button
        const btn = $(`#project-analysis-${subviewName}`);
        this.$('.subview-button').each(function() {
            if($(this).is(btn)) {
                if(btn.hasClass('btn-active')) {btn.removeClass('btn-active');}
                else {btn.addClass('btn-active');}
            } else {$(this).removeClass('btn-active');}
        })

        // show/switch subview
        var parameterRegion = this.getRegion('parameterRegion');
        if (parameterRegion.hasView()) {
            var toolName = parameterRegion.currentView.toolName;
            if (toolName == subviewName) {parameterRegion.empty();}
            else {parameterRegion.show(subview);}
        } else {parameterRegion.show(subview);}
    },

    /**
     * Used in too js files `project-analyses-<toolName>.js`
     * @param {*} childClassName Name of child class to disable related to e
     * @param {*} e current toggle switch
     */
    toggleChildren: function(childClassName, e) {
        this.$(`.${childClassName}`).each(function () {
            $(this).prop('disabled', !e.target.checked);
            if($(this).hasClass('selectpicker')) {
                $(this).selectpicker('refresh');
            }
        });
    },
});

// Container view for analysis detail
// There are three analysis views: summary, detail and edit
// detail and edit are the same layout, but either in read or edit mode
var AnalysisContainerView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-analysis-container"></div>'),

    // one region for contents
    regions: {
        containerRegion: '#project-analysis-container'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // save state in model
        // if editing, leave in edit
        // get default view mode from controller
        if (this.model.view_mode != 'edit')
            this.model.view_mode = this.controller.getAnalysesViewMode();

        this.showAnalysisView();
    },

    showAnalysisView() {
        //console.log("passing edit_mode...");
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
            case 'edit':
                this.showChildView('containerRegion',new AnalysisDetailView({controller: this.controller, model: this.model}));
                break;
            case 'summary':
            default:
                this.showChildView('containerRegion', new AnalysisSummaryView({controller: this.controller, model: this.model}));
                break;
        }
    },

});

// list of analyses
var AnalysesListView = Marionette.CollectionView.extend({
    template: Handlebars.compile("<div></div>"),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = AnalysisContainerView;
        this.childViewOptions = { controller: this.controller };
    }
});

export default AnalysesListView;
