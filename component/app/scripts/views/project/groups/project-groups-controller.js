
'use strict';

//
// project-groups-controller.js
// Controller for the project groups page
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2024 The University of Texas Southwestern Medical Center
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
import ProjectGroupsView from 'Scripts/views/project/groups/project-groups-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import FilterController from 'Scripts/views/utilities/filter-controller';

import { RepertoireGroup } from 'Scripts/models/agave-metadata';

// Project analyses controller
//
function ProjectGroupsController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // default to summary views
    this.subjects_view_mode = 'summary';
    // edits
    this.has_edits = false;
    this.resetCollections();

    // analyses view
    this.mainView = new ProjectGroupsView({controller: this, model: this.model});
    this.filterController = new FilterController(this, "airr_repertoire_group");
    this.filterController.showFilter();
}

ProjectGroupsController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectGroupsView({controller: this, model: this.model});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectGroupsView({controller: this, model: this.model});
        return this.mainView;
    },

    resetCollections() {
        // these collections should always point to the same models
        this.groupList = this.controller.groupList.getClonedCollection(); //create the cloned collection
    },

    getGroupList() {
        return this.groupList;
    },

    getOriginalGroupList() {
        return this.controller.groupList;
    },

    // show project analyses
    showProjectGroupsList() {
        //var collections = this.controller.getCollections();
        this.mainView.showProjectGroupsList(this.groupList);
        this.filterController.showFilter();
    },

    addGroup: function(e) {
      var clonedList = this.getGroupList();
      var newGroup = new RepertoireGroup({projectUuid: this.controller.model.get('uuid')});
      //newSubject.set('uuid', newSubject.cid);
      //this.newSubjectList.push(newSubject.cid);
      newGroup.view_mode = 'edit';
      clonedList.add(newGroup, {at:0});
      //$('#subject_id_'+newSubject.cid).focus();
      //this.flagSubjectsEdits();
    },

    applySort(sort_by) {
        //var files = this.getPairedList();
        //files.sort_by = sort_by;
        //files.sort();
    },

};
export default ProjectGroupsController;

