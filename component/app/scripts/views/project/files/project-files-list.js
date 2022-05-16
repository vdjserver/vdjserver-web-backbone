//
// project-files-list.js
// List of files for projects
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

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';

import detail_template from 'Templates/project/files/files-detail.html';
var ProjectFileDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    events: {
        'change #project-file-type': 'updateFileType',
        'change #project-file-read-direction': 'updateReadDirection',
        'change #project-file-tags': 'updateFileTags',
        'click #project-file-download': 'downloadFile',
    },

    templateContext() {
        return {
            fileTypes: File.getFileTypes(),
            fileTypeNames: File.getFileTypeNames(),
            readDirections: File.getReadDirections(),
        };
    },

    updateFileType: function(e) {
        // let controller know something is being changed
        this.controller.flagProjectEdit(true);
        // update the model
        let value = this.model.get('value');
        value['fileType'] = parseInt(e.currentTarget.value);
        this.model.set('value', value);
    },

    updateReadDirection: function(e) {
        // let controller know something is being changed
        this.controller.flagProjectEdit(true);
        // update the model
        let value = this.model.get('value');
        value['readDirection'] = e.target.value;
        this.model.set('value', value);
    },

    updateFileTags: function(e) {
        // let controller know something is being changed
        this.controller.flagProjectEdit(true);
        // update the model
        this.model.updateTags(e.target.value);
    },

    downloadFile: function(e) {
        e.preventDefault();

        var fileModel = this.model.getFileModel();

        fileModel.downloadFileToDisk()
            .fail(function(error) {
                // TODO: handle error
                console.log(error);
            });
    },
});

import table_template from 'Templates/project/files/files-detail-table.html';
export default Marionette.CollectionView.extend({
    template: Handlebars.compile(table_template),
    childViewContainer: '.project-files-detail-table',

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = ProjectFileDetailView;
        this.childViewOptions = { controller: this.controller };
    },
});

