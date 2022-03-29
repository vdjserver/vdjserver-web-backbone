//
// public-views.js
// Home login page
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
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import ModalView from 'Scripts/views/utilities/modal-view';

// home window
import template from 'Templates/app/login.html';
export default Marionette.View.extend({
    template: Handlebars.compile(template),

    initialize: function(parameters) {
        // we use a state variable to know what type of modal to display
        this.loginState = 'login';
    },

    templateContext() {
        var maintenanceMessage = EnvironmentConfig.agave.maintenanceMessage;
        if ((EnvironmentConfig.agave.maintenance)
            && (maintenanceMessage.length == 0)) {
            maintenanceMessage = "VDJServer is currently undergoing maintenance."
        }

        return {
            maintenance: EnvironmentConfig.agave.maintenance,
            maintenanceMessage: maintenanceMessage
        }
    },

    events: {
        'click #home-login': 'login',
        'click #create-account': 'createAccount',
    },

    // handle create account button click
    createAccount: function(e) {
        e.preventDefault();

        App.router.navigate('account', {'trigger': true});
    },

    // handle login event
    login: function(e) {
        e.preventDefault();

        if ($('#username').val().length == 0) {
            $('#username').focus();
            return;
        }

        if ($('#password').val().length == 0) {
            $('#password').focus();
            return;
        }

        // when login button is pressed, display an authenticating modal message
        // we cannot perform the actual login here because the modal has not
        // been shown to the user yet, wait for onShowModal()
        this.loginState = 'login';
        var message = new MessageModel({
          'header': 'VDJServer Login',
          'body':   '<p>Please wait while we authenticate you...</p>'
        });

        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');

        console.log(message);

    },

    // send username and password to the server for authentication
    // after the modal has been shown
    onShownModal(context) {
        console.log('login: Show the modal');

        //var that = context;

        // if login state then an authenticating modal view was just shown
        // go perform the login
        console.log(context.loginState);
        if (context.loginState == 'login') {
            var formData = {
              username: $('#username').val(),
              password: $('#password').val()
            };

            // send login request to server
            App.Agave.token().save(formData, {password: formData.password})
                .then(function() {
                    context.loginState = 'pass';
                    // clear password
                    App.Agave.token().set('password','');

                    // load the user profile
                    return App.AppController.loadUserProfile();
                })
                .then(function() {
                    // wait until modal is hidden before routing
                    $('#modal-message').modal('hide');
                    console.log("login pass");
                })
                .fail(function(error) {
                    // login failed so change state, hide the current modal
                    console.log(error);
                    context.loginState = 'fail';
                    $('#modal-message').modal('hide');

                    // clear token and form password
                    App.Agave.token().clear();
                    $('#password').val('');

                    console.log("login fail");
                });
        } else if (this.loginState == 'fail') {
          // if login failed, then we are showing the fail modal
        }
    },

    // when modal is hidden either the login was successful or it failed
    onHiddenModal(context) {
        console.log('login: Hide the modal');
        if (context.loginState == 'pass') {
            // login passed so route to the project list view
            App.router.navigate('/project', {trigger:true});
        } else if (context.loginState == 'fail') {
            console.log("show fail modal");

            // prepare a new modal with the failure message
            var message = new MessageModel({
                'header': 'VDJServer Login',
                'body':   '<p>Login failed...</p>',
                cancelText: 'Ok'
            });

            // no need to handle show/hide for failure message
            // the failure message modal is automatically hidden when user clicks OK
            var view = new ModalView({model: message});
            App.AppController.startModal(view, null, null, null);
            $('#modal-message').modal('show');
        }
    },

});
