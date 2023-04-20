
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
import ProjectAnalysesView from 'Scripts/views/project/analyses/project-analyses';
import LoadingView from 'Scripts/views/utilities/loading-view';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';

import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';
import { ProjectFileQuery } from 'Scripts/collections/agave-files';

// Project analyses controller
//
function ProjectAnalysesController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // analyses view
    this.mainView = new ProjectAnalysesView({controller: this, model: this.model});
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

    // show project analyses
    showProjectAnalysesList() {
        var collections = this.controller.getCollections();
        this.mainView.showProjectAnalysesList(collections.analysisList);
    },

    applySort(sort_by) {
        //var files = this.getPairedList();
        //files.sort_by = sort_by;
        //files.sort();
    },

};
export default ProjectAnalysesController;

