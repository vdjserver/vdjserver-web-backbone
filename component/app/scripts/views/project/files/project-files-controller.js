
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
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import FilterController from 'Scripts/views/utilities/filter-controller';
import ProjectPairFileView from 'Scripts/views/project/files/project-files-pairing';

import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';
import { ProjectFileQuery } from 'Scripts/collections/agave-files';

// Project files controller
//
function ProjectFilesController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;
    // clone collection for holding edits
    this.hasEdits = false;
    this.uploadStarted = false;
    this.resetCollections();

    // file uploading
    this.cleanUpload();

    // file list view
    this.filteredFiles = null;
    this.mainView = new ProjectFilesView({controller: this, model: this.model});
    this.filterController = new FilterController(this, "vdjserver_file");
    this.filterController.constructValues(this.pairedList);
    this.filterController.showFilter();
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

    // collections
    resetCollections() {
        // these collections should always point to the same models
        this.fileList = this.controller.fileList.getClonedCollection();
        this.pairedList = this.fileList.getFilesWithCollapsedPairs()
    },
    getPairedList: function() {
        return this.pairedList;
    },
    getProjectFilesList: function() {
        return this.fileList;
    },
    getOriginalProjectFilesList: function() {
        return this.controller.fileList;
    },
    addFile: function(model) {
        // add to the upper-level controller
        this.controller.fileList.add(model);
        // add clone to our lists
        let m = model.deepClone();
        this.fileList.add(m);
        this.pairedList.add(m);
    },

    deleteFile: function(e, model) {
        e.preventDefault();
        this.fileList.remove(model);
        this.pairedList.remove(model);
        this.flagFileEdits();
    },

    applyFilter(filters) {
        if (filters) {
            this.filteredFiles = this.pairedList.filterCollection(filters);

            this.filteredFiles.sort_by = this.pairedList.sort_by;
            this.filteredFiles.sort();
        } else this.filteredFiles = null;

        this.showProjectFilesList();
    },

    // show project files
    showProjectFilesList() {
        if (this.filteredFiles)
            this.mainView.showProjectFilesList(this.filteredFiles);
        else
            this.mainView.showProjectFilesList(this.pairedList);
        this.filterController.showFilter();

        if (this.uploadFiles) {
            this.mainView.showUploadFiles(this.uploadFiles);
        }
    },

    //
    // save/revert file changes
    //
    flagFileEdits: function() {
        // we keep flag just for file changes
        this.hasEdits = true;
        // update header
        // we handle this a bit differently because we don't have an edit mode
        this.mainView.enableChangesButtons(this.hasEdits);
    },

    flagUploadStarted: function() {
        this.uploadStarted = true;
        this.mainView.enableUploadButton(this.uploadStarted);
    },

    hasFileEdits: function() {
        return this.hasEdits;
    },

    hasUploadStarted: function () {
        return this.uploadStarted;
    },

    saveFileChanges: function() {
        // display a modal while the data is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Project Files',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Saving Project File Changes</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');
    },

    // file changes are sent to server after the modal is shown
    onShownSaveModal(context) {
        console.log('save: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'save') {
            // the changed collection/models
            let fileList = context.getProjectFilesList();
            let originalFileList = context.getOriginalProjectFilesList();

            // see if any are deleted
            var deletedModels = originalFileList.getMissingModels(fileList);

            // Set up promises
            var promises = [];

            // deletions
            deletedModels.map(function(uuid) {
                var m = originalFileList.get(uuid);
                var deleteChanges = async function(uuid, m) {
                    var msg = null;
                    await m.destroy().fail(function(error) { msg = error; });
                    if (msg) return Promise.reject(msg);

                    return Promise.resolve();
                };
                promises.push(deleteChanges(uuid, m));
            });

            // updates and new
            fileList.map(function(uuid) {
                var m = fileList.get(uuid);
                var saveChanges = async function(uuid, m) {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = originalFileList.get(uuid);
                        if (!origModel) return Promise.resolve();
                        var changed = m.changedAttributes(origModel.attributes);
                        if (!changed) return Promise.resolve();
                    }

                    var msg = null;
                    await m.save().fail(function(error) { msg = error; });
                    if (msg) return Promise.reject(msg);

                    return Promise.resolve();
                };

                promises[promises.length] = saveChanges(uuid, m);
            });

            // Execute promises
            Promise.all(promises)
                .then(function() {
                    context.modalState = 'pass';
                    $('#modal-message').modal('hide');
                })
                .catch(function(error) {
                    console.log(error);

                    // save failed so show error modal
                    context.modalState = 'fail';
                    $('#modal-message').modal('hide');

                    // prepare a new modal with the failure message
                    var message = new MessageModel({
                        'header': 'Project Files',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Saving Project File Changes failed!</div>',
                        cancelText: 'Ok',
                        serverError: error
                    });

                    var view = new ModalView({model: message});
                    App.AppController.startModal(view, null, null, null);
                    $('#modal-message').modal('show');
                });
        } else if (context.modalState == 'fail') {
            // TODO: we should do something here?
            console.log('fail');
        }
    },

    onHiddenSaveModal(context) {
        console.log('save: Hide the modal');
        if (context.modalState == 'pass') {
            // changes all saved
            context.hasEdits = false;
            context.controller.replaceFilesList(context.fileList);
            context.resetCollections();
            context.showProjectFilesList();
        } else if (context.modalState == 'fail') {
            // failure modal will automatically hide when user clicks OK
        }
    },

    revertFileChanges: function() {
        // throw away changes by re-cloning
        this.hasEdits = false;
        this.resetCollections();
        this.showProjectFilesList();
    },

    applySort: function(sort_by) {
        var files = this.getPairedList();
        files.sort_by = sort_by;
        files.sort();
        this.mainView.updateHeader();
    },

    //
    // Read file pairing
    //
    showPairFiles: function(e) {
        // display pair files modal
        // the app controller manages the modal region
        var files = this.getProjectFilesList().getUnpairedCollection();
        this.pairFileView = new ProjectPairFileView({ controller: this.controller, files: files });
        App.AppController.startModal(this.pairFileView, this, null, this.onHiddenFilePairingModal);
        $('#modal-message').modal('show');
    },

    onHiddenFilePairingModal: function(context) {
        // were files paired?
        if (context.pairFileView.pair_results) {
            let body = '<p>' + context.pairFileView.pair_results.matched + ' files were matched.</p>';
            body += '<p>' + context.pairFileView.pair_results.paired + ' files were paired together.</p>';
            // prepare a new modal with the results
            var message = new MessageModel({
                'header': 'Pair Read Files Results',
                'body':   body,
                cancelText: 'Cancel',
                confirmText: 'Ok'
            });

            context.pairFileResultsView = new ModalView({model: message});
            App.AppController.startModal(context.pairFileResultsView, context, null, context.onHiddenFilePairingResultsModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenFilePairingResultsModal: function(context) {
        let m = context.pairFileResultsView.model;
        if (m.get('status') == 'confirm') {
            // apply the pairing, controller will update the display
            context.applyPairing(context.pairFileView.pair_results);
        }
    },

    applyPairing: function(pair_results) {
        if (!pair_results) return;
        if (pair_results['pairs'].length == 0) return;
        for (let i = 0; i < pair_results['pairs'].length; ++i) {
            let m = pair_results['pairs'][i];
            if (m['forward']) {
                let fm = m['forward'];
                let rm = m['reverse'];
                let fv = fm.get('value');
                let rv = rm.get('value');
                fv['pairedReadMetadataUuid'] = rm.get('uuid');
                fv['readDirection'] = 'F';
                fm.set('value', fv);
                rv['pairedReadMetadataUuid'] = fm.get('uuid');
                rv['readDirection'] = 'R';
                rm.set('value', rv);
                // only the forward in the pair list
                this.pairedList.remove(rm);
            }
            if (m['quality']) {
                let qm = m['quality'];
                let rm = m['read'];
                let qv = qm.get('value');
                let rv = rm.get('value');
                qv['readMetadataUuid'] = rm.get('uuid');
                qm.set('value', qv);
                rv['qualityScoreMetadataUuid'] = qm.get('uuid');
                rm.set('value', rv);
                // only the read in the pair list
                this.pairedList.remove(qm);
            }
        }
        // update display
        this.flagFileEdits();
        this.showProjectFilesList();
    },

    unpairFile: function(pair) {
        if (!pair) return;
        let m = this.fileList.get(pair);
        if (!m) return;
        let mv = m.get('value');
        if (mv['pairedReadMetadataUuid']) {
            let m2 = this.fileList.get(mv['pairedReadMetadataUuid']);
            if (!m2) return;
            let mv2 = m2.get('value');
            mv['pairedReadMetadataUuid'] = null;
            m.set('value', mv);
            mv2['pairedReadMetadataUuid'] = null;
            m2.set('value', mv2);
            this.pairedList.add(m2);
        }
        if (mv['qualityScoreMetadataUuid']) {
            let m2 = this.fileList.get(mv['qualityScoreMetadataUuid']);
            if (!m2) return;
            let mv2 = m2.get('value');
            mv['qualityScoreMetadataUuid'] = null;
            m.set('value', mv);
            mv2['readMetadataUuid'] = null;
            m2.set('value', mv2);
            this.pairedList.add(m2);
        }
        // update display
        this.flagFileEdits();
        this.showProjectFilesList();
    },

    //
    // File uploading
    //
    uploadFileFromComputer: function(e) {
        if (! this.uploadFiles) {
            this.uploadFiles = new Backbone.Collection();
        }
        this.flagUploadStarted();
        this.mainView.updateHeader();
        this.mainView.showUploadFiles();
    },

    cancelUpload: function(e) {
        // TODO: if upload is running then cancel
        //this.models.forEach(function(model) {
        //    model.trigger(ProjectFile.CANCEL_UPLOAD);
        //});

        this.cleanUpload();
        this.uploadStarted = false;
        this.mainView.updateHeader();
        this.mainView.clearUploadFiles();
    },

    doneUpload: function(e) {
        // cleanup after upload
        this.cleanUpload();
        // update UI
        this.uploadStarted = false;
        this.mainView.updateHeader();
        this.mainView.clearUploadFiles();
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
            var path = '//projects/' + file.get('projectUuid') + '/files/' + file.get('name');
            var stagedFile = new File({ path: path, relativeUrl: path});
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
                if (file.get('size') >= uploadFile.get('length')) {
                    uploadFile.set('uploadStatus', 'attach');
                    completedFiles.push(file);
                    //controller.completeFiles += 1;
                }
                uploadFile.set('stageProgress', file.get('size'));
                console.log(file.get('size'), uploadFile.get('length'));

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
                let query = new ProjectFileQuery(null, {projectUuid: uploadFile.get('projectUuid'), name: uploadFile.get('name')});
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
                    // add file to project file lists
                    controller.addFile(query.at(0));
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
        if (controller.uploadFiles) {
            for (let i = 0; i < controller.uploadFiles.length; ++i) {
                let file = controller.uploadFiles.at(i);
                let status = file.get('uploadStatus');
                if ((status != 'complete') && (status != 'error')) {
                    done = false;
                    break;
                }
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

