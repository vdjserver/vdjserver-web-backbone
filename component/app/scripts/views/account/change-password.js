
'use strict';

//
// change-password.js
// Change password view
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020-2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Ryan Kennedy
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

            // form data into model
            var data = Syphon.serialize(this);
            this.model.set('password',data['password']);
            this.model.set('newPassword',data['newPassword']);
            this.model.set('passwordCheck',data['passwordCheck']);

            // save if valid other display errors
            if (this.model.isValid()) this.changePassword();
            else this.handleValidationErrors();
        },
    },

    handleValidationErrors: function() {
        var errors = this.model.validationError;
        console.log(errors);

        // reset valid/invalid display
        var password = document.getElementById("password");
        password.classList.remove('is-valid');
        password.classList.remove('is-invalid');
        var newPassword = document.getElementById("newPassword");
        newPassword.classList.remove('is-valid');
        newPassword.classList.remove('is-invalid');
        var passwordCheck = document.getElementById("passwordCheck");
        passwordCheck.classList.remove('is-valid');
        passwordCheck.classList.remove('is-invalid');

        if (!errors) return;
        for (let i = 0; i < errors.length; ++i) {
            // TODO: set valid/invalid class on UI element
            switch (errors[i]['type']) {
                case 'password': password.classList.add('is-invalid'); break;
                case 'newPassword': newPassword.classList.add('is-invalid'); break;
                case 'passwordCheck': passwordCheck.classList.add('is-invalid'); break;
                default:
                    console.log('unhandled error type:', errors[i]['type']);
            }
        }
        // if not invalid then set valid style
        if (!password.classList.contains('is-invalid')) password.classList.add('is-valid');
        if (!newPassword.classList.contains('is-invalid')) newPassword.classList.add('is-valid');
        if (!passwordCheck.classList.contains('is-invalid')) passwordCheck.classList.add('is-valid');
    },


/*
  checkPasswords(event) {
    var password = document.getElementById("password");
    var newPassword = document.getElementById("newPassword");
    var passwordCheck = document.getElementById("passwordCheck");
    var sub = document.getElementById("change-password-submit");

    if(newPassword.validity.tooShort) {
      console.log("New password is too short.");
      newPassword.classList.add('is-invalid');
    } else if(newPassword.validity.valueMissing) {
      console.log("New password is missing.");
      newPassword.classList.add('is-invalid');
    } else {
      newPassword.classList.remove('is-invalid');
    }

    if(newPassword.value!=passwordCheck.value) {
      console.log("Passwords do not match.");
      passwordCheck.classList.add('is-invalid');
    } else if(passwordCheck.validity.tooShort) {
      console.log("New password check is too short.");
      passwordCheck.classList.add('is-invalid');
    } else if(passwordCheck.validity.valueMissing) {
      console.log("New password check is missing.");
      passwordCheck.classList.add('is-invalid');
    } else {
      passwordCheck.classList.remove('is-invalid');
    }

    if(newPassword.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    if(passwordCheck.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    //form is ok if both pass
    if(!newPassword.classList.contains("is-invalid") && !passwordCheck.classList.contains("is-invalid")) {
      form.classList.add("was-validated");
      console.log("Validation passed.");
      return true;
    } else {
      console.log("Validation failed.");
      return false;
    }
  }, */
//setFocus on errors?

    changePassword: function() {
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
