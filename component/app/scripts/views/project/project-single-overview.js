//
// project-single-overview.js
// Project overview, actions and user management
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
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
import Syphon from 'backbone.syphon';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import Project from 'Scripts/models/agave-project';
import LoadingView from 'Scripts/views/utilities/loading-view';
import LoadingUsersView from 'Scripts/views/utilities/loading-users-view'
import Permissions from 'Scripts/collections/agave-permissions';
import TenantUsers from 'Scripts/collections/agave-tenant-users';
import OntologySearchView from 'Scripts/views/utilities/ontology-search-view';


// Project overview buttons
import button_template from 'Templates/project/overview/project-single-buttons.html';
var ProjectButtonView = Marionette.View.extend({
    template: Handlebars.compile(button_template),

    initialize: function(parameters) {
        if (parameters && parameters.controller) {
            this.controller = parameters.controller;
        }
    },

    templateContext() {
        var edit_mode = this.controller.edit_mode;

        var archive_mode = false;
        if (this.model.get('name') == 'archive_project') {
            archive_mode = true;
            edit_mode = false;
        }
        var publish_mode = false;
        if (this.model.get('name') == 'public_project') {
            publish_mode = false;
        }

        return {
            // archive mode disables editing
            archive_mode: archive_mode,
            publish_mode: publish_mode,
            // if edit mode is true, then fields should be editable
            edit_mode: edit_mode,
        }
    },

    events: {
        'click #edit-project': function() {
            this.controller.showProject(true);
        },

        'click #save-edit-project': function(e) {
            this.controller.saveEditProject(e);
        },

        'click #revert-edit-changes': function() {
            this.controller.revertEditChanges();
            this.controller.showProject(false);
        },

        'click #archive-project': function() {
            this.controller.archiveProject();
        },

        'click #unarchive-project': function() {
            this.controller.unarchiveProject();
        },

        'click #publish-project': function() {
            this.controller.publishProject();
        },

        'click #unpublish-project': function() {
            this.controller.unpublishProject();
        },
    },

});

// Edit Project
import overview_template from 'Templates/project/overview/project-single-overview.html';
var ProjectSettingsView = Marionette.View.extend({
    template: Handlebars.compile(overview_template),

    // study type ontology dropdown
    regions: {
        studyTypeRegion: '#study-type-region'
    },

    initialize: function(parameters) {

        // show in read-only mode by default
        this.edit_mode = false;

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.edit_mode) this.edit_mode = parameters.edit_mode;
        }

        if (this.edit_mode) {
            // in edit mode add the study type dropdown
            var common = [
                { id: 'NCIT:C16084', label: 'Observational Study' },
                { id: 'NCIT:C93130', label: 'Animal Study'},
                { id: 'NCIT:C15273', label: 'Longitudinal Study'}];

            var button_label = 'Choose a Study Type';
            var value = this.model.get('value');
            if (value['study_type']) button_label = value['study_type']['label'];

            var view = new OntologySearchView({schema: 'Study', field: 'study_type',
                button_label: button_label, field_label: 'Study Type', common: common,
                context: this, selectFunction: this.selectStudyType});
            this.showChildView('studyTypeRegion', view);
        }
    },

    templateContext() {
        var value = this.model.get('value');

        var archive_mode = false;
        if (this.model.get('name') == 'archive_project') {
            archive_mode = true;
            this.edit_mode = false;
        }
        var publish_mode = false;
        if (this.model.get('name') == 'public_project') {
            publish_mode = false;
        }

        var study_type_id = null;
        var study_type_label = null;
        if (this.model.selected_study_type) {
            // user has a selected study type while editing
            study_type_id = this.model.selected_study_type['id'];
            study_type_label = this.model.selected_study_type['label'];
        } else {
            // otherwise use existing value in model
            if (value['study_type']) {
                study_type_id = value['study_type']['id'];
                study_type_label = value['study_type']['label'];
            }
        }

        // keyword badges
        var contains_ig = false;
        var contains_tr = false;
        var contains_single_cell = false;
        var contains_paired_chain = false;
        if (value.keywords_study) {
            if (value.keywords_study.indexOf("contains_ig") >= 0)
                contains_ig = true;
            if (value.keywords_study.indexOf("contains_tr") >= 0)
                contains_tr = true;
            if (value.keywords_study.indexOf("contains_single_cell") >= 0)
                contains_single_cell = true;
            if (value.keywords_study.indexOf("contains_paired_chain") >= 0)
                contains_paired_chain = true;
        }

        // custom 10x flag
        var is_10x_genomics = false;
        if (value.vdjserver_keywords)
            if (value.vdjserver_keywords.indexOf("is_10x_genomics") >= 0)
                is_10x_genomics = true;

        return {
            // archive mode disables editing
            archive_mode: archive_mode,
            publish_mode: publish_mode,
            // if edit mode is true, then fields should be editable
            edit_mode: this.edit_mode,

            // pass as object
            //schema: this.model.schema,

            // study type
            study_type_id: study_type_id,
            study_type_label: study_type_label,

            contains_ig: contains_ig,
            contains_tr: contains_tr,
            contains_single_cell: contains_single_cell,
            contains_paired_chain: contains_paired_chain,
            is_10x_genomics: is_10x_genomics,

            // label array
            keywords_enum: [ 'contains_ig', 'contains_tr', 'contains_single_cell', 'contains_paired_chain' ],
            keywords_array: [ 'Ig', 'TCR', 'Single Cell', 'Paired Chain'],

            // label object
            keywords_object: {
                'contains_single_cell': 'Single Cell',
                'contains_ig': 'Ig',
                'contains_paired_chain': 'Paired Chain',
                'contains_tr': 'TCR',
                'is_10x_genomics': '10x Genomics'
            }
        }
    },

    selectStudyType(context, value) {
        // Cannot update the model when the user picks a selection
        // because they may revert, we have to wait until they click save,
        // But we need to save the selection.
        console.log("study type selected", value);
        context.model.selected_study_type = value;
    },
});

