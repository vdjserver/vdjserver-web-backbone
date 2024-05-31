//
// project-files.js
// Project files management
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
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
import ProjectFilesListView from 'Scripts/views/project/files/project-files-list';
import ProjectFilesUploadView from 'Scripts/views/project/files/project-files-upload';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';

// Project Files Page
import template from 'Templates/project/files/files-header.html';
var ProjectFilesHeaderView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    templateContext() {
        if (!this.controller) return {};
        var files = this.controller.getPairedList();
        var current_sort = files['sort_by'];
        return {
            current_sort: current_sort,
            hasEdits: this.controller.hasFileEdits()
        }
    },

    events: {
        // sort files list
        'click #project-files-sort-select': function(e) {
            // check it is a new sort
            var files = this.controller.getPairedList();
            var current_sort = files['sort_by'];
            if (e.target.name != current_sort) {
                this.controller.applySort(e.target.name);
                this.updateHeader();
            }
        },

        // file uploading
        'click #project-files-upload-computer': function(e) {
            e.preventDefault();
            this.controller.uploadFileFromComputer();
        },

        // file pairing
        'click #project-files-pair-files': function(e) {
            e.preventDefault();
            this.controller.showPairFiles();
        },

        // save/revert changes
        'click #project-files-revert-changes': function(e) {
            e.preventDefault();
            this.controller.revertFileChanges();
        },
        'click #project-files-save-changes': function(e) {
            e.preventDefault();
            this.controller.saveFileChanges();
        },
    },

    enableChangesButtons: function(state) {
        $('#project-files-revert-changes').prop('disabled', !state);
        $('#project-files-save-changes').prop('disabled', !state);
    }

});


// this manages project files layout
// shows all the files in a list
// content display is handled by sub views
var ProjectFilesView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-files-header"></div><div id="project-upload-staging"></div><div id="project-files-list"></div>'),

    // one region for any header content
    // one region for file upload staging
    // one region for the files collection
    regions: {
        headerRegion: '#project-files-header',
        stagingRegion: '#project-upload-staging',
        listRegion: '#project-files-list'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    showProjectFilesList: function(filesList) {
        //this.showChildView('headerRegion', new ProjectFilesHeaderView({controller: this.controller}));
        this.buttonsView = new ProjectFilesHeaderView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);
        this.showChildView('listRegion', new ProjectFilesListView({collection: filesList, controller: this.controller}));
    },

    showUploadFiles: function() {
        this.showChildView('stagingRegion', new ProjectFilesUploadView({model: this.model, controller: this.controller}));
    },

    clearUploadFiles: function() {
        this.getChildView('stagingRegion').destroy();
    },

    updateHeader: function() {
        //this.showChildView('headerRegion', new ProjectFilesHeaderView({controller: this.controller}));
        this.buttonsView = new ProjectFilesHeaderView({controller: this.controller});
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

    enableChangesButtons: function(state) {
        this.buttonsView.enableChangesButtons(state);
    }

});

export default ProjectFilesView;
