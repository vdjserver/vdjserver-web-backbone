
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

const MultiSelect = require('Scripts/views/project/groups/multiselect.js');

// Project analyses controller
//
function ProjectGroupsController(controller) {
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
        newGroup.view_mode = 'edit';
        clonedList.add(newGroup, {at:0});

        // Wait for DOM to update before initializing
        setTimeout(() => {
            let newSelect = document.querySelector(`#repertoires_${newGroup.cid}`);
            if (newSelect && !newSelect.dataset.multiSelectInitialized) {
                if (typeof MultiSelect !== "undefined") {
                    new MultiSelect(newSelect);
                    newSelect.dataset.multiSelectInitialized = "true";
                } else {
                    console.error("MultiSelect is not defined.");
                }
            }
        }, 100);

        $('#repertoire_group_id_'+newGroup.cid).focus();
        this.flagGroupEdits();
    },

    // ******** OLD *********
    // removeRepertoireFromGroup: function(e) {
    //     e.preventDefault();
    //     console.log("Remove button clicked"); // Debugging log
    //     // var clonedList = this.getSubjectsList();
    //     // clonedList.remove(model.id);
    //     // this.flagSubjectsEdits();
    //     // event.target.closest('.project-repertoire-group-row').remove();
    // },

    // ******** OLD *********
    // addRepertoireGroupDropdown: function(e) {
    //     e.preventDefault();
    //     console.log("add repertoire group repertoire");
    
    //     const additionalRepertoiresContainer = document.getElementById('additional-repertoires');
        
    //     // const newDropdown = document.createElement('div');
    //     // newDropdown.className = 'form-row project-repertoire-group-row'; // Each dropdown will have its own row
        
    //     // Add dropdown and remove button inside the same row
    //     // newDropdown.innerHTML = `
    //     // const newDropdown = `
    //     //     <div class="form-row project-repertoire-group-row">
    //     //         <div class="col-md-1"></div>
    //     //         <div class="col-md-10">
    //     //             <select class="form-control form-control-repertoire-group" name="repertoire_group_id" id="repertoire_group_id_{{uuid}}" aria-describedby="validationBlankID">
    //     //                 <option value="">Select a Repertoire</option>
    //     //                 <option value="repertoire1">Repertoire 1</option>
    //     //                 <option value="repertoire2">Repertoire 2</option>
    //     //                 <option value="repertoire3">Repertoire 3</option>
    //     //             </select>
    //     //             <div id="validationBlankID" class="invalid-feedback">
    //     //                 Please select a Repertoire Group.
    //     //             </div>
    //     //         </div>
    //     //         <div class="col-md-1 d-flex align-items-end">
    //     //             <button type="button" class="btn btn-danger remove-repertoire">Remove</button>
    //     //         </div>
    //     //     </div>
    //     // `;

    //     const newDropdown = document.createElement('div');
    //     newDropdown.className = 'form-row project-repertoire-group-row'; // Each dropdown will have its own row

    //     // Add dropdown and remove button inside the same row
    //     newDropdown.innerHTML = `
    //         <div class="form-group col-md-1"></div>
    //         <div class="form-group col-md-10"> <!-- Dropdown column takes up 10 units -->
    //             <select class="form-control form-control-repertoire-group" name="repertoire_group_id" id="repertoire_group_id_{{uuid}}" aria-describedby="validationBlankID">
    //                 <option value="">Select a Repertoire</option>
    //                 <option value="repertoire1">Repertoire 1</option>
    //                 <option value="repertoire2">Repertoire 2</option>
    //                 <option value="repertoire3">Repertoire 3</option>
    //             </select>
    //             <div id="validationBlankID" class="invalid-feedback">
    //                 Please select a Repertoire Group.
    //             </div>
    //         </div>
    //         <div class="form-group col-md-1 d-flex align-items-end"> <!-- Remove button column takes up 2 units -->
    //             <button type="button" class="btn btn-danger remove-repertoire">Remove</button>
    //         </div>
    //     `;
        
    //     // Append the new dropdown row to the container
    //     // additionalRepertoiresContainer.innerHTML += newDropdown;
    //     additionalRepertoiresContainer.appendChild(newDropdown);
    // },

    toggleGroupsViewMode() {
        switch(this.groups_view_mode) {
            case 'summary': this.groups_view_mode = 'detail'; break;
            case 'detail': this.groups_view_mode = 'summary'; break;
        }
        var coll = this.getGroupList();
        for (let i = 0; i < coll.length; ++i) {
            let m = coll.at(i);
            if (m.view_mode != 'edit') m.view_mode = this.groups_view_mode;
        }
        this.showProjectGroupsList();
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

    saveSubjectsChanges: function(e) {
        console.log('test');
    }

};
export default ProjectGroupsController;

