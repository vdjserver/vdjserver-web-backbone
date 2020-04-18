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
import template from '../../../templates/app/home.html';
import login_template from '../../../templates/app/login.html';
import modal_template from '../../../templates/util/modal-message-confirm.html';
import Handlebars from 'handlebars';
import MessageModel from 'message';

// custom region to handle a bootstrap modal view
var ModalRegion = Marionette.Region.extend({
    constructor: function() {
        Marionette.Region.prototype.constructor.apply(this, arguments);
    },
});

// the bootstrap modal view
var ModalMessageConfirm = Marionette.View.extend({
    template: Handlebars.compile(modal_template),
    region: '#modal'
});

var LoginView = Marionette.View.extend({
    template: Handlebars.compile(login_template)
});

// login window with modal region
export default Marionette.View.extend({
    template: Handlebars.compile(template),
    regions: {
        homeRegion: '#home',
        modalRegion: {
            el: '#modal',
            regionClass: ModalRegion
        }
  },

  initialize: function(parameters) {
    // we use a state variable to know what type of modal to display
    this.loginState = 'login';

    var view = new LoginView();
    this.showChildView('homeRegion', view);
  },

  events: {
      'click #home-login': 'login',
      'shown.bs.modal': 'onShownModal',
      'hidden.bs.modal': 'onHiddenModal',
  },

  onShownModal() {
    console.log('login: Show the modal');

    var that = this;

    // if login state then an authenticating modal view was just shown
    // go perform the login
    console.log(this.loginState);
    if (this.loginState == 'login') {
        var formData = {
          username: $('#username').val(),
          password: $('#password').val()
        };

        // login
        App.Agave.token().save(formData, {password: formData.password})
            .done(function() {
                that.loginState = 'pass';
                // wait until modal is hidden before routing
                $('#modal-message').modal('hide');
                console.log("login pass");
            })
            .fail(function(error) {
                // login failed so change state, hide the current modal
                console.log(error);
                that.loginState = 'fail';
                $('#modal-message').modal('hide');

                // clear token and form password
                App.Agave.token().clear();
                $('#password').val('');

                // prepare a new modal with the failure message
                var message = new MessageModel({
                    'header': 'Logging in',
                    'body':   '<p>Login failed...</p>'
                });
                var view = new ModalMessageConfirm({model: message});
                that.showChildView('modalRegion', view);
                $('#confirmation-button').removeClass('hidden');
                $('#modal-message').modal('show');

                console.log("login fail");
            });
    } else if (that.loginState == 'fail') {
      // if login failed, then we are showing the fail modal
    }
  },

  onHiddenModal() {
    console.log('login: Hide the modal');
    if (this.loginState == 'pass') {
        // login passed so route to the project list view
        App.router.navigate('/project', {trigger:true});
    } else if (this.loginState == 'fail') {
        console.log("show fail modal");
    }
  },

  login: function(e) {

      e.preventDefault();

      // when login button is pressed, display an authenticating modal message
      // we cannot perform the actual login here because the modal has not
      // been shown to the user yet, wait for onShowModal()
      this.loginState = 'login';
      var message = new MessageModel({
          'header': 'Logging in',
          'body':   '<p>Please wait while we authenticate you...</p>'
      });

      var view = new ModalMessageConfirm({model: message});
      this.showChildView('modalRegion', view);
      $('#modal-message').modal('show');

      console.log(message);

  }
});
