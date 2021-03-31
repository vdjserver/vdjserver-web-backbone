
'use strict';

//
// feedback-public.js
// Send public (no user login) feedback
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
import { PublicFeedback } from 'Scripts/models/agave-feedback.js'
import Recaptcha from 'Scripts/models/recaptcha.js'
import Radio from 'backbone.radio';

// for receiving server error info
const channel = Radio.channel('server-error');

// user profile
import template from 'Templates/feedback/feedback-public.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        console.log('public feedback view');
        this.model = new PublicFeedback();

        this.error_model = channel.request("server:error");
        console.log(this.error_model);
        if (this.error_model) {
            this.model.set('feedback', 'I got a server error.');
        }

        console.log(EnvironmentConfig.recaptcha.disable);
    },

    events: {
        'click #send-feedback': 'sendFeedback',
    },

    templateContext: function() {
        var use_recaptcha = true;
        if (EnvironmentConfig.recaptcha.disable) use_recaptcha = false;

        var server_error = false;
        var serverErrorBody = '';
        if (this.error_model) {
            server_error = this.error_model.get('serverError');
            serverErrorBody = this.error_model.get('serverErrorBody');
        }

        return {
            use_recaptcha: use_recaptcha,
            serverError: server_error,
            serverErrorBody: serverErrorBody
        }
    },

    validateForm: function(formData) {

        this.model.set(formData);
        this.model.isValid();

        var recaptchaModel = null;
        if (EnvironmentConfig.recaptcha.disable) {
            console.log('WARNING: recaptcha is disabled, skipping validation.');
            this.model.set('g-recaptcha-response', 'skip_recaptcha');
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

    sendFeedback(e) {
        console.log('sendFeedback');
        e.preventDefault();

        // validate the form data
        var formData = Syphon.serialize(this);
        var formErrors = this.validateForm(formData);
        this.displayFormErrors(formErrors);

        if (_.isArray(formErrors) && formErrors.length > 0) {
            return false;
        }

        if (this.error_model) {
            var server_error = this.error_model.get('serverError');
            if (server_error) {
                var feedback = this.model.get('feedback');
                feedback = feedback + '\n\n' + this.error_model.get('serverErrorBody');
                this.model.set('feedback', feedback);
            }
        }

        console.log(this.model);

        // display a modal while the request is sent to server
        this.modalState = 'create';
        var message = new MessageModel({
          'header': 'Send Feedback',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Please wait while we send feedback...</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');
    },

    // request is sent to server after the modal is shown
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
                    'header': 'Send Feedback',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Send feedback failed!</div>',
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
                'header': 'Send Feedback',
                'body': '<p>Feedback successfully sent!</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenSuccessModal(context) {
        // route to the user verification screen
        App.router.navigate('/', {trigger: true});
    },

});
