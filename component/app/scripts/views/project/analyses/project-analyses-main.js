//
// project-analyses.js
// Project analyses management
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

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'Scripts/models/agave-project';
import ProjectAnalysesListView from 'Scripts/views/project/analyses/project-analyses-list';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';

// Project Analyses Page
import template from 'Templates/project/analyses/project-analyses-buttons.html';
var ProjectAnalysesButtonView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        //if (!this.controller) return {};
        //var files = this.controller.getPairedList();
        //var current_sort = files['sort_by'];
        
        // get workflows for repertoires
        var workflowArr = [];
        var workflows = EnvironmentConfig.workflows;
        Object.keys(workflows).forEach(workflow => {
            workflowArr.push({
                'name':workflows[workflow]['vdjserver:name'], 
                'html_id':workflow
            });
        });
        
        // get single-tools for repertoires
        var singleToolArr = [];
        var apps = EnvironmentConfig.apps;
        Object.keys(apps).forEach(singleTool => {
            singleToolArr.push({
                'name':apps[singleTool]['vdjserver:name'],
                'html_id':singleTool
            });
        });

        return {
            //current_sort: current_sort,
            has_edits: this.controller.has_edits,
            workflows: workflowArr, 
            single_tools: singleToolArr, 
        }
    },

    events: {
        'click #project-analysis-new-select' : function(e) {
            e.preventDefault();
            this.controller.addAnalysis(e.target.name);
        },

        'click #project-analyses-revert-changes': function(e) {
            e.preventDefault();
            this.controller.revertChanges();
        },

        'click #project-analyses-save-changes': function(e) {
            e.preventDefault();
            this.controller.saveChanges();
        },
    }
});


// this manages project analyses layout
// shows all the analyses in a list
// content display is handled by sub views
var ProjectAnalysesView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-analyses-list"></div>'),

    // one region for any header content
    // one region for the analyses collection
    regions: {
        //headerRegion: '#project-analyses-header',
        // buttonRegion: '#project-analyses-buttons',
        listRegion: '#project-analyses-list'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    events: {
        // sort files list
        'click #project-analyses-sort-select': function(e) {
            // check it is a new sort
            //var files = this.controller.getPairedList();
            //var current_sort = files['sort_by'];
            //if (e.target.name != current_sort) {
            //    this.controller.applySort(e.target.name);
            //    this.updateHeader();
            //}
        },
    },

    updateHeader: function() {
        this.buttonsView = new ProjectAnalysesButtonView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

    showProjectAnalysesList: function(analysesList) {
        this.updateHeader();
        //this.showChildView('buttonRegion', new ProjectAnalysesButtonView({controller: this.controller}));
        this.showChildView('listRegion', new ProjectAnalysesListView({collection: analysesList, controller: this.controller}));
    },

});

export default ProjectAnalysesView;
