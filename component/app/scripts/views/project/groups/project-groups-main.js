//
// project-groups-main.js
// Project repertoire group management
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
import ProjectGroupsListView from 'Scripts/views/project/groups/project-groups-list';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';

// Project Groups Page
import template from 'Templates/project/groups/project-groups-buttons.html';
var ProjectGroupsButtonView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    // templateContext() {
        //if (!this.controller) return {};
        //var files = this.controller.getPairedList();
        //var current_sort = files['sort_by'];
        // return {
            //current_sort: current_sort,
            //hasEdits: this.controller.hasFileEdits()
        // }

    templateContext() {
        var detailsMode = false;

        if(this.controller.getGroupsViewMode() == 'detail' || this.controller.getGroupsViewMode() == 'edit') {
            this.detailsMode = true;
        } else { this.detailsMode = false; }

        var editMode = false;
        if(this.controller.getGroupsViewMode() == 'edit') {
            this.editMode = true;
        } else { this.editMode = false; }

        var colls = this.controller.getCollections();
        var current_sort = colls['groupList']['sort_by'];

        return {
            detailsMode: this.detailsMode,
            editMode: this.editMode,
            has_edits: this.controller.has_edits,
            current_sort: current_sort,
        }
    },

    events: {
        'click #project-groups-details-summary' : function(e) {
            e.preventDefault();
            this.controller.toggleGroupsViewMode();
        },

        'click #project-groups-new-group': function(e) {
            e.preventDefault();
            this.controller.addGroup(e);
        },

        'click #project-groups-save-changes': function(e) {
            e.preventDefault();
            this.controller.saveGroupsChanges(e);
        },
        'click #project-groups-revert-changes': function(e) {
            e.preventDefault();
            this.controller.revertGroupsChanges();
        },
        'click #remove-repertoire': function (e) {
            e.preventDefault();
            this.controller.removeRepertoireFromGroup(e);
        },
        'click #add-repertoire-dropdown': function(e) {
            e.preventDefault();
            this.controller.addRepertoireGroupDropdown(e);
        },
        'click #project-groups-sort-select': function(e) {
            // check it is a new sort
            var colls = this.controller.getCollections();
            var current_sort = colls['groupList']['sort_by'];
            colls['groupList']['sort_by'] = e.target.name;
            if (e.target.name != current_sort) {
                this.controller.applySort(e.target.name);
                //this.updateHeader();
            }
        },
    },
});


// this manages project groups layout
// shows all the groups in a list
// content display is handled by sub views
var ProjectGroupsView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-groups-list"></div>'),

    // one region for any header content
    // one region for the groups collection
    regions: {
        listRegion: '#project-groups-list'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    events: {
        // sort files list
        'click #project-groups-sort-select': function(e) {
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
        this.buttonsView = new ProjectGroupsButtonView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

    showProjectGroupsList: function(groupsList) {
        this.updateHeader();
        this.showChildView('listRegion', new ProjectGroupsListView({collection: groupsList, controller: this.controller}));
    },

});

export default ProjectGroupsView;
