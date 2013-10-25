define(['app'], function(App) {

    'use strict';

    var UtilViews = App.Views.Util;
    var AgaveAuth = {};

    AgaveAuth.NewTokenForm = Backbone.View.extend({
        template: 'auth/new-token-form',
        serialize: function() {
            return {
                'username': this.model.get('username')
            };
        },
        events: {
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            console.log("submitting auth form");
            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);

            if (formData.username && formData.password) {

                var message = new App.Models.MessageModel({
                    'header': 'Getting token',
                    'body':   '<p>Please wait while we authenticate you...</p>'
                });

                var modal = new UtilViews.ModalMessage({
                    model:    message,
                    backdrop: 'static',
                    keyboard: false
                });

                var that = this;

                console.log('about to do model save append');

                $('<div class="login-modal">').appendTo(this.el);
                modal.$el.on('shown', function() {
                    that.$el.find('.alert-error').remove();

                    that.model.save(
                        formData,
                        {
                            password: formData.password,
                            success: function() {
                                console.log('save success');
                                message.set('body', message.get('body') + '<p>Success!</p>');
                                modal.close();
                                App.router.navigate('/', {
                                    trigger: true
                                });
                            },
                            //error: function(model, xhr, options) {
                            error: function() {
                                console.log('save error');
                                that.$el.prepend($('<div class="alert alert-error">').text('Authentication failed.  Please check your username and password.').fadeIn());
                                $('#password').val('');
                                modal.close();
                            }
                        }
                    );
                    console.log('after model save');
                });
                modal.$el.on('hidden', function() {
                    modal.remove();
                });
                this.setView('.login-modal', modal);
                modal.render();
            } else {
                this.$el.find('.alert-error').remove().end().prepend($('<div class="alert alert-error">').text('Username and Password are required.').fadeIn());
            }
            return false;
        }
    });


    AgaveAuth.RenewTokenForm = Backbone.View.extend({
        template: 'auth/renew-token-form',
        events: {
            'submit .renew-form': 'renewToken',
            'click .btn-cancel':  'dismiss'
        },
        renewToken: function() {
            var password = this.$el.find('#password').val(),
                that = this;
            this.$el.find('alert-error').remove();
            that.model.save({}, {
                password: password,
                success: function() {
                    that.model.set({
                        expires: moment().add('hours', 2).unix()
                    });
                    that.remove();
                },
                error: function() {
                    that.$el.prepend('<div class="alert alert-error">Unable to renew token.  Please check your password and try again.</div>');
                    that.$el.find('#password').val('');
                }
            });
            return false;
        },
        dismiss: function() {
            this.remove();
            return false;
        }
    });

    App.Views.AgaveAuth = AgaveAuth;
    return AgaveAuth;
});
