
'use strict';

//
// project-analyses-controller.js
// Controller for the project analyses page
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

import Project from 'Scripts/models/agave-project';
import ProjectAnalysesView from 'Scripts/views/project/analyses/project-analyses-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import FilterController from 'Scripts/views/utilities/filter-controller';

import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';
import { AnalysisDocument, ProjectJob } from 'Scripts/models/agave-job';
import { ProjectFileQuery } from 'Scripts/collections/agave-files';

// Project analyses controller
//
function ProjectAnalysesController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // default to summary views
    this.groups_view_mode = 'summary';
    // edits
    this.has_edits = false;
    this.resetCollections();

    // analyses view
    this.mainView = new ProjectAnalysesView({controller: this, model: this.model});
    this.filterController = new FilterController(this, "vdjserver_analysis");
    this.filterController.showFilter();
}

ProjectAnalysesController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectAnalysesView({controller: this, model: this.model});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectAnalysesView({controller: this, model: this.model});
        return this.mainView;
    },

    resetCollections() {
        // these collections should always point to the same models
        this.analysisList = this.controller.analysisList.getClonedCollection(); //create the cloned collection
    },

    // show project analyses
    showProjectAnalysesList() {
        // var collections = this.controller.getCollections();
        this.mainView.showProjectAnalysesList(this.analysisList);
        this.filterController.showFilter();
    },

    getCollections() {
        return this.controller.getCollections();
    },

    getAnalysisList() {
        return this.analysisList;
    },

    applySort(sort_by) {
        //var files = this.getPairedList();
        //files.sort_by = sort_by;
        //files.sort();
    },

    flagGroupEdits: function() {
        // we keep flag just for file changes
        this.has_edits = true;
        // update header
        this.mainView.updateHeader();
    },

    addAnalysisTCR: function(e) {
        console.log('pac Clicked addNewAnalysisTCR');

        var clonedList = this.getAnalysisList();

        var newAnalysis = new AnalysisDocument({projectUuid: this.controller.model.get('uuid')});
        newAnalysis.getWorkflowTCR();

        newAnalysis.view_mode = 'edit';
        newAnalysis.analysis_type = "TCR";
        
        clonedList.add(newAnalysis, {at:0});

        $('#analysis_id_'+newAnalysis.get('uuid')).focus();
        this.flagGroupEdits();
    },

    addAnalysisIG: function(e) {
        console.log('pac Clicked addNewAnalysisIG');
        
        var newAnalysis = new AnalysisDocument({projectUuid: this.controller.model.get('uuid')});
        newAnalysis.getWorkflowIG();
        newAnalysis.view_mode = 'edit';
        
        var clonedList = this.getAnalysisList();
        clonedList.add(newAnalysis, {at:0});

        $('#analysis_id_'+newAnalysis.get('uuid')).focus();
        this.flagGroupEdits();
    },

    addAnalysis10X: function(e) {
        console.log('pac Clicked addNewAnalysis10X');

        var newAnalysis = new AnalysisDocument({projectUuid: this.controller.model.get('uuid')});
        newAnalysis.getWorkflow10X();
        newAnalysis.view_mode = 'edit';
        
        var clonedList = this.getAnalysisList();
        clonedList.add(newAnalysis, {at:0});

        $('#analysis_id_'+newAnalysis.get('uuid')).focus();
        this.flagGroupEdits();
    },

    addAnalysisComparative: function(e) {
        console.log('pac Clicked addNewAnalysisComparative');

        var newAnalysis = new AnalysisDocument({projectUuid: this.controller.model.get('uuid')});
        newAnalysis.getWorkflowComparative();
        newAnalysis.view_mode = 'edit';
        
        var clonedList = this.getAnalysisList();
        clonedList.add(newAnalysis, {at:0});

        $('#analysis_id_'+newAnalysis.get('uuid')).focus();
        this.flagGroupEdits();
        
        console.log('clonedList', clonedList);
    },

};
export default ProjectAnalysesController;

