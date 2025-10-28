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

// analysis detail/edit/started/finished view
import detail_template from 'Templates/project/analyses/project-analyses-detail.html';
import { findLastIndex } from 'underscore';
var AnalysisDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),
    analysisDetailView: this,

    regions: {
        toolSubviewButtonsRegion: '#project-analysis-tool-subview-buttons',
        parameterRegion: '#project-analysis-parameter',
        completedRegion: '#project-analysis-completed'
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

        // set flags for different statuses
        // this overrides the summary view as submitted analyses are immutable
        // should also prevent edit mode
        var view_mode = this.model.view_mode;
        var is_started = false;
        if (value['status'] == 'STARTED') {
            is_started = true;
            view_mode = 'started';
        }
        var is_error = false;
        if (value['status'] == 'ERROR') {
            is_error = true;
            view_mode = 'error';
        }
        var is_finished = false;
        if (value['status'] == 'FINISHED') {
            is_finished = true;
            view_mode = 'finished';
        }

        // TODO: we currently hard-code to max 3 steps in workflow
        var workflow_mode = value['workflow_mode']; // 'IG' '10X' or 'comparative'
        var apps = EnvironmentConfig.apps;
        var workflows = EnvironmentConfig.workflows;
        var step1 = null, step2 = null, step3 = null;
        var workflow_name;

        // check if it is a tool application
        if (apps[workflow_mode]) {
            workflow_name = apps[workflow_mode]['vdjserver:name'] + " Tool";
            step1 = {
                html_id: workflow_mode,
                name: apps[workflow_mode]['vdjserver:name']
            };
        }

        // check if it is a workflow
        if (workflows[workflow_mode]) {
            var workflow = workflows[workflow_mode];
            workflow_name = workflow['vdjserver:name'];
            step1 = {
                html_id: workflow['vdjserver:activity:pipeline'][0],
                name: apps[workflow['vdjserver:activity:pipeline'][0]]['vdjserver:name']
            };
            if (workflow['vdjserver:activity:pipeline'].length > 1) {
                step2 = {
                    html_id: workflow['vdjserver:activity:pipeline'][1],
                    name: apps[workflow['vdjserver:activity:pipeline'][1]]['vdjserver:name']
                };
            }
            if (workflow['vdjserver:activity:pipeline'].length > 2) {
                step3 = {
                    html_id: workflow['vdjserver:activity:pipeline'][2],
                    name: apps[workflow['vdjserver:activity:pipeline'][2]]['vdjserver:name']
                };
            }
        }

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
            view_mode: view_mode,
            is_started: is_started,
            is_error: is_error,
            is_finished: is_finished,
            rep_list: rep_list,
            group_list: group_list,
            workflow_name: workflow_name,
            step1: step1,
            step2: step2,
            step3: step3,
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
        'click .tool-button' : 'toggleToolButtonsView',
        // 'click #project-analyses-tool-subview-button-parameters' : 'toggleParameterView',
        'click .tool-subview-button' : 'toggleParameterView',
        'change .value-select': 'updateDropDown',
    },

    /**
    * Toggles the subview for the pipeline tool clicked.
    * Either replaces or removes the subview.
    * For highlighting to work, tool div needs ".subview-button" class and have an id of "project-analysis-<toolName>"
    */
    toggleToolButtonsView: function(e){
        e.preventDefault();
        let prevTool = null;
        if (this.toolName) {
            prevTool = this.toolName;
        }
        this.toolName = e.target.name;
        console.log(this.toolName);
        // show/switch tool
        let showView = true;
        var toolSubviewButtonsRegion = this.getRegion('toolSubviewButtonsRegion');
        var parameterRegion = this.getRegion('parameterRegion');
        if (toolSubviewButtonsRegion.hasView()) {
            if (parameterRegion.hasView()) {parameterRegion.empty()}
            toolSubviewButtonsRegion.empty();
            if (prevTool == this.toolName) {showView = false;}
        }
        if (showView) {
            if (this.controller.toolViewMap[this.toolName]) {
                let pview = new this.controller.toolButtonsView({controller: this.controller}) // toolName: toolName ***
                this.showChildView('toolSubviewButtonsRegion', pview);

                // TODO: Dynamically pick intro subview screen for tool ***
                pview = new this.controller.toolViewMap[this.toolName]({controller: this.controller, model: this.model.toolParameters[this.toolName]});
                this.showChildView('parameterRegion', pview);
                $(this.el).find(`#project-analyses-tool-subview-button-parameters`).addClass('btn-active');

            } else { console.error('no tool view'); } // TODO: show error subview?
        }

        // highlights button
        const btn = $(this.el).find(`#project-analysis-${this.toolName}`);
        this.$('.tool-button').each(function() {
            if($(this).is(btn)) {
                if(btn.hasClass('btn-active')) {btn.removeClass('btn-active');}
                else {btn.addClass('btn-active');}
            } else {$(this).removeClass('btn-active');}
        })
    },
    toggleParameterView: function(e) {
        e.preventDefault();
        if (e.target.name == "parameters") {
            this.toolSubviewName = this.toolName;
        } else {
            this.toolSubviewName = e.target.name;
        }
        console.log(this.toolName, this.toolSubviewName);

        // show/switch subview
        if (this.controller.toolViewMap[this.toolName]) {
            // let model = new this.model.toolParameters[this.toolSubviewName];
            let pview = new this.controller.toolViewMap[this.toolSubviewName]({controller: this.controller, model: this.model.toolParameters[this.toolSubviewName]});
            this.showChildView('parameterRegion', pview);
        } else { console.error('no tool view'); } // TODO: show error subview?

        // highlights button
        const btn = $(this.el).find(`#project-analyses-tool-subview-button-${e.target.name}`);
        this.$('.tool-subview-button').each(function() {
            if($(this).is(btn)) {
                if(!btn.hasClass('btn-active')) {btn.addClass('btn-active');}
            } else {$(this).removeClass('btn-active');}
        })
    },
    toggleCompletedView: function(e) {
        e.preventDefault();
        let subviewName = e.target.name;

        // show/switch subview
        let showView = true;
        var completedRegion = this.getRegion('completedRegion');
        if (completedRegion.hasView()) {
            // hide if clicked the same tool button
            var toolName = completedRegion.currentView.toolName;
            if (toolName == subviewName) {completedRegion.empty(); showView = false;}
        }
        if (showView) {
            if (this.controller.toolViewMap[subviewName]) {
                let pview = new this.controller.toolViewMap[subviewName]({controller: this.controller, model: this.model.toolParameters[subviewName]});
                this.showChildView('completedRegion', pview);
            } else { console.error('no tool view'); } // TODO: show error subview?
        }

        // highlights button
        const btn = $(this.el).find(`#project-analysis-${subviewName}`);
        this.$('.subview-button').each(function() {
            if($(this).is(btn)) {
                if(btn.hasClass('btn-active')) {btn.removeClass('btn-active');}
                else {btn.addClass('btn-active');}
            } else {$(this).removeClass('btn-active');}
        })
    },

    updateDropDown: function(e) {
        let ops = e.target.selectedOptions;
        if (ops.length == 0) this.model.setEntities(null, null);
        else {
            let colls = this.controller.getCollections();
            let reps = [];
            let groups = [];
            for (let i=0; i < ops.length; ++i) {
                if (ops[i].getAttribute('name') == 'group') groups.push(colls.groupList.get(ops[i]['id']));
                if (ops[i].getAttribute('name') == 'repertoire') reps.push(colls.repertoireList.get(ops[i]['id']));
            }
            this.model.setEntities(reps, groups);
        }
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
            this.model.view_mode = this.controller.getViewMode();

        this.showAnalysisView();
    },

    showAnalysisView() {
        // Choose which view class to render
        switch (this.model.view_mode) {
            case 'detail':
            case 'edit':
            case 'summary':
            default:
                this.showChildView('containerRegion',new AnalysisDetailView({controller: this.controller, model: this.model}));
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
