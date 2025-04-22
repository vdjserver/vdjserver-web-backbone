
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

// Project group controller
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

    // groups view
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

    // show repertoire groups
    showProjectGroupsList() {
        console.log('pgc showProjectGroupsList (this.mainView): ', this.mainView);
        this.mainView.showProjectGroupsList(this.groupList);
        this.filterController.showFilter();
    },

    addGroup: function(e) {
        var clonedList = this.getGroupList();
        var newGroup = new RepertoireGroup({projectUuid: this.controller.model.get('uuid')});
        newGroup.view_mode = 'edit';
        clonedList.add(newGroup, {at:0});

        $('#repertoire_group_id_'+newGroup.get('uuid')).focus();
        this.flagGroupEdits();
    },

    deleteGroup: function(e, model) {
        e.preventDefault();
        var clonedList = this.getGroupList();
        clonedList.remove(model.id);
        this.flagGroupEdits();
    },

    duplicateGroup: function(e, model) {
        e.preventDefault();
        var clonedList = this.getGroupList();
        let i = clonedList.findIndex(model);
        let newGroup = model.deepDuplicate();
        //newSubject.set('uuid', newSubject.cid);
        newGroup.view_mode = 'edit';
        clonedList.add(newGroup, {at:i});
        $('#repertoire_group_name_'+newGroup.id).focus();
        this.flagGroupEdits();
    },

    getGroupsViewMode() {
        return this.groups_view_mode;
    },

    toggleGroupsViewMode() {
        switch(this.groups_view_mode) {
            case 'summary': this.groups_view_mode = 'detail'; break;
            case 'detail': this.groups_view_mode = 'summary'; break;
        }

        console.log('pgc toggleGroupsViewMode', this.groups_view_mode);

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

    revertGroupsChanges: function() {
        // throw away changes by re-cloning
        this.has_edits = false;
        this.resetCollections();
        this.showProjectGroupsList();
    },

    saveGroupsChanges: function(e) {
        console.log('pgc Clicked Save');

        // clear errors
        let hasErrors = false;
        $('.needs-validation').removeClass('was-validated');
        let fields = $('.is-invalid');
        for (let i = 0; i < fields.length; ++i) fields[i].setCustomValidity('');
        fields.removeClass('is-invalid');

        // model validation
        var minY = Number.MAX_VALUE;
        for (let i = 0; i < this.groupList.length; ++i) {
            // only validate models that have been changed or are new
            let model = this.groupList.at(i);
            let origModel = this.getOriginalGroupList().get(model.get('uuid'));
            var changed = null;
            if (origModel) {
                changed = model.changedAttributes(origModel.attributes);
            } else changed = true;

            if (changed) {
                let valid = model.isValid();
                if (!valid) {
                    hasErrors = true;
                    let form = document.getElementById("project-repertoire-group-form_" + model.get('uuid'));
                    var rect = form.getBoundingClientRect();
                    if (rect['y'] < minY) minY = rect['y'] + window.scrollY;
                    form = $(form);
                    for (let j = 0; j < model.validationError.length; ++j) {
                        let e = model.validationError[j];
                        let f = form.find('#' + e['field']);
                        if (f.length > 0) {
                            f[0].setCustomValidity(e['message']);
                            f.addClass('is-invalid');
                        }
                    }
                }
            }
        }

        // Validation across multiple models
        // invalidate any duplicate group names
        var duplicates = this.groupList.checkDuplicates();
        for (let i = 0; i < duplicates.length; ++i) {
            var model = duplicates.at(i);
            var field = document.getElementById("repertoire_group_name_" + model.get('uuid'));
            if (field) {
                field.setCustomValidity("ERROR");
                $(field).addClass('is-invalid');
                hasErrors = true;
                var rect = field.form.getBoundingClientRect();
                if (rect['y'] < minY)
                    minY = rect['y']+window.scrollY;
            }
        }

        // form validation
        $('.needs-validation').addClass('was-validated');
        var form = document.getElementsByClassName('needs-validation');
        for (let i = 0; i < form.length; ++i)
            if (form[i].checkValidity() === false) {
                hasErrors = true;
                var rect = form[i].getBoundingClientRect();
                if (rect['y'] < minY)
                    minY = rect['y']+window.scrollY;
            }

        // needed to refresh view for selectpicker (bootstrap-select) invalid message to appear
        $('.selectpicker').selectpicker("refresh");
        console.log('pgc Clicked Save - End Before hasErrors');

        // scroll to first form with error and abort save
        if (hasErrors) {
            $('html, body').animate({ scrollTop: minY - 100 }, 1000);
            return;
        }

        // display a modal while the data is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Repertoire Groups',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Saving Repertoire Group Changes</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');
    },

    // file changes are sent to server after the modal is shown
    onShownSaveModal: function(context) {
        console.log('save: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'save') {
            // the changed collection/models
            let GroupList = context.getGroupList();
            let originalGroupList = context.getOriginalGroupList();

            // see if any are deleted
            var deletedModels = originalGroupList.getMissingModels(GroupList);

            // Set up promises
            var promises = [];

            // deletions
            deletedModels.map(function(uuid) {
                var m = context.getOriginalGroupList.get(uuid);
                var deleteChanges = async function(uuid, m) {
                    var msg = null;
                    await m.destroy().fail(function(error) { msg = error; });
                    if (msg) return Promise.reject(msg);

                    return Promise.resolve();
                };
                promises.push(deleteChanges(uuid, m));
            });

            // updates and new
            GroupList.map(function(uuid) {
                var m = GroupList.get(uuid);
                var saveChanges = async function(uuid, m) {
                    // clear uuid for new entries so they get created
                    if (m.get('uuid') == m.cid) m.set('uuid', '');
                    else { // if existing entry, check if attributes changed
                        var origModel = context.getOriginalGroupList.get(uuid);
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
                        'header': 'Repertoire Groups',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Saving Repertoire Groups Changes failed!</div>',
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

    onHiddenSaveModal: function(context) {
        console.log('save: Hide the modal');
        if (context.modalState == 'pass') {
            // changes all saved
            context.has_edits = false;
            context.controller.replaceGroupsList(context.groupList);
            context.resetCollections();
            context.showProjectGroupsList();
        } else if (context.modalState == 'fail') {
            // failure modal will automatically hide when user clicks OK
        }
    },

};
export default ProjectGroupsController;

