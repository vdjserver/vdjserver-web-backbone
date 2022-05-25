//
// project-files-upload.js
// File upload view
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

import { Agave } from 'Scripts/backbone/backbone-agave';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';

import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';

import Message from 'Scripts/models/message';
import AlertView from 'Scripts/views/utilities/alert-box';

import Project from 'Scripts/models/agave-project';
import FileTransferProjectUiMixin from 'Scripts/views/project/mixins/file-transfer-project-ui-mixin';

// detail view for file to be uploaded
import detail_template from 'Templates/project/files/project-files-upload-detail.html';
var FilesUploadDetailView = Marionette.View.extend({
    template: Handlebars.compile(detail_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    events: {
        'change #file-type': 'updateType',
    },

    templateContext() {
        let pctComplete = 0;
        let uploadProgress = 0;
        let stageProgress = 0;
        if (this.model.get('uploadProgress')) uploadProgress = this.model.get('uploadProgress');
        if (this.model.get('stageProgress')) stageProgress = this.model.get('stageProgress');
        pctComplete = Math.round(100 * (uploadProgress + stageProgress) / (2 * this.model.get('length')));
        let uploadStatus = this.model.get('uploadStatus');
        let uploadStatusText = 'Queued';
        if (uploadStatus == 'upload') uploadStatusText = 'Uploading';
        if (uploadStatus == 'stage') uploadStatusText = 'Staging';
        if (uploadStatus == 'attach') uploadStatusText = 'Attaching';
        if (uploadStatus == 'complete') uploadStatusText = 'Complete';
        let hasError = false;
        if (uploadStatus == 'error') {
            uploadStatusText = 'ERROR';
            hasError = true;
        }

        return {
            isUploading: this.controller.isUploading,
            pctComplete: pctComplete,
            uploadStatusText: uploadStatusText,
            hasError: hasError,
            fileTypeName: File.getFileTypeById(this.model.get('type')),
            fileTypes: File.getFileTypes(),
            fileTypeNames: File.getFileTypeNames(),
            cid: this.model.cid
        };
    },

    modelEvents: {
        'change:uploadStatus': 'onUploadChange',
        'change:uploadProgress': 'onUploadChange',
        'change:stageProgress': 'onUploadChange'
    },

    onUploadChange(model, value) {
        console.log('New value: ' + value);
        this.render();
    },

    updateType: function(e) {
        e.preventDefault();
        this.model.set('type', parseInt(e.target.value));
    },
});

// list of files to upload
import table_template from 'Templates/project/files/project-files-upload-list.html';
var FilesUploadListView =  Marionette.CollectionView.extend({
    template: Handlebars.compile(table_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        this.childView = FilesUploadDetailView;
        this.childViewOptions = { controller: this.controller };
    },
});

// progress view with other buttons
import progress_template from 'Templates/project/files/project-files-upload-progress.html';
var FilesUploadProgressView = Marionette.View.extend({
    template: Handlebars.compile(progress_template),

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
    },

    events: {
    },

    templateContext() {
        let totalFiles = 0;
        if (this.controller.uploadFiles) totalFiles = this.controller.uploadFiles.length;
        let disableStart = true;
        if (totalFiles > 0) disableStart = false;
        let pctComplete = 0;
        if (this.controller.totalProgressLength > 0)
            pctComplete = Math.round(100 * this.controller.progressLength / this.controller.totalProgressLength);
        return {
            disableStart: disableStart,
            isUploading: this.controller.isUploading,
            uploadFinished: this.controller.uploadFinished,
            completeFiles: this.controller.completeFiles,
            totalFiles: totalFiles,
            pctComplete: pctComplete
        };
    },

    updateProgress: function(length, totalLength) {
    },
});

