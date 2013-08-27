define(['app'], function(App) {

    'use strict';

    var Account   = {};
    var UtilViews = App.Views.Util;

    Account.NewAccountForm = Backbone.View.extend({
        template: 'account/new-account-form',
        events: {
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            e.preventDefault();

            /*
             should return:
                internalusername
                password
                email
             */
            var formData = Backbone.Syphon.serialize(this);

            if (
                    formData.internalUsername &&
                    formData.password         &&
                    formData.email
               )
            {

                var message = new App.Models.MessageModel({
                    'header': 'Creating new account',
                    'body':   '<p>Please wait while your new account is being made...</p>'
                });

                var modal = new UtilViews.ModalMessage({
                    model:    message,
                    backdrop: 'static',
                    keyboard: false
                });

                var that = this;

                $('<div class="create-account-modal">').appendTo(this.el);
                modal.$el.on('shown', function() {
                    that.$el.find('.alert-error').remove();
                    that.model.save(
                        formData,
                        {
                            success: function() {
                                message.set('body', message.get('body') + '<p>Success!</p> <button class="btn btn-default btn-block newAccountSuccess">Continue to Login Screen</button>');
                                $('.newAccountSuccess').click(function() {

                                    console.log('click. it happened.');
                                    modal.close();
                                    App.router.navigate('auth/login', {
                                        trigger: true
                                    });

                                });

                            },
                            //error: function(model, xhr, options) {
                            error: function() {
                                that.$el.prepend($('<div class="alert alert-error">').text('Account creation failed.  Please check your username, password and email.').fadeIn());
                                $('#password').val('');
                                modal.close();
                            }
                        }
                    );
                });
                modal.$el.on('hidden', function() {
                    modal.remove();
                });
                this.setView('.create-account-modal', modal);
                modal.render();
            }
            else {
                this.$el.find('.alert-error').remove().end().prepend($('<div class="alert alert-error">').text('Username, Password and Email are all required.').fadeIn());
            }
            return false;
        }
    });

    Account.ProfileForm = Backbone.View.extend({
        template: 'account/profile-form',
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            this.model.fetch();
        },
        serialize: function() {
            return {
                profileData: this.model.toJSON()
            };
        },
        events: {
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);

            if (formData.email) {

                var message = new App.Models.MessageModel({
                    'header': 'Updating profile',
                    'body':   '<p>Please wait while your profile is being updated...</p>'
                });

                var modal = new UtilViews.ModalMessage({
                    model:    message,
                    backdrop: 'static',
                    keyboard: false
                });

                var that = this;

                $('<div class="update-profile-modal">').appendTo(this.el);
                modal.$el.on('shown', function() {
                    that.$el.find('.alert-error').remove();
                    that.model.save(
                        formData,
                        {
                            success: function() {
                                message.set('body', message.get('body') + '<p>Success!</p> <button class="btn btn-default btn-block successMessage">Close</button>');
                                $('.successMessage').click(function() {
                                    modal.close();
                                });

                            },
                            //error: function(model, xhr, options) {
                            error: function() {
                                that.$el.prepend($('<div class="alert alert-error">').text('Profile update failed. Please try again.').fadeIn());
                                modal.close();
                            }
                        }
                    );
                });
                modal.$el.on('hidden', function() {
                    modal.remove();
                });
                this.setView('.update-profile-modal', modal);
                modal.render();
            }
            else {
                this.$el.find('.alert-error').remove().end().prepend($('<div class="alert alert-error">').text('Email is required.').fadeIn());
            }
            return false;
        }
    });

    App.Views.Account = Account;
    return Account;
});
