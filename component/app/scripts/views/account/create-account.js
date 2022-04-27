
'use strict';

//
// create-account.js
// Create new VDJServer account
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
import Syphon from 'backbone.syphon';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';
import { NewAccount } from 'Scripts/models/agave-account.js'
import Recaptcha from 'Scripts/models/recaptcha.js'

// user profile
import template from 'Templates/account/create-account-form.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        console.log('create account view');
        this.model = new NewAccount();

        console.log(EnvironmentConfig.recaptcha.disable);
    },

    events: {
        'click #create-new-account': 'createNewAccount',
    },

    templateContext: function() {
        var use_recaptcha = true;
        if (EnvironmentConfig.recaptcha.disable) use_recaptcha = false;

        return {
            use_recaptcha: use_recaptcha
        }
    },

    validateForm: function(formData) {

        this.model.set(formData);
        this.model.isValid();

        var recaptchaModel = null;
        if (EnvironmentConfig.recaptcha.disable) {
            console.log('WARNING: recaptcha is disabled, skipping validation.');
            this.model.set('g-recaptcha-response', 'skip_recaptcha');
            this.model.set('remoteip', 'x.x.x.x');
        } else {
            var recaptchaModel = new Recaptcha();
            recaptchaModel.set(formData);
            recaptchaModel.isValid();
        }

        var errors = [];

        if (Array.isArray(this.model.validationError)) {
            errors = errors.concat(this.model.validationError);
        }

        if (! EnvironmentConfig.recaptcha.disable) {
            if (Array.isArray(recaptchaModel.validationError)) {
                errors = errors.concat(recaptchaModel.validationError);
            }
        }

        return errors;
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
                var type    = formErrors[i].type;

                this.$el
                    .find('.public-view')
                    .prepend(
                        $('<div class="alert alert-danger">')
                            .text(message)
                            .fadeIn()
                    )
                ;
                $('#' + type + '-container').addClass('has-error');
            }

            $('html,body').animate({
                scrollTop: 0,
            });
        }
    },

    createNewAccount(e) {
        console.log('createNewAccount');
        e.preventDefault();

        // validate the form data
        var formData = Syphon.serialize(this);
        var formErrors = this.validateForm(formData);
        this.displayFormErrors(formErrors);

        if (_.isArray(formErrors) && formErrors.length > 0) {
            return false;
        }

        console.log(this.model);

        // display a modal while the project is being created
        this.modalState = 'create';
        var message = new MessageModel({
          'header': 'Create User Account',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Please wait while we create the account...</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');
    },

    // account creation request is sent to server after the modal is shown
    onShownModal(context) {
        // use modal state variable to decide
        if (context.modalState == 'create') {

            // save the model
            console.log(context.model);
            context.model.save()
            .done(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                var message = new MessageModel({
                    'header': 'Create User Account',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Account creation failed!</div>',
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
        if (context.modalState == 'pass') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Create User Account',
                'body': '<p>Account successfully created!</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenSuccessModal(context) {
        // route to the user verification screen
        App.router.navigate('/account/pending', {trigger: true});
    },

});
