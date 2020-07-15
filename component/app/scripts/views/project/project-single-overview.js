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

// Edit Project
import overview_template from 'Templates/project/project-overview.html';
var ProjectSettingsView = Marionette.View.extend({
    template: Handlebars.compile(overview_template),

    initialize: function(parameters) {

        // show in read-only mode by default
        this.edit_mode = false;

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.edit_mode) this.edit_mode = parameters.edit_mode;
        }
    },

    templateContext() {
        return {
            // if edit mode is true, then fields should be editable
            edit_mode: this.edit_mode,

            // pass as object
            airr_schema: this.model.airr_schema,

            // // pass as string
            // airr_string: JSON.stringify(this.model.airr_schema, null, 2),

            // label array
            keywords_array: [ 'Ig', 'TCR', 'Single Cell', 'Paired Chain'],

            // label object
            keywords_object: {
                'contains_single_cell': 'Single Cell',
                'contains_ig': 'Ig',
                'contains_paired_chain': 'Paired Chain',
                'contains_tcr': 'TCR'
            }
        }
    }
});

// Single user in the project user collection
import single_user_template from 'Templates/project/users.html';
var SingleUserView = Marionette.View.extend({
    template: Handlebars.compile(single_user_template),
    tagName: 'tr',
    className: 'user-row'
});

// Get User List Template
import userList_template from 'Templates/project/user-list.html';
var ProjectUserListView = Marionette.CollectionView.extend({
    template: Handlebars.compile(userList_template),
    tagName: 'table',
    className: 'table manage-users',
    initialize: function(parameters) {
    this.childView = SingleUserView;
  }
});

// Project Users
import users_template from 'Templates/project/project-users.html';
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

        var view = new ProjectUserListView({controller: this.controller, collection: this.controller.projectUserList});
        this.showChildView('usersRegion', view);
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

        var view = new ProjectSettingsView({controller: this.controller, model: this.model});
        this.showChildView('overviewRegion', view);

        this.showChildView('usersRegion', new LoadingUsersView({}));

        var that = this;
        this.controller.projectUserListPromise.then(function() {
            that.updateUserList();
        });
    },

    events: {
        //
        // Overview page specific events
        //

        'click #edit-project': function() {
            this.showProject(true);
        },

        'click #playground': function() {
            this.showPlayground();
        },

        'click #save-edit-project': function(e) {
            this.saveEditProject(e);
        },

        'click #revert-edit-changes': function() {
            this.revertEditChanges();
            this.showProject(false);
        },

        'click #archive-project': function() {
            this.archiveProject();
        },

        'click #archive-project-yes': function() {
            this.archiveProjectYes();
        }
    },

    updateUserList() {
        var view = new ProjectUsersView({controller: this.controller, model: this.model});
        this.showChildView('usersRegion', view);
    },

    showProject(edit_mode) {
        console.log("edit page view");
        var view = new ProjectSettingsView({controller: this.controller, model: this.model, edit_mode: edit_mode});
        this.showChildView('overviewRegion', view);
    },

    saveEditProject(e) {
        console.log('saving edits');
        e.preventDefault();
        // actually save the edits

        // pull data out of form and put into model
        var data = Syphon.serialize(this);
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
        console.log('create: Show the modal');

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
                    'header': 'Project Creation',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Project creation failed!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        } else if (context.modalState == 'fail') {
        }
    },

    onHiddenSaveModal(context) {
        console.log('create: Hide the modal');
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
    },

    archiveProject() {
        console.log("Archive Project button clicked");
    },

    archiveProjectYes() {
        console.log("Archive Project Confirmed: Yes");
        // e.preventDefault();

        // this.set('name', 'deletedProject');
        // return this.save();
    }
});

export default ProjectOverView;
