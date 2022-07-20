
'use strict';

//
// account-profile.js
// User profile view
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

import { Agave } from 'Scripts/backbone/backbone-agave';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import { UserProfile } from 'Scripts/models/agave-tenant-user';
import Syphon from 'backbone.syphon';

// user profile
import template from 'Templates/account/profile-form.html';
//export default Marionette.View.extend({
var ProfileView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        console.log(this.model);
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.edit_mode) {
                this.edit_mode = parameters.edit_mode;
            } else {
                this.edit_mode = false;
            }
        }
    },

    regions: {
        profileRegion: '#profile-overview'
    },

    templateContext() {
        return {
            edit_mode: this.edit_mode,
        }
    },

    events: {
        'click #edit-profile': function(e) {
            e.preventDefault();
            this.controller.showUserProfilePage(true);
        },
        'click #revert-profile': function(e) {
            e.preventDefault();
            this.controller.showUserProfilePage(false);
        },
        'click #save-profile': function(e) {
            e.preventDefault();
            this.saveEditProfile(e);
        },
    },

    saveEditProfile(e) {
        //console.log('Clicked Save');

        // pull data out of form and put into model
        var data = Syphon.serialize(this);
        this.cloned_model = this.model.deepClone();
        this.cloned_model.setAttributesFromData(data);
        //console.log(this.model);
        //console.log("this is the data that is submitted: " + data);

        // display a modal while the project is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'User Profile',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Saving User Profile</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');

        //console.log(message);
    },

    updateData() {
        var data = Syphon.serialize(this);
        this.model.setAttributesFromData(data);
    },

    onShownSaveModal(context) {
        //console.log('save: Show the modal');

        // use modal state variable to decide
        console.log(context.modalState);
        if (context.modalState == 'save') {

            // save the model
            console.log(context.model);
            //context.cloned_model.url = '/bogus'; //to test 'fail'
            context.cloned_model.save()
            .then(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
                //console.log("create pass");
                //console.log(context.model);
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'User Profile',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Saving User Profile failed!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        } else if (context.modalState == 'fail') {
            // TODO: we should do something here?
            //console.log('fail');
        }
    },

    onHiddenSaveModal(context) {
        //console.log('save: Hide the modal');
        if (context.modalState == 'pass') {
            // create passed so flip back to read-only mode
           context.updateData();
           App.AppController.showUserProfilePage(false);
        } else if (context.modalState == 'fail') {
            //console.log("show fail modal");
            // failure modal will automatically hide when user clicks OK
        }
    },

    onShownArchiveModal(context) {
        //console.log('archive: Show the modal');
    },
});

export default ProfileView;
