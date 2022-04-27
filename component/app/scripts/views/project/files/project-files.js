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

// Project Files Page
import template from 'Templates/project/files/files-header.html';
var ProjectFilesHeaderView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },
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

    events: {
        'click #project-files-upload-computer': 'uploadFileFromComputer',
        'click #cancel-upload-button': 'cancelUpload',
        'click #start-upload-button':  'startUpload',
        'click #done-upload-button':  'doneUpload'
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    showProjectFilesList(filesList) {
        this.showChildView('headerRegion', new ProjectFilesHeaderView());
        this.showChildView('listRegion', new ProjectFilesListView({collection: filesList, controller: this.controller}));
    },

    showUploadFiles() {
        this.showChildView('stagingRegion', new ProjectFilesUploadView({model: this.model, controller: this.controller}));
    },

    uploadFileFromComputer: function(e, stagedFiles) {
        e.preventDefault();

        if (! this.controller.uploadFiles) {
            this.controller.uploadFiles = new Backbone.Collection();
        }
        this.showUploadFiles();
    },

    cancelUpload: function(e) {
        e.preventDefault();

        // TODO: if upload is running then cancel
        //this.models.forEach(function(model) {
        //    model.trigger(ProjectFile.CANCEL_UPLOAD);
        //});

        this.controller.uploadFiles = null;
        this.getChildView('stagingRegion').destroy();
    },

    startUpload: function(e) {
        e.preventDefault();

        // call controller to do upload
        // it will call us back to redisplay the upload region
        this.controller.startUpload();
    },

    doneUpload: function(e) {
        e.preventDefault();

        // call controller to cleanup after upload
        this.controller.cleanUpload();
        // update UI
        this.getChildView('stagingRegion').destroy();
    },

});

export default ProjectFilesView;