// Single user in the project user collection
import single_user_template from 'Templates/project/users/project-user-detail.html';
var SingleUserView = Marionette.View.extend({
    template: Handlebars.compile(single_user_template),
    tagName: 'tr',
    className: 'user-row',

    initialize: function(parameters) {
        // our controller
        this.archive_mode = false;
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.archive_mode) this.archive_mode = parameters.archive_mode;
        }
    },

    templateContext() {
        var name = '';
        for (var i = 0; i < this.controller.allUsersList.length; ++i) {
            var model = this.controller.allUsersList.at(i);
            if (model.get('username') == this.model.get('username')) {
                name = model.get('full_name');
                break;
            }
        }

        return {
            archive_mode: this.archive_mode,
            name: name
        };
    }
});

// Get User List Template
import userList_template from 'Templates/project/users/project-user-list.html';
var ProjectUserListView = Marionette.CollectionView.extend({
    template: Handlebars.compile(userList_template),
    tagName: 'table',
    className: 'table manage-users',
    childView: SingleUserView,

    initialize: function(parameters) {
        // our controller
        this.archive_mode = false;
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.archive_mode) this.archive_mode = parameters.archive_mode;
        }
        this.childViewOptions = { controller: this.controller, archive_mode: this.archive_mode };
    },

    templateContext() {
        return {
            archive_mode: this.archive_mode
        };
    }

});

