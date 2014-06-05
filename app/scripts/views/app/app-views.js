define(['app', 'backbone.syphon'], function(App){
    'use strict';

    var AppViews = {};

    // layouts
    AppViews.HeaderLayout = Backbone.Layout.extend();
    AppViews.MainLayout   = Backbone.Layout.extend();

    // app views
    AppViews.Nav = Backbone.View.extend({
        template: 'nav',
        initialize: function() {
            //this.setView('.login-state', new AppViews.LoginState({model: this.model}));
            this.model.on('change', this.render, this);
        },
        serialize: function() {
            return {
                isLoggedIn: App.Agave.token().isActive(),
                account: this.model.toJSON()
            };
        }
    });

    AppViews.LoginState = Backbone.View.extend({
        template: 'logged-out',
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        beforeRender: function() {
            if (App.Agave.token.isActive()) {
                this.template = 'logged-in';
            } else {
                this.template = 'logged-out';
            }
        },
        serialize: function() {
            return this.model.toJSON();
        }
    });

    AppViews.Home = Backbone.View.extend({
        template: 'home',
        initialize: function() {

            //this.model.destroy();
            this.render;
        },
        serialize: function() {
            return {
                'username': this.model.get('username')
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

            console.log("formData is: " + JSON.stringify(formData));

            this.setupModalView();

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
                        .fail(function() {
                            $('#confirmation-button').removeClass('hidden');
                            $('.modal-body').html('');
                            $('.modal-body').prepend($('<div class="alert alert-danger">').text('Authentication failed. Please check your username and password').fadeIn());
                            $('#password').val('');
                        });
                });
            return false;
        }
    });

    App.Views.AppViews = AppViews;
    return AppViews;
});
