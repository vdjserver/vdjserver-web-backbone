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
        'change .form-control-file': 'updateField',
        'change .value-select': 'updateDropDown',
        'click #project-file-delete': 'deleteFile',
        'click #project-file-unpair': 'unpairFile',
        'click #project-file-download': 'downloadFile',
    },

    templateContext() {
        let value = this.model.get('value');
        let forward = null;
        let forward_extra = {};
        let reverse = null;
        let reverse_extra = {};
        if (value['pairedReadMetadataUuid']) {
            forward = this.model.get('value');
            forward_extra['lastUpdated'] = this.model.get('lastUpdated');
            forward_extra['fileTypeName'] = File.getFileTypeById(forward['fileType']);
            let fileList = this.controller.getProjectFilesList();
            let m = fileList.get(value['pairedReadMetadataUuid']);
            reverse = m.get('value');
            reverse_extra['lastUpdated'] = m.get('lastUpdated');
            reverse_extra['fileTypeName'] = File.getFileTypeById(reverse['fileType']);
        }
        let quality = null;
        let quality_extra = {};
        let read = null;
        let read_extra = {};
        if (value['qualityScoreMetadataUuid']) {
            read = this.model.get('value');
            read_extra['lastUpdated'] = this.model.get('lastUpdated');
            read_extra['fileTypeName'] = File.getFileTypeById(read['fileType']);
            let fileList = this.controller.getProjectFilesList();
            let m = fileList.get(value['qualityScoreMetadataUuid']);
            quality = m.get('value');
            quality_extra['lastUpdated'] = m.get('lastUpdated');
            quality_extra['fileTypeName'] = File.getFileTypeById(quality['fileType']);
        }
        return {
            fileTypes: File.getFileTypes(),
            fileTypeNames: File.getFileTypeNames(),
            readDirections: File.getReadDirections(),
            forward: forward,
            forward_extra: forward_extra,
            reverse: reverse,
            reverse_extra: reverse_extra,
            quality: quality,
            quality_extra: quality_extra,
            read: read,
            read_extra: read_extra
        };
    },

    updateField: function(e) {
        this.controller.flagFileEdits(true);
        let value = this.model.get('value');
        switch (e.target.id) {
            case 'project-file-reverse-tags': {
                let fileList = this.controller.getProjectFilesList();
                let m = fileList.get(value['pairedReadMetadataUuid']);
                m.updateField(e.target.name, e.target.value);
                break;
            }
            case 'project-file-quality-tags': {
                let fileList = this.controller.getProjectFilesList();
                let m = fileList.get(value['qualityScoreMetadataUuid']);
                m.updateField(e.target.name, e.target.value);
                break;
            }
            default:
                this.model.updateField(e.target.name, e.target.value);
        }
    },

    updateDropDown: function(e) {
        this.controller.flagFileEdits(true);
        this.model.updateField(e.target.name, e.target.value);
    },

    deleteFile: function(e) {
        this.controller.deleteFile(e, this.model);
    },

    unpairFile: function(e) {
        e.preventDefault();
        this.controller.unpairFile(this.model);
    },

    downloadFile: function(e) {
        e.preventDefault();

        // handle paired files
        if ((!e.target.name) || (e.target.name == "forward") || (e.target.name == "read")) {
            this.model.downloadFileToDisk()
                .fail(function(error) {
                    // TODO: handle error
                    console.log(error);
                });
        }
        if (e.target.name == "reverse") {
            let value = this.model.get('value');
            let fileList = this.controller.getProjectFilesList();
            let m = fileList.get(value['pairedReadMetadataUuid']);
            m.downloadFileToDisk()
                .fail(function(error) {
                    // TODO: handle error
                    console.log(error);
                });
        }
        if (e.target.name == "quality") {
            let value = this.model.get('value');
            let fileList = this.controller.getProjectFilesList();
            let m = fileList.get(value['qualityScoreMetadataUuid']);
            m.downloadFileToDisk()
                .fail(function(error) {
                    // TODO: handle error
                    console.log(error);
                });
        }
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