// Project Users
import users_template from 'Templates/project/users/project-users.html';
var ProjectUsersView = Marionette.View.extend({
    template: Handlebars.compile(users_template),

    regions: {
        usersRegion: '#user-list-region'
    },

    initialize: function(parameters) {

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }

        this.new_user = null;
        var archive_mode = false;
        if (this.model.get('name') == 'archive_project') {
            archive_mode = true;
        }

        var view = new ProjectUserListView({controller: this.controller, collection: this.controller.projectUserList, archive_mode: archive_mode});
        this.showChildView('usersRegion', view);
    },

    onAttach() {
        console.log('onAttach');

        // autocomplete for username
        var that = this;
        $('.userAutoSelect').autoComplete({
            minLength: 1,
            preventEnter: true,
            resolver: 'custom',
            events: {
                search: function(qry, callback) {
                    var results = [];
                    for (var i = 0; i < that.controller.allUsersList.length; ++i) {
                        var model = that.controller.allUsersList.at(i);
                        var username = model.get('username');
                        var current = that.controller.projectUserList.findWhere({username: username});
                        if (current) continue;
                        if (username.indexOf(qry) >= 0) {
                            results.push({value: i, text: username});
                        }
                    }
                    callback(results);
                }
            }
        });
    },

    events: {
        'click #add-project-user': function(e) {
            e.preventDefault();
            this.addProjectUser(this.new_user);
        },
        'click #delete-project-user': function(e) {
            e.preventDefault();
            this.deleteProjectUser(e.target.name);
        },
        'click #dropdownMenuButton': function(e) {
            console.log('dropdown clicked');
            e.preventDefault();
        },
        'autocomplete.select': function(evt, item) {
            if (item) this.new_user = item.text;
            else this.new_user = null;
            console.log('autocomplete.select', this.new_user);
            //evt.preventDefault();
        }
    },

    // add user flow
    // 1. Show modal to confirm
    // 2. If confirm, show success/failure modal for server request
    // 3. On success, do any cleanup
    addProjectUser(username) {
        console.log('addProjectUser', username);
        if (!username) return;

        this.add_message = new MessageModel({
          'header': 'Add User to Project',
          'body':   '<p>Add user ' + username + ' to project? This process may take some time depending upon the size of the project. You will receive an email when it is done.</p>',
          confirmText: 'Ok',
          cancelText: 'Cancel'
        });

        // the app controller manages the modal region
        this.modalState = 'add';
        this.new_user = username;
        var view = new ModalView({model: this.add_message});
        App.AppController.startModal(view, this, this.onShownAddUserModal, this.onHiddenAddUserModal);
        $('#modal-message').modal('show');


    },

    // add user modal is shown
    onShownAddUserModal(context) {
        console.log('add user: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function
    },

    onHiddenAddUserModal(context) {
        console.log('add user: Hide the modal');
        if (context.modalState == 'add') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.add_message.get('status') != 'confirm') return;

            // add user to project
            context.model.addUserToProject(context.new_user)
            .then(function() {
                context.modalState = 'pass';

                // prepare a new modal with the success message
                var message = new MessageModel({
                    'header': 'Add User to Project',
                    'body':   '<p>User ' + context.new_user + ' is being added to project! You will receive an email when it is done.',
                    cancelText: 'Ok'
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, context, null, context.onHiddenAddUserSuccessModal);
                $('#modal-message').modal('show');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Add User to Project',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while requesting user to be added to project!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenAddUserSuccessModal(context) {
        console.log('add user success: Hide the modal');
        context.new_user = null;
    },

    // delete user flow
    // 1. Show modal to confirm
    // 2. If confirm, show success/failure modal for server request
    // 3. On success, do any cleanup
    deleteProjectUser(username) {
        console.log('deleteProjectUser', username);
        if (!username) return;

        // make sure it's not the last user
        if (this.controller.projectUserList.length == 1) {
            // show modal with the failure message
            var message = new MessageModel({
                'header': 'Remove User from Project',
                'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Cannot delete the last user on the project!</div>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, null, null, null);
            $('#modal-message').modal('show');
            return;
        }

        this.add_message = null;
        if (username == App.Agave.token().get('username')) {
            // are we deleting ourselves
            this.add_message = new MessageModel({
                header: 'Remove User from Project',
                body:   '<div class="alert alert-danger"><i class="fa fa-times"></i> Delete yourself from project? You will lose all access!</div>',
                confirmText: 'Ok',
                cancelText: 'Cancel'
            });
        } else {
            // another user
            this.add_message = new MessageModel({
              'header': 'Remove User from Project',
              'body':   '<p>Remove user ' + username + ' from project? This process may take some time depending upon the size of the project. You will receive an email when it is done.</p>',
              confirmText: 'Ok',
              cancelText: 'Cancel'
            });
        }

        // the app controller manages the modal region
        this.modalState = 'delete';
        this.delete_user = username;
        var view = new ModalView({model: this.add_message});
        App.AppController.startModal(view, this, this.onShownDeleteUserModal, this.onHiddenDeleteUserModal);
        $('#modal-message').modal('show');

    },

    // delete user modal is shown
    onShownDeleteUserModal(context) {
        console.log('delete user: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function
    },

    onHiddenDeleteUserModal(context) {
        console.log('delete user: Hide the modal');
        if (context.modalState == 'delete') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.add_message.get('status') != 'confirm') return;

            // add user to project
            context.model.deleteUserFromProject(context.delete_user)
            .then(function() {
                context.modalState = 'pass';

                // prepare a new modal with the success message
                var message = new MessageModel({
                    'header': 'Remove User from Project',
                    'body':   '<p>User ' + context.delete_user + ' is being removed from project! You will receive an email when it is done.',
                    cancelText: 'Ok'
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, context, null, context.onHiddenDeleteUserSuccessModal);
                $('#modal-message').modal('show');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Remove User from Project',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while requesting user to be removed from project!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenDeleteUserSuccessModal(context) {
        console.log('delete user success: Hide the modal');

        // if we deleted ourselves, we can no longer access the project
        // so route to the project list page
        if (context.delete_user == App.Agave.token().get('username')) {
            App.router.navigate('/project', {'trigger': true});
        } else {
            // remove from project user list, view should automatically update
            var current = context.controller.projectUserList.findWhere({username: context.delete_user});
            context.controller.projectUserList.remove(current);
            context.delete_user = null;
        }
    },

});

// Project overview page
var ProjectOverView = Marionette.View.extend({
    template: Handlebars.compile('<div id="project-overview"></div><div id="project-users"></div>'),

    // one region to view/edit the project settings
    // one region to manage the project users
    regions: {
        overviewRegion: '#project-overview',
        usersRegion: '#project-users'
    },

    initialize: function(parameters) {

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
        }

        // show in read-only mode by default
        this.edit_mode = false;

        var view = new ProjectSettingsView({controller: this.controller, model: this.model});
        this.showChildView('overviewRegion', view);
        this.updateHeader();

        this.showChildView('usersRegion', new LoadingUsersView({}));

        var that = this;
        this.controller.projectUserListPromise.then(function() {
            that.updateUserList();
        });
    },

    updateHeader: function() {
        this.buttonsView = new ProjectButtonView({controller: this, model: this.model});
        App.AppController.navController.showButtonsBar(this.buttonsView);
    },

    updateUserList() {
        var view = new ProjectUsersView({controller: this.controller, model: this.model});
        this.showChildView('usersRegion', view);
    },

    showProject(edit_mode) {
        console.log("edit page view");
        this.edit_mode = edit_mode;
        var view = new ProjectSettingsView({controller: this.controller, model: this.model, edit_mode: edit_mode});
        this.showChildView('overviewRegion', view);
        this.updateHeader();
    },

    //
    // Edit project workflow:
    // 1. User clicks Edit Project Metadata button
    // 2. Form is displayed in edit mode
    // 3. If user clicks Revert button, then throw away changes and revert to read-only mode
    // 4. If user clicks Save button, then pull data out of form and start modal sequence with server.
    //
    saveEditProject(e) {
        console.log('saving edits');
        e.preventDefault();
        // actually save the edits

        // pull data out of form and put into model
        var data = Syphon.serialize(this);
        if (this.model.selected_study_type) {
            data['study_type'] = this.model.selected_study_type;
        }
        this.model.setAttributesFromData(data);
        console.log(this.model);
        console.log("this is the data that is submitted: " + data);

        // display a modal while the project is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Project Metadata',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Saving Project Metadata</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');

        console.log(message);
    },

    // project save is sent to server after the modal is shown
    onShownSaveModal(context) {
        console.log('save: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'save') {

            // save the model
            console.log(context.model);
            context.model.save()
            .then(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
                console.log("create pass");
                console.log(context.model);
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Project Metadata',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Saving Project Metadata failed!</div>',
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
            // create passed so flip back to read-only mode
            context.showProject(false);
        } else if (context.modalState == 'fail') {
            console.log("show fail modal");
            // failure modal will automatically hide when user clicks OK
        }
    },

    revertEditChanges() {
        console.log("changes cleared");
        if (this.model.selected_study_type) {
            delete this.model.selected_study_type;
        }
    },

    //
    // Archive project workflow:
    // 1. User click Archive Project button
    // 2. Modal is show with message and confirmation
    // 3. If cancel, then modal is closed
    // 4. If confirm, then start modal sequence with server.
    //
    archiveProject() {
        console.log("Archive Project button clicked");

        this.archive_message = new MessageModel({
            'header': 'Archive a Project',
            'body': '<div class="alert alert-danger">You are about to archive this project. Archiving a project will remove it from your list of projects but does not completely delete the project. Occasionally, VDJServer will purge archived projects which completely deletes them. You can enable archived projects to be displayed from your profile settings, and archived projects can be unarchived before they are purged.</div><div>Are you sure you want to archive this project?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'archive';
        var view = new ModalView({model: this.archive_message});
        App.AppController.startModal(view, this, this.onShownArchiveModal, this.onHiddenArchiveModal);
        //App.AppController.startModal(view, this, this.onShownArchiveModal, this.onHiddenArchiveModal);
        $('#modal-message').modal('show');
    },

    // project save is sent to server after the modal is shown
    onShownArchiveModal(context) {
        console.log('archive: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function when user confirms
    },

    onHiddenArchiveModal(context) {
        console.log('archive: Hide the modal');
        if (context.modalState == 'archive') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.archive_message.get('status') != 'confirm') return;

            // archive project
            context.model.archiveProject()
            .then(function() {
                context.modalState = 'pass';

                // prepare a new modal with the success message
                var message = new MessageModel({
                    'header': 'Archive Project',
                    'body':   'Project has been successfully archived!',
                    cancelText: 'Ok'
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, context, null, context.onHiddenArchiveSuccessModal);
                $('#modal-message').modal('show');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Archive Project',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while archiving project!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenArchiveSuccessModal(context) {
        console.log('archive success: Hide the modal');

        // this project is archived, reload project list
        App.AppController.reloadProjectList();
    },

    //
    // Unarchive project workflow:
    // 1. User click Unarchive Project button
    // 2. Modal is show with message and confirmation
    // 3. If cancel, then modal is closed
    // 4. If confirm, then start modal sequence with server.
    //
    unarchiveProject() {
        console.log("Unarchive Project button clicked");

        this.archive_message = new MessageModel({
            'header': 'Unarchive a Project',
            'body': '<div class="alert alert-danger">You are about to unarchive this project. It will restore the project in your list of projects and allow you to edit the project.</div><div>Are you sure you want to unarchive this project?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'unarchive';
        var view = new ModalView({model: this.archive_message});
        App.AppController.startModal(view, this, this.onShownUnarchiveModal, this.onHiddenUnarchiveModal);
        $('#modal-message').modal('show');
    },

    // project save is sent to server after the modal is shown
    onShownUnarchiveModal(context) {
        console.log('unarchive: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function when user confirms
    },

    onHiddenUnarchiveModal(context) {
        console.log('unarchive: Hide the modal');
        if (context.modalState == 'unarchive') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.archive_message.get('status') != 'confirm') return;

            // unarchive project
            context.model.unarchiveProject()
            .then(function() {
                context.modalState = 'pass';

                // prepare a new modal with the success message
                var message = new MessageModel({
                    'header': 'Unarchive Project',
                    'body':   'Project has been successfully unarchived!',
                    cancelText: 'Ok'
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, context, null, context.onHiddenUnarchiveSuccessModal);
                $('#modal-message').modal('show');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Unarchive Project',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while unarchiving project!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenUnarchiveSuccessModal(context) {
        console.log('unarchive success: Hide the modal');

        // this project is unarchived, reload project list
        App.AppController.reloadProjectList();
    },

    //
    // Publish project workflow:
    //
    publishProject(e) {
        console.log("Publish Project button clicked");

        this.publish_message = new MessageModel({
            'header': 'Publish a Project',
            'body': '<div>Are you sure you want to publish the project?</div>',
            'confirmText': 'Yes',
            'cancelText': 'No'
        });

        this.modalState = 'publish';
        var view = new ModalView({model: this.publish_message});
        App.AppController.startModal(view, this, this.onShownPublishModal, this.onHiddenPublishModal);
        $('#modal-message').modal('show');
    },

    // project publish is sent to server after the modal is shown
    onShownPublishModal(context) {
        console.log('publish: Show the modal');

        // nothing to be done here, server request
        // is done in hidden function when user confirms
    },

    onHiddenPublishModal(context) {
        console.log('publish: Hide the modal');
        if (context.modalState == 'publish') {

            // if user did not confirm, just return, modal is already dismissed
            if (context.publish_message.get('status') != 'confirm') return;

            // publish project
            context.model.publishProject()
            .then(function() {
                context.modalState = 'pass';

                // prepare a new modal with the success message
                var message = new MessageModel({
                    'header': 'Publish Project',
                    'body':   'Project has been successfully published!',
                    cancelText: 'Ok'
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, context, null, context.onHiddenPublishSuccessModal);
                $('#modal-message').modal('show');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Publish Project',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error while publishing project!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenPublishSuccessModal(context) {
        console.log('publish success: Hide the modal');
        this.publish_message = null;

        // this project is archived, reload project list
        App.AppController.reloadProjectList();
    },

});

export default ProjectOverView;
