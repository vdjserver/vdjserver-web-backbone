
'use strict';

//
// project-samples-controller.js
// Controller for the project samples page
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

import Project from 'Scripts/models/agave-project';
import ProjectSamplesView from 'Scripts/views/project/samples/project-samples-main';
import LoadingView from 'Scripts/views/utilities/loading-view';

// Project samples controller
//
function ProjectSamplesController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // default to summary views
    this.view_mode = 'summary';
    // edits
    this.has_edits = false;

    this.mainView = new ProjectSamplesView({model: this.model, controller: this});
}

ProjectSamplesController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectSamplesView({model: this.model, controller: this});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectSamplesView({model: this.model, controller: this});
        return this.mainView;
    },

    // access data held by upper level controller
    getCollections() {
        return this.controller.getCollections();
    },

    // show project  samples
    showProjectSamplesList() {
        var collections = this.controller.getCollections();

        // TODO: any filtering?

        this.mainView.showProjectSamplesList(collections.sampleList);
    },

};
export default ProjectSamplesController;

