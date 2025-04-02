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
            age_display: this.model.getAgeDisplay(),
            species_display: this.model.getSpeciesDisplay(),
        }
    },

});

// analysis detail/edit view
import detail_template from 'Templates/project/analyses/project-analyses-detail.html';
var AnalysisDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

    },

    templateContext() {
        console.log('pal templateContext this.model:', this.model);
        console.log(this.controller);
        
        var colls = this.controller.getCollections();
        var analystList = colls.analysisList;
        var value = this.model.get('value');

        var workflow_mode = this.controller.analysisList.models[0].attributes.value.workflow_mode; // 'IG' '10X' or 'comparative'

        // list of repertoires/repertoire groups
        var rep_list = [];
        var group_list = [];

        // create displayName for repertoires
        colls.repertoireList.models.forEach(repertoire => {
            // Define the display name
            var displayName = "";

            // Add repertoire name
            var repertoireName = repertoire.attributes.value.repertoire_name;
            if(repertoireName) {displayName += "Repertoire: " + repertoireName + ",";}

            // Add subject name
            var subjectName = repertoire.subject.attributes.value.subject_id;
            if(displayName) {displayName += " ";}
            if(subjectName) {displayName += "Subject: " + subjectName + ",";}

            // Add sample names
            var sampleNames = [];
            repertoire.sample.models.forEach(sample => {
                sampleNames.push(sample.attributes.value.sample_id);
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

        colls.groupList.models.forEach(group => {
            // Define the display name
            var displayName = "";

            // Add group name
            var groupName = group.attributes.value.group_name;
            if(groupName) {displayName += "Group: " + groupName + ",";} // should always be truthy

            // Add number of repertoires
            var numReps = group.length;
            if(displayName) {displayName += " ";} // should always be truthy
            if(numReps) {displayName += "("+numReps+" repertoires),";} // should always be truthy

            // Remove dangling ","
            if(displayName) {displayName = displayName.slice(0,-1);}

            var selected = false;
            for (let i in value['repertoires'])
                if (value['repertoires'][i]['repertoire_id'] == group.get('uuid'))
                    selected = true;

            group_list.push({ uuid:group.get('uuid'), displayName:displayName, selected:selected });
        });

        return {
            showVDJPipeDiv: workflow_mode === "TCR" || workflow_mode === "IG",
            showCellrangerDiv: workflow_mode === "10X",
            showIgBlastDiv: workflow_mode === "TCR" || workflow_mode === "IG",
            showRepCalcDiv: workflow_mode === "TCR" || workflow_mode === "IG" || workflow_mode === "10X",
            hideArrowDivs: workflow_mode === "Comparative",
            workflow_mode: workflow_mode,
            view_mode: this.model.view_mode,
            rep_list: rep_list,
            group_list: group_list
        }
    },

    onAttach() {
        // setup popovers and tooltips
        $('[data-toggle="popover"]').popover({
            trigger: 'hover'
        });

        $('[data-toggle="tooltip"]').tooltip();

        // init boostrap-select
        $('.selectpicker').selectpicker();
        
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
