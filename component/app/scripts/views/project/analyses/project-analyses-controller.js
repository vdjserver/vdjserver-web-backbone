
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

    // mapping for tool parameter views
    this.toolViewMap = {
        vdjpipe: VDJPipeParameterView,
        presto: PrestoParameterView,
        igblast: IgBlastParameterView,
        repcalc: RepCalcParameterView,
        statistics: StatisticsParameterView,
        cellranger: CellrangerParameterView,
        tcrmatch: TCRMatchParameterView,
        trust4: TRUST4ParameterView,
        compairr: CompAIRRParameterView,
    };

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

    flagEdits: function() {
        // we keep flag just for file changes
        this.has_edits = true;
        // update header
        this.mainView.updateHeader();
    },

    revertChanges: function() {
        // throw away changes by re-cloning
        this.has_edits = false;
        this.resetCollections();
        this.showProjectAnalysesList();
    },

    addAnalysis: function(name) {
        var newAnalysis = new AnalysisDocument({projectUuid: this.controller.model.get('uuid')});
        newAnalysis.setAnalysis(name);
        newAnalysis.view_mode = 'edit';

        var clonedList = this.getAnalysisList();
        clonedList.add(newAnalysis, {at:0});

        $('#analysis_id_'+newAnalysis.get('uuid')).focus();
        this.flagEdits();
    },

    updateField: function(e, model) {
        model.updateField(e.target.name, e.target.value);
    },

    updateToggle: function(e, model) {
        if(e.target.checked){model.updateField(e.target.name, e.target.checked)}
        else{model.updateField(e.target.name, e.target.checked)}
    },

    updateSelect: function(e, model) {
        model.updateField(e.target.name, e.target.value);
    },

};
export default ProjectAnalysesController;

