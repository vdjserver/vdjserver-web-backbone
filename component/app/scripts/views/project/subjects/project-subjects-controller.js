
'use strict';

//
// project-subjects-controller.js
// Controller for the project subjects page
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

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import Project from 'Scripts/models/agave-project';
import ProjectSubjectsView from 'Scripts/views/project/subjects/project-subjects-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
import Syphon from 'backbone.syphon';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';



// Project subjects controller
//
function ProjectSubjectsController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    // the project model
    this.model = this.controller.model;

    // default to summary views
    this.subjects_view_mode = 'summary';
    // edits
    this.has_edits = false;
    this.resetCollections();

    this.mainView = new ProjectSubjectsView({model: this.model, controller: this});
}

ProjectSubjectsController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectSubjectsView({model: this.model, controller: this});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectSubjectsView({model: this.model, controller: this});
        return this.mainView;
    },

    // access data held by upper level controller
    getCollections() {
        return this.controller.getCollections();
    },

    resetCollections() {
        // these collections should always point to the same models
        this.subjectList = this.controller.subjectList.getClonedCollection();
    },

    getSubjectsViewMode() {
        return this.subjects_view_mode;
    },

    toggleSubjectsViewMode() {
        switch(this.subjects_view_mode) {
            case 'summary': this.subjects_view_mode = 'detail'; break;
            case 'detail': this.subjects_view_mode = 'summary'; break;
        }
        this.showProjectSubjectsList();
    },

    // show project subjects
    showProjectSubjectsList() {
        this.mainView.showProjectSubjectsList(this.subjectList);
    },

    getSubjectsList() {
        return this.subjectList;
    },

    getOriginalSubjectsList() {
        return this.controller.subjectList;
    },

    flagSubjectsEdits: function() {
        // we keep flag just for file changes
        this.has_edits = true;
        // update header
        this.mainView.updateHeader();
    },

    revertSubjectsChanges: function() {
        // throw away changes by re-cloning
        this.has_edits = false;
        this.resetCollections();
        this.showProjectSubjectsList();
    },

    saveSubjectsChanges: function(e) {
        console.log('Clicked Save');

        // pull data out of form and put into model
//not yet working
//console.log(this);
//var d = Syphon.serialize(this);
var data = Syphon.serialize(this);
//var data = Syphon.serialize(this.getFormById("project-subject-form"));
        //var data = Syphon.serialize(this);
console.log("data1");
        this.cloned_model = this.model.deepClone();
console.log("data2");
        this.cloned_model.setAttributesFromData(data);
console.log("data3");

        // display a modal while the data is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Project Subjects',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Saving Project Subjects Changes</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');
    },

    updateData() {
        var data = Syphon.serialize(this);
        this.model.setAttributesFromData(data);
    },

    applySort(sort_by) {
        var subjs = this.getSubjectsList();
        subjs.sort_by = sort_by;
        subjs.sort();
    },

    // file changes are sent to server after the modal is shown
    onShownSaveModal(context) {
        console.log('save: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'save') {
            // the changed collection/models
            let SubjectsList = context.getSubjectsList();
console.log("subj: " + JSON.stringify(SubjectsList));
            let originalSubjectsList = context.getOriginalSubjectsList();
console.log("orig: " + JSON.stringify(originalSubjectsList));

            // see if any are deleted
            var deletedModels = originalSubjectsList.getMissingModels(SubjectsList);

            // Set up promises
            var promises = [];

            // deletions
            /*deletedModels.map(function(uuid) {
                var m = context.originalSubjectsList.get(uuid);
                promises[promises.length] = function() {
                    return m.destroy();
                }
            }); */

            // updates and new
            SubjectsList.map(function(uuid) {
                var m = SubjectsList.get(uuid);
                var saveChanges = async function(uuid, m) {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = originalSubjectsList.get(uuid);
                        if (!origModel) return Promise.resolve();
                        var changed = m.changedAttributes(origModel.attributes);
                        if (!changed) return Promise.resolve();
                    }

                    var msg = null;
                    await m.save().fail(function(error) { msg = error; });
                    if (msg) return Promise.reject(msg);

                    await m.syncMetadataPermissionsWithProjectPermissions(context.model.get('uuid')).catch(function(error) { msg = error; });
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
                        'header': 'Project Subjects',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Saving Project Subjects Changes failed!</div>',
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
            context.updateData();
            context.hasEdits = false;
            context.controller.replaceFilesList(context.SubjectsList);
console.log(context.SubjectsList);
            context.resetCollections();
            context.showProjectSubjectsList();
        } else if (context.modalState == 'fail') {
            // failure modal will automatically hide when user clicks OK
        }
    },

};
export default ProjectSubjectsController;

