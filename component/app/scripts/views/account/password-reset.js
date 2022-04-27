
'use strict';

//
// password-reset.js
// Reset password for account
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
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

import { Agave } from 'Scripts/backbone/backbone-agave';
import Marionette from 'backbone.marionette';
import Syphon from 'backbone.syphon';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import { ResetPasswordEmail, ResetPassword } from 'Scripts/models/agave-password-reset';

// user profile
import template from 'Templates/account/password-reset.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        console.log('reset password view');
        this.reset_code = null;
        if (parameters && parameters.reset_code) {
            this.reset_code = parameters.reset_code;
        }
        //this.model = new Backbone.Agave.Model.PasswordReset({uuid: opts.uuid});
    },

    events: {
        'submit #send-reset-form': 'sendResetPasswordEmail',
        'submit #reset-password-form': 'resetPassword'
    },

    templateContext: function() {
        return {
            reset_code: this.reset_code
        }
    },

    onAttach: function() {
        if (this.reset_code) $('#verify-username').focus();
    },

    displayFormErrors: function(formErrors) {

        // Clear out old errors
        //this.$el.find('.alert-danger').fadeOut(function() {
        $('.alert-danger').fadeOut(function() {
            this.remove();
        });

        $('.form-group').removeClass('has-error');

        // Display any new errors
        if (_.isArray(formErrors)) {

            for (var i = 0; i < formErrors.length; i++) {
                var message = formErrors[i].message;
                var type = formErrors[i].type;

                this.$el.find('.public-view').prepend($('<div class="alert alert-danger">').text(message).fadeIn());
                $('#' + type + '-container').addClass('has-error');
            }
        }
    },

    sendResetPasswordEmail: function(e) {
        console.log('sendResetPasswordEmail');
        e.preventDefault();

        var username = $('#reset-username').val();
        if (username.length <= 0) {
            $('#reset-username').focus();
            return;
        }

        this.model = new ResetPasswordEmail({
            username: username,
        });

        // display a modal while sending the email
        this.modalState = 'resend';
        var message = new MessageModel({
          'header': 'Send Reset Password Email',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Sending the email...</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');
    },

    resetPassword: function(e) {
        console.log('resetPassword');
        e.preventDefault();

        var resetCode = $('#reset-code').val();
        if (resetCode.length <= 0) {
            $('#reset-code').focus();
            return;
        }

        var username = $('#verify-username').val();
        var newPassword = $('#newPassword').val();
        var passwordCheck = $('#passwordCheck').val();

        this.model = new ResetPassword({username: username, reset_code: resetCode, new_password: newPassword, passwordCheck: passwordCheck});
        console.log(this.model);
        this.model.isValid();
        var errors = this.model.validationError;
        this.displayFormErrors(errors);

        if (_.isArray(errors)) {
            return false;
        }

        if (this.model.get('newPassword')) {
            this.model.set('newPassword', encodeURIComponent(this.model.get('newPassword')));
        }
        if (this.model.get('passwordCheck')) {
            this.model.set('passwordCheck', encodeURIComponent(this.model.get('passwordCheck')));
        }

        // display a modal while sending the request
        this.modalState = 'verify';
        var message = new MessageModel({
          'header': 'Reset Password',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Changing password...</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');
    },


    // request is sent to server after the modal is shown
    onShownModal(context) {
        // use modal state variable to decide
        if (context.modalState == 'resend') {
            // save the model
            console.log(context.model);
            context.model.save()
            .done(function() {
                context.modalState = 'pass_resend';
                $('#modal-message').modal('hide');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                console.log(error);
                var message;
                if (error.responseJSON.messageCode && error.responseJSON.messageCode == 'invalid username') {
                    message = new MessageModel({
                        'header': 'Send Reset Password Email',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Invalid username.</div>',
                        cancelText: 'Ok'
                    });
                } else {
                    message = new MessageModel({
                        'header': 'Send Reset Password Email',
                        'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error occurred.</div>',
                        cancelText: 'Ok',
                        serverError: error
                    });
                }

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }

        if (context.modalState == 'verify') {
            // save the model
            console.log(context.model);
            context.model.save()
            .done(function() {
                context.modalState = 'pass_verify';
                $('#modal-message').modal('hide');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                var message = new MessageModel({
                    'header': 'Reset Password',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error occurred while resetting password.</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenModal(context) {
        //console.log('create: Hide the modal');
        if (context.modalState == 'pass_resend') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Send Reset Password Email',
                'body': '<p>Reset Password email sent successfully. Please check your email.</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, null);
            $('#modal-message').modal('show');
        }

        if (context.modalState == 'pass_verify') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Reset Password',
                'body': '<p>Password reset successful!</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenSuccessModal(context) {
        // route to home login screen
        App.router.navigate('/', {trigger: true});
    },

});
