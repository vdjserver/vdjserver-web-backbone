define(['app'], function(App) {

    'use strict';

    var UtilViews = App.Views.Util;
    var Auth = {};

    Auth.Login = Backbone.View.extend({
        template: 'auth/login',
        initialize: function() {

            var that = this;
            this.model.destroy({
                success: function() {
                    console.log("destroyed token ok");
                    that.render();
                },
                error: function() {
                    console.log("destroyed token fail");
                    that.render();
                }
            });
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
                'header': 'Getting token',
                'body':   '<p>Please wait while we authenticate you...</p>'
            });

            var modal = new App.Views.Util.ModalMessage({
                model:    message
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },
        events: {
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            e.preventDefault();

            this.$el.find('.alert-danger').fadeOut(function() {
                this.remove();
            });

            var formData = Backbone.Syphon.serialize(this);

            if (formData.username && formData.password) {

                this.setupModalView();

                var that = this;

                $('#modal-message').on('shown.bs.modal', function() {

                    that.model.save(
                        formData,
                        {
                            password: formData.password,
                            success: function() {

                                $('#modal-message').on('hidden.bs.modal', function() {

                                    App.router.navigate('/project', {
                                        trigger: true
                                    });

                                });

                                $('#modal-message').modal('hide');
                            },
                            error: function() {

                                that.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('Authentication failed.  Please check your username and password.').fadeIn());
                                $('#password').val('');
                                $('#modal-message').modal('hide');
                            }
                        }
                    );
                });

                $('#modal-message').modal('show');
            }
            else {
                this.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('Username and Password are required.').fadeIn());
            }
            return false;
        }
    });

    App.Views.Auth = Auth;
    return Auth;
});