
'use strict';

//
// change-profile-profile.js
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
import { PasswordChange } from 'Scripts/models/agave-password-change';
import Syphon from 'backbone.syphon';

// user profile
import template from 'Templates/account/change-password-form.html';
var ChangePasswordView = Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        this.model = new PasswordChange();
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
        changePasswordRegion: '#change-password-overview'
    },

    templateContext() {
        return {
            edit_mode: this.edit_mode,
        }
    },

    events: {
        'click #user-profile': function(e) {
            e.preventDefault();
            this.controller.showUserProfilePage(false);
        },
        'click #change-password': function(e) {
            e.preventDefault();
            this.controller.showChangePasswordPage(true);
        },
        'click #change-password-submit': function(e) {
            e.preventDefault();
            this.changePassword(e);
        },
    },

    changePassword(e) {
        var data = Syphon.serialize(this);
        this.model.set('password',data['password']);
        this.model.set('newPassword',data['newPassword']);

        // display a modal while the project is being saved
        this.modalState = 'save';
        var message = new MessageModel({
          'header': 'Change Password',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Updating Password</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownSaveModal, this.onHiddenSaveModal);
        $('#modal-message').modal('show');
    },

    updateData() {
        var data = Syphon.serialize(this);
        //this.model.setAttributesFromData(data);
    },

    onShownSaveModal(context) {
        //console.log('save: Show the modal');

        // use modal state variable to decide
        if (context.modalState == 'save') {

            // save the model
            context.model.callSave()
            .then(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Change Password',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Updating Password failed!</div>',
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
        if (context.modalState == 'pass') {
           App.AppController.showUserProfilePage(false);
        } else if (context.modalState == 'fail') {
        }
    },

    onShownArchiveModal(context) {
        //console.log('archive: Show the modal');
    },
});

export default ChangePasswordView;
