
'use strict';

//
// project-files-controller.js
// Controller for the project files page
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

import Project from 'Scripts/models/agave-project';
import ProjectFilesView from 'Scripts/views/project/files/project-files';
import LoadingView from 'Scripts/views/utilities/loading-view';

import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';
import { ProjectFileQuery } from 'Scripts/collections/agave-files';

// Project files controller
//
function ProjectFilesController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // file uploading
    this.cleanUpload();

    // file list view
    this.mainView = new ProjectFilesView({controller: this, model: this.model});
}

ProjectFilesController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectFilesView({controller: this, model: this.model});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectFilesView({controller: this, model: this.model});
        return this.mainView;
    },

    // access data held by upper level controller
    getProjectFilesList() {
        return this.controller.fileList;
    },

    // show project files
    showProjectFilesList() {
        this.mainView.showProjectFilesList(this.getProjectFilesList());

        if (this.uploadFiles) {
            this.mainView.showUploadFiles(this.uploadFiles);
        }
    },

    flagProjectEdit: function(flag) {
        // pass up the controller chain
        this.controller.flagProjectEdit(flag);
        // update header
        this.mainView.updateHeader();
    },

    hasProjectEdits: function() {
        return this.controller.hasProjectEdits();
    },

    applySort(sort_by) {
        var files = this.getProjectFilesList();
        files.sort_by = sort_by;
        files.sort();
        /*
        if (this.filteredStudies) {
            this.filteredStudies.sort_by = sort_by;
            this.filteredStudies.sort();
            this.projectView.updateSummary(this.filteredStudies);
        } else {
            this.projectView.updateSummary(this.studies);
        } */
    },

    // set all upload variables to initial state
    cleanUpload: function() {
        this.uploadFiles = null;
        this.isUploading = false;
        this.uploadFinished = false;
        this.completeFiles = 0;
        this.progressLength = 0;
        this.totalProgressLength = 0;
        // step 2
        this.stageFiles = null;
        this.stagingTimer = null;
        this.isCheckingStaging = false;
        // step 3
        this.attachFiles = null;
        this.attachTimer = null;
        this.isCheckingAttachment = false;
    },

    // perform file upload, takes 3 steps
    // all three steps are asychronous
    // 1. upload file to Tapis Files API.
    // 2. Tapis API stages (copies) the uploaded file to the destination storage system.
    // 3. VDJServer API attaches file to project by creating metadata entry and setting permissions.
    //
    // this starts the first step, upload file to Tapis Files API
    // the upload HTTP request sends periodic events, which are listened to for UI progress updates
    // UI updates also happen when the file model is updated
    // though not completely precise, we assume the upload is complete when length >= file size
    // creates stage entry for second step
    startUpload: async function() {
        if (! this.uploadFiles) return;
        if (this.uploadFiles.length == 0) return;

        var that = this;

        // two parts to uploading, the actual uploading and the backend staging, so double the length
        this.isUploading = true;
        this.completeFiles = 0;
        this.progressLength = 0;
        this.totalProgressLength = this.uploadFiles.reduce(function(lengthSum, model) {
                return lengthSum +  2 * model.get('length');
            }, 0);

        // set progress status
        for (let i = 0; i < this.uploadFiles.length; ++i) {
            let file = this.uploadFiles.at(i);
            file.set('uploadStatus', 'queue');
            file.set('uploadProgress', 0);
            file.set('stageProgress', 0);
            console.log(file);
            // each file listens to its progress
            file.listenTo(file, File.UPLOAD_PROGRESS, function(progressLength) {
                // Update model progress
                // these will trigger change events for the file view
                if (progressLength >= file.get('length'))
                    file.set('uploadStatus', 'stage');
                else
                    file.set('uploadStatus', 'upload');
                file.set('uploadProgress', progressLength);
                //console.log(progressLength, file.get('length'));

                // Sum current model progress placeholders
                that.progressLength = 0;
                that.uploadFiles.forEach(function(m) {
                    that.progressLength += m.get('uploadProgress');
                    that.progressLength += m.get('stageProgress');
                });
                //console.log(that.progressLength);
            });
        }

        // update view to show upload start
        this.mainView.showUploadFiles(this.uploadFiles);

        // create the staging queue (step 2) on a timer
        this.stageFiles = new Backbone.Collection();
        this.stagingTimer = setInterval(this.checkFileStaging, 5000, this);

        // create the attach queue (step 3) on a timer
        this.attachFiles = new Backbone.Collection();
        this.attachTimer = setInterval(this.checkFileAttachment, 5000, this);

        // upload each file sequentially
        for (let i = 0; i < this.uploadFiles.length; ++i) {
            let file = this.uploadFiles.at(i);

            // upload the file
            await file.save()
                .fail(function(error) {
                    console.log(error);
                });

            console.log('file is uploaded');

            // create stage entry for second step
            var stagedFile = new File({ relativeUrl: '//projects/' + file.get('projectUuid') + '/files/' + file.get('name') });
            stagedFile['uploadFile'] = file;
            this.stageFiles.add(stagedFile);
        }

    },

    // second step of file upload
    // 2. Tapis API stages (copies) the uploaded file to the destination storage system.
    //
    // fetches the file from the Files API and checks the length
    // trigger events and model updates will update UI with progress
    // after staged, submit request to attach file to project (metadata/permissions)
    // create attach entry for third step
    //
    // "this" is not valid as we are in a setInterval function so passed as parameter
    checkFileStaging: async function(controller) {
        // simple flag to prevent timer refire
        if (controller.isCheckingStaging) return;
        controller.isCheckingStaging = true;
        console.log('check file staging');

        if (controller.stageFiles.length != 0) {
            let completedFiles = [];
            for (let i = 0; i < controller.stageFiles.length; ++i) {
                let file = controller.stageFiles.at(i);
                await file.fetch()
                    .fail(function(error) {
                        console.log(error);
                    });
                console.log(file);

                // staging complete when its the same size as the uploaded file
                let uploadFile = file['uploadFile'];
                if (file.get('length') >= uploadFile.get('length')) {
                    uploadFile.set('uploadStatus', 'attach');
                    completedFiles.push(file);
                    //controller.completeFiles += 1;
                }
                uploadFile.set('stageProgress', file.get('length'));
                console.log(file.get('length'), uploadFile.get('length'));

                // Sum current model progress placeholders
                controller.progressLength = 0;
                controller.uploadFiles.forEach(function(m) {
                    controller.progressLength += m.get('uploadProgress');
                    controller.progressLength += m.get('stageProgress');
                });
                console.log(controller.progressLength);

                // trigger update
                uploadFile.trigger(File.STAGE_PROGRESS, 0);
            }

            // for completed files, send API request to attach to project
            for (let i = 0; i < completedFiles.length; ++i) {
                let file = completedFiles[i];
                let uploadFile = file['uploadFile'];
                let good = true;
                let results = await uploadFile.notifyApiUploadComplete()
                    .catch(function(error) {
                        console.log(error);
                        uploadFile.set('uploadStatus', 'error');
                        good = false;
                        //Promise.resolve();
                    });
                if (good) controller.attachFiles.add(file);
            }

            // Remove completed files
            if (completedFiles.length > 0) controller.stageFiles.remove(completedFiles);
        }

        controller.isCheckingStaging = false;
    },

    // third step of file upload
    // 3. VDJServer API attaches file to project by creating metadata entry and setting permissions.
    //
    // The API request was sent during the second step
    // here we fetch the metadata entry, if it exists then we assume file attachment is done
    // though not technically correct as permissions might still be in the process of being set
    // however we expect that to finish quickly before the user would notice
    //
    // "this" is not valid as we are in a setInterval function so passed as parameter
    checkFileAttachment: async function(controller) {
        // simple flag to prevent timer refire
        if (controller.isCheckingAttachment) return;
        controller.isCheckingAttachment = true;
        console.log('check file attachment');

        if (controller.attachFiles.length != 0) {
            let completedFiles = [];
            for (let i = 0; i < controller.attachFiles.length; ++i) {
                let file = controller.attachFiles.at(i);
                let uploadFile = file['uploadFile'];
                let query = new ProjectFileQuery({projectUuid: uploadFile.get('projectUuid'), name: uploadFile.get('name')});
                await query.fetch()
                    .fail(function(error) {
                        console.log(error);
                    });
                console.log(query);

                if (query.length == 0) continue;

                // is attachment complete
                if (query.length == 1) {
                    uploadFile.set('uploadStatus', 'complete');
                    completedFiles.push(file);
                    controller.completeFiles += 1;
                    // add file to project file list
                    let collections = controller.controller.getCollections();
                    collections['fileList'].add(query.at(0));
                } else {
                    // TODO: how? what to do?
                    console.log('error: returned more than one object');
                }

                // trigger update
                uploadFile.trigger(File.STAGE_PROGRESS, 0);
            }

            // Remove completed files
            if (completedFiles.length > 0) controller.attachFiles.remove(completedFiles);
        }

        // TODO: check if all files are complete
        let done = true;
        for (let i = 0; i < controller.uploadFiles.length; ++i) {
            let file = controller.uploadFiles.at(i);
            let status = file.get('uploadStatus');
            if ((status != 'complete') && (status != 'error')) {
                done = false;
                break;
            }
        }

        // all done, so turn off timers
        // update UI
        if (done) {
            clearInterval(controller.stagingTimer);
            clearInterval(controller.attachTimer);
            controller.uploadFinished = true;
            controller.mainView.showUploadFiles(controller.uploadFiles);
        }

        controller.isCheckingAttachment = false;
    },

};
export default ProjectFilesController;