// Files Upload Page
import files_template from 'Templates/project/files/project-files-upload.html';
var FilesUploadView = Marionette.View.extend(
    _.extend({}, FileTransferProjectUiMixin, {
        template: Handlebars.compile(files_template),

        regions: {
            alertRegion: '#project-files-upload-alert',
            progressRegion: '#project-files-upload-progress',
            listRegion: '#project-files-upload-list'
        },

        initialize: function(parameters) {
            // our controller
            if (parameters && parameters.controller)
                this.controller = parameters.controller;

            this.showChildView('progressRegion', new FilesUploadProgressView({controller: this.controller, model: this.model}));
            this.showUploadFiles();
            if (this.controller.isUploading) this.addListeners();
        },

        events: {
            'click #add-upload-files': 'selectFiles',
            'click #delete-upload-file': 'deleteFile',
            'change #file-upload-from-computer-dialog': 'changeSelectedFiles',
            // start/cancel/done buttons are trapped by parent view
        },

        // show file dialog
        selectFiles: function(e) {
            e.preventDefault();
            $('#file-upload-from-computer-dialog').click();
        },

        showUploadFiles: function() {
            let show = false;
            if (this.controller.uploadFiles) {
                if (this.controller.uploadFiles.length > 0) {
                    this.showChildView('listRegion', new FilesUploadListView({controller: this.controller, collection: this.controller.uploadFiles}));
                    $('#start-upload-button').prop('disabled', false);
                    show = true;
                }
            }
            // enable/disable start upload button
            if (! show) {
                $('#start-upload-button').prop('disabled', true);
                // remove if no upload files
                if (this.getChildView('listRegion'))
                    this.getChildView('listRegion').destroy();
            } else {
                $('#start-upload-button').prop('disabled', false);
            }
        },

        clearAlert: function() {
            if (this.getChildView('alertRegion'))
                this.getChildView('alertRegion').destroy();
        },

        checkDuplicateFile: function(filename) {
            // check project files
            var fileListings = this.controller.getProjectFilesList()
            var isDuplicate = fileListings.checkForDuplicateFilename(File.cleanName(filename));
            if (isDuplicate) return isDuplicate;

            // check files in the upload list
            for (let i = 0; i < this.controller.uploadFiles.length; ++i) {
                let m = this.controller.uploadFiles.at(i);
                if (m.get('name') == filename) {
                    isDuplicate = true;
                    break;
                }
            }
            return isDuplicate;
        },

        changeSelectedFiles: function(e) {
            e.preventDefault();

            var selectedFiles = e.target.files;
            var alertMsg = null;

            for (var i = 0; i < selectedFiles.length; i++) {
                var file = selectedFiles[i];

                // check if duplicate
                let isDuplicate = this.checkDuplicateFile(file.name);
                if (isDuplicate) {
                    if (alertMsg) {
                        alertMsg += ', ' + file.name;
                    } else {
                        alertMsg = 'Duplicate files have been removed: ' + file.name;
                    }
                } else {
                    var stagedFile = new ProjectFile({
                        name: file.name,
                        length: file.size,
                        lastModified: file.lastModifiedDate,
                        projectUuid: this.model.get('uuid'),
                        fileReference: file
                    });
                    var guessType = File.guessTypeFromName(file.name);
                    stagedFile.set('type', guessType);
                    this.controller.uploadFiles.add(stagedFile);
                }
            }
            this.showUploadFiles();

            if (alertMsg) {
                let message = new Message({body: alertMsg});
                this.showChildView('alertRegion', new AlertView({model: message}));
            } else this.clearAlert();
        },

        deleteFile: function(e) {
            e.preventDefault();
            this.controller.uploadFiles.remove(e.target.name);
            // deleted last file
            if (this.controller.uploadFiles.length == 0) {
                this.showUploadFiles();
            }
        },

        // listen to upload progress
        addListeners: function() {
            var that = this;
            for (let i = 0; i < this.controller.uploadFiles.length; ++i) {
                let file = this.controller.uploadFiles.at(i);

                var that = this;
                this.listenTo(file, File.UPLOAD_PROGRESS, function(progressLength) {
                    console.log('FilesUploadView:', file.get('uploadProgress'), that.controller.progressLength);
                    // TODO: update display
                    that.getChildView('progressRegion').render();
                    //that.showChildView('progressRegion', new FilesUploadProgressView({controller: that.controller, model: that.model}));
                });
                this.listenTo(file, File.STAGE_PROGRESS, function(progressLength) {
                    console.log('FilesUploadView:', file.get('stageProgress'), that.controller.progressLength);
                    // TODO: update display
                    that.getChildView('progressRegion').render();
                    //that.showChildView('progressRegion', new FilesUploadProgressView({controller: that.controller, model: that.model}));
                });
            }
        },

        removeListeners: function() {
        },
    })
);

export default FilesUploadView;
