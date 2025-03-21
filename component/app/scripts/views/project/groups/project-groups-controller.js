
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
import SingleProjectController from 'Scripts/views/project/project-single-controller';

import { RepertoireGroup } from 'Scripts/models/agave-metadata';

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

    // access data held by upper level controller
    getCollections() {
        return this.controller.getCollections();
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
        // Better way to do this?
        // Without this, the first instance of "Repertoires" dropdown doesn't appear
        /*
        setTimeout(() => {
            console.log("this controller : ", this.controller);

            let newSelect = document.querySelector(`#repertoires_${newGroup.cid}`);
            if (newSelect) {
                // Dynamically add options to the select dropdown
                this.controller.repertoireList.models.forEach(repertoire => {
                    // Define the display name
                    var displayName = "";

                    // Add repertoire name
                    var repertoireName = repertoire.attributes.value.repertoire_name;
                    if(repertoireName) {displayName += "Repertoire: " + repertoireName + ", ";}

                    // Add subject name
                    var subjectName = repertoire.subject.attributes.value.subject_id;
                    if(subjectName) {displayName += "Subject: " + subjectName + ", ";}

                    // Add sample names
                    var sampleNames = [];
                    repertoire.sample.models.forEach(sample => {
                        sampleNames.push(sample.attributes.value.sample_id);
                    })
                    if(sampleNames) {
                        displayName += "Sample";
                        if(sampleNames.length > 1) {displayName += "s";}
                        displayName += ":";
                        sampleNames.forEach(sampleName => {
                            displayName += " " + sampleName + ",";
                        });
                        displayName = displayName.slice(0,-1);
                    }

                    // Create the HTML option element
                    let option = document.createElement('option');
                    option.value = displayName;
                    option.textContent = displayName;

                    newSelect.appendChild(option);
                });

                $(newSelect).selectpicker({
                    style: 'btn-outline-light',
                });

                // Select all buttons inside the Bootstrap Select actions box
                let actionButtons = document.querySelectorAll('.bs-actionsbox .btn');

                if (actionButtons.length >= 2) {
                    actionButtons[0].classList.remove('btn-light');
                    actionButtons[0].classList.add('btn-success');

                    actionButtons[1].classList.remove('btn-light');
                    actionButtons[1].classList.add('btn-danger');
                }
            }
        }, 0); */

        $('#repertoire_group_id_'+newGroup.cid).focus();
        this.flagGroupEdits();
    },

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

