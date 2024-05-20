
'use strict';

//
// verify-account.js
// Manage verification and troubleshooting for accounts
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
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import { VerifyAccount, ResendVerificationEmail } from 'Scripts/models/agave-account.js'

// user profile
import template from 'Templates/account/verification-pending.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        console.log('verify account view');
        this.verify_code = null;
        if (parameters && parameters.verify_code)
            this.verify_code = parameters.verify_code;
    },

    events: {
        'submit #resend-verification-form': 'resendVerificationEmail',
        'submit #verify-account-form': 'verifyAccount',
    },

    templateContext: function() {
        return {
            verify_code: this.verify_code
        }
    },

    onAttach() {
        // if verification code, then trigger verify
        if (this.verify_code) this.performVerifyAccount(this.verify_code);
    },

    resendVerificationEmail: function(e) {
        e.preventDefault();

        var username = $('#verification-username').val();
        if (username.length <= 0) {
            $('#resend-email-form-group').addClass('has-error');
            $('#verification-username').focus();
            return;
        }

        this.model = new ResendVerificationEmail({
            username: username,
        });

        // display a modal while sending the email
        this.modalState = 'resend';
        var message = new MessageModel({
          'header': 'Resend Verification Email',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Resending the verification email...</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');
    },

    verifyAccount: function(e) {

        e.preventDefault();

        var verificationId = $('#verification-code').val();
        if (verificationId.length <= 0) {
            $('#verification-form-group').addClass('has-error');
            $('#verification-code').focus();
            return;
        }

        this.performVerifyAccount(verificationId);
    },

    performVerifyAccount: function(verificationId) {

        this.model = new VerifyAccount({
            verificationId: verificationId,
        });

        // display a modal while verifying account
        this.modalState = 'verify';
        var message = new MessageModel({
          'header': 'Verify Account',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Verifying your VDJServer account...</p>'
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

                var message = new MessageModel({
                    'header': 'Resend Verification Email',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error occurred while attempting to resend verification email.</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

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
                    'header': 'Verify Account',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Error occurred while verifying account.</div>',
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
                'header': 'Resend Verification Email',
                'body': '<p>Verification email sent successfully. Please check your email.</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, null);
            $('#modal-message').modal('show');
        }

        if (context.modalState == 'pass_verify') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Verify Account',
                'body': '<p>Account verification successful!</p>',
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
