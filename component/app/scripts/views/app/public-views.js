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
      'hidden.bs.modal': 'onHiddenModal'
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

      App.Agave.token().save(formData, {password: formData.password})
        .done(function() {
            that.loginState = 'pass';
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
    //this.getRegion().empty();
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


/*
define([
    'app',
    'backbone.syphon',
], function(App) {

    'use strict';

    var Public = {};

    Public.Home = Backbone.View.extend({
        template: 'public/home',
        initialize: function() {

            //this.model.destroy();
            this.render;
        },
        serialize: function() {
            return {
                'username': this.model.get('username'),
                'maintenance': EnvironmentConfig.agave.maintenance,
                'maintenanceMessage': EnvironmentConfig.agave.maintenanceMessage
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Logging in',
                'body':   '<p>Please wait while we authenticate you...</p>'
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },
        events: {
            'click #home-login': 'login'
        },
        login: function(e) {

            e.preventDefault();

            this.$el.find('.alert-danger').fadeOut(function() {
                this.remove();
            });

            var formData = {
                username: $('#username').val(),
                password: $('#password').val()
            };

            //var formData = Backbone.Syphon.serialize(this);

            //this.setupModalView();

            var that = this;

            $('#modal-message')
                .modal('show')
                .on('shown.bs.modal', function() {

                    that.model
                        .save(formData, {password: formData.password})
                        .done(function() {
                            $('#modal-message')
                                .modal('hide')
                                .on('hidden.bs.modal', function() {

                                    App.router.navigate('/project', {
                                        trigger: true
                                    });

                                });
                        })
                        .fail(function(error) {

                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'App.Agave.token().save()');
                            telemetry.set('view', 'Public.Home');
                            telemetry.save();

                            if (error && error['status']) {

                                var httpCode = error['status'];

                                if (httpCode === 403) {
                                    App.router.navigate('/account/pending', {
                                        trigger: true
                                    });

                                    return;
                                }
                            }

                            App.Agave.token().clear();
                            $('#confirmation-button').removeClass('hidden');
                            $('.modal-body').html('');

                            $('.modal-body').prepend(
                                $('<div class="alert alert-danger">')
                                    .text('Authentication failed. Please check your username and password')
                                    .fadeIn()
                            );

                            $('#password').val('');
                        });
                });
            return false;
        },
    });

    App.Views.Public = Public;
    return Public;
});
*/
