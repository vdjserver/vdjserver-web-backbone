
'use strict';

//
// project-subjects-controller.js
// Controller for the project subjects page
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
import ProjectSubjectsView from 'Scripts/views/project/subjects/project-subjects-main';
import LoadingView from 'Scripts/views/utilities/loading-view';


// Project subjects controller
//
function ProjectSubjectsController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // default to summary views
    this.subjects_view_mode = 'summary';
    // edits
    this.has_edits = false;

    this.mainView = new ProjectSubjectsView({model: this.model, controller: this});
}

ProjectSubjectsController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectSubjectsView({model: this.model, controller: this});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectSubjectsView({model: this.model, controller: this});
        return this.mainView;
    },

    // access data held by upper level controller
    getCollections() {
        return this.controller.getCollections();
    },

    getSubjectsViewMode() {
        return this.subjects_view_mode;
    },

    toggleSubjectsViewMode() {
        // summary -> detail -> compressed -> summary
        switch(this.subjects_view_mode) {
            case 'summary': this.subjects_view_mode = 'detail'; break;
            case 'detail': this.subjects_view_mode = 'summary'; break;
            //case 'compressed': this.subjects_view_mode = 'summary'; break;
        }
    },

    // show project subjects
    showProjectSubjectsList() {
        var collections = this.controller.getCollections();
        this.mainView.showProjectSubjectsList(collections.subjectList);
    },

};
export default ProjectSubjectsController;

