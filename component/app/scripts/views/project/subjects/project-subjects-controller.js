
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
import FilterController from 'Scripts/views/utilities/filter-controller';
import SubjectImportModal from 'Scripts/views/project/project-import-subjects';

import { Subject } from 'Scripts/models/agave-metadata';
import { airr } from 'airr-js';


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

    // filters
    this.filteredSubjects = null;
    this.filterController = new FilterController(this, "airr_subject");
    this.filterController.constructValues(this.subjectList);
    this.filterController.showFilter();
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
        this.subjectList = this.controller.subjectList.getClonedCollection(); //create the cloned collection
        this.newSubjectList = [];
    },

    getSubjectsViewMode() {
        return this.subjects_view_mode;
    },

    toggleSubjectsViewMode() {
        switch(this.subjects_view_mode) {
            case 'summary': this.subjects_view_mode = 'detail'; break;
            case 'detail': this.subjects_view_mode = 'summary'; break;
        }
        var coll = this.getSubjectsList();
        for (let i = 0; i < coll.length; ++i) {
            let m = coll.at(i);
            if (m.view_mode != 'edit') m.view_mode = this.subjects_view_mode;
        }
        this.showProjectSubjectsList();
    },

    applyFilter(filters) {
        if (filters) {
            this.filteredSubjects = this.subjectList.filterCollection(filters);

            this.filteredSubjects.sort_by = this.subjectList.sort_by;
            this.filteredSubjects.sort();
        } else this.filteredSubjects = null;

        this.showProjectSubjectsList();
    },

    applySort: function(sort_by) {
        var subjs = this.getSubjectsList();
        subjs.sort_by = sort_by;
        subjs.sort();
        this.mainView.updateHeader();
    },

    // show project subjects
    showProjectSubjectsList() {
        if (this.filteredSubjects)
            this.mainView.showProjectSubjectsList(this.filteredSubjects);
        else
            this.mainView.showProjectSubjectsList(this.subjectList);
        this.filterController.showFilter();
    },

    getSubjectsList() {
        return this.subjectList;
    },

    getOriginalSubjectsList() {
        return this.controller.subjectList;
    },

    addSubject: function(e) {
      var clonedList = this.getSubjectsList();
      var newSubject = new Subject({projectUuid: this.controller.model.get('uuid')});
      newSubject.set('uuid', newSubject.cid);
      this.newSubjectList.push(newSubject.cid);
      newSubject.view_mode = 'edit';
      clonedList.add(newSubject, {at:0});
      $('#subject_id_'+newSubject.cid).focus();
      this.flagSubjectsEdits();
    },

    deleteSubject: function(e, model) {
        e.preventDefault();
        var clonedList = this.getSubjectsList();
        clonedList.remove(model.id);
        this.flagSubjectsEdits();
    },

    duplicateSubject: function(e, model) {
        e.preventDefault();
        var clonedList = this.getSubjectsList();
        let i = clonedList.findIndex(model);
        let newSubject = model.deepDuplicate();
        //newSubject.set('uuid', newSubject.cid);
        newSubject.view_mode = 'edit';
        clonedList.add(newSubject, {at:i});
        $('#subject_id_'+newSubject.cid).focus();
        this.flagSubjectsEdits();
    },

    duplicateDiagnosis: function(e, model) {
        e.preventDefault();

        let value = model.get('value');
        let index = e.target.name.split("_").slice(-1);

        let dupl = JSON.parse(JSON.stringify(value['diagnosis'][index]));
        value['diagnosis'].splice(index,0,dupl);
        model.set('value', value);
        model.view_mode = 'edit';
        this.flagSubjectsEdits();
        this.showProjectSubjectsList();
    },

    addDiagnosis: function(e, model) {
        e.preventDefault();

        let value = model.get('value');
        var diagnosisSchema = new airr.SchemaDefinition('Diagnosis');
        var blankEntry = diagnosisSchema.template();

        value['diagnosis'].unshift(blankEntry);
        model.set('value', value);
        model.view_mode = 'edit';
        this.flagSubjectsEdits();
        this.showProjectSubjectsList();

        // TODO: fix id
        $('#dropdownOntology0').focus();
    },

    deleteDiagnosis: function(e, model) {
        e.preventDefault();

        let value = model.get('value');
        let index = e.target.name.split("_").slice(-1);

        value['diagnosis'].splice(index, 1);
        model.set('value', value);
        this.flagSubjectsEdits();
        this.showProjectSubjectsList();
    },

    flagSubjectsEdits: function() {
        // we keep flag just for file changes
        this.has_edits = true;
        // update header
        this.mainView.updateHeader();
    },

    exportSubjectTable: function(e) {
        console.log('exportSubjectTable');
        this.model.exportTableToDisk('subject');
    },

    revertSubjectsChanges: function() {
        // throw away changes by re-cloning
        this.has_edits = false;
        this.resetCollections();
        this.showProjectSubjectsList();
    },

    saveSubjectsChanges: function(e) {
        console.log('Clicked Save');

        // clear errors
        let hasErrors = false;
        $('.needs-validation').removeClass('was-validated');
        let fields = $('.is-invalid');
        for (let i = 0; i < fields.length; ++i) fields[i].setCustomValidity('');
        fields.removeClass('is-invalid');

        // model validation
        var minY = Number.MAX_VALUE;
        for (let i = 0; i < this.subjectList.length; ++i) {
            // only validate models that have been changed or are new
            let model = this.subjectList.at(i);
            let origModel = this.getOriginalSubjectsList().get(model.get('uuid'));
            var changed = null;
            if (origModel) {
                changed = model.changedAttributes(origModel.attributes);
            } else changed = true;

            if (changed) {
                let valid = model.isValid();
                if (!valid) {
                    hasErrors = true;
                    let form = document.getElementById("project-subject-form_" + model.get('uuid'));
                    var rect = form.getBoundingClientRect();
                    if (rect['y'] < minY) minY = rect['y'] + window.scrollY;
                    form = $(form);
                    for (let j = 0; j < model.validationError.length; ++j) {
                        let e = model.validationError[j];
                        let f = form.find('#' + e['field']);
                        if (f) {
                            f[0].setCustomValidity(e['message']);
                            f.addClass('is-invalid');
                        }
                    }
                }
            }
        }

        // Validation across multiple models
        // invalidate any duplicate subject IDs
        var duplicates = this.subjectList.checkDuplicates();
        for (let i = 0; i < duplicates.length; ++i) {
            var model = duplicates.at(i);
            var field = document.getElementById("subject_id_" + model.get('uuid'));
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

        // scroll to first form with error and abort save
        if (hasErrors) {
            $('html, body').animate({ scrollTop: minY - 100 }, 1000);
            return;
        }

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

    // file changes are sent to server after the modal is shown
    onShownSaveModal: function(context) {
        console.log('save: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'save') {
            // the changed collection/models
            let SubjectsList = context.getSubjectsList();
            let originalSubjectsList = context.getOriginalSubjectsList();

            // see if any are deleted
            var deletedModels = originalSubjectsList.getMissingModels(SubjectsList);

            // Set up promises
            var promises = [];

            // deletions
            deletedModels.map(function(uuid) {
                var m = originalSubjectsList.get(uuid);
                var deleteChanges = async function(uuid, m) {
                    var msg = null;
                    await m.destroy().fail(function(error) { msg = error; });
                    if (msg) return Promise.reject(msg);

                    return Promise.resolve();
                };
                promises.push(deleteChanges(uuid, m));
            });

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

    onHiddenSaveModal: function(context) {
        console.log('save: Hide the modal');
        if (context.modalState == 'pass') {
            // changes all saved
            context.has_edits = false;
            context.controller.replaceSubjectsList(context.subjectList);
            context.resetCollections();
            context.showProjectSubjectsList();
        } else if (context.modalState == 'fail') {
            // failure modal will automatically hide when user clicks OK
        }
    },

    //
    // Series of modals for metadata import
    //

    importSubjectTable: function() {
        this.importView = new SubjectImportModal({model: this.model, controller: this});
        App.AppController.startModal(this.importView, this, this.onShownImportModal, this.onHiddenImportModal);
        $('#modal-message').modal('show');
    },

    onShownImportModal: function(context) {
        console.log('import: Show the modal');
    },

    onHiddenImportModal: function(context) {
        console.log('import: Hide the modal');
        console.log(context.importView.file);
        console.log(context.importView.operation);

        if (context.importView.file) {
            var message = new MessageModel({
              'header': 'Import Subject Table',
              'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Please wait while we import...</p>'
            });

            // the app controller manages the modal region
            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, context.onShownSubjectModal, context.onHiddenSubjectModal);
            $('#modal-message').modal('show');
        }
    },

    onShownSubjectModal(context) {
        // do the import
        context.model.importTableFromFile('subject', context.importView.file, context.importView.operation)
            .done(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                var message = new MessageModel({
                    'header': 'Import Subject Table',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Import failed!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
    },

    onHiddenSubjectModal(context) {
        //console.log('create: Hide the modal');
        if (context.modalState == 'pass') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Import Subject Table',
                'body': '<p>Successfully imported!</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenSubjectSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenSubjectSuccessModal(context) {
        // refresh project
        App.AppController.showProjectPage(context.model.get('uuid'), 'subject');
    },

};
export default ProjectSubjectsController;

