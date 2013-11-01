define(['app'], function(App) {

    'use strict';

    var Account   = {};
    var UtilViews = App.Views.Util;

    Account.NewAccountForm = Backbone.View.extend({
        template: 'account/new-account-form',
        initialize: function() {
            window.scrollTo(0,0);
        },
        events: {
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);

            if (formData.username  &&
                formData.password  &&
                formData.email)
            {

                // Popup
                var message = new App.Models.MessageModel({
                    'header': 'Creating new account',
                    'body':   '<p>Please wait while your new account is being made...</p>'
                });

                var modal = new UtilViews.ModalMessage({
                    model:    message,
                    backdrop: 'static',
                    keyboard: false
                });


                // Popup location
                $('<div class="create-account-modal">').appendTo(this.el);

                var that = this;

                // Popup callback
                modal.$el.on('shown', function() {

                    that.$el.find('.alert-error').remove();

                    that.model.save(
                        formData,
                        {
                            success: function() {
                                message.set('body', message.get('body') + '<p>Success!</p> <button class="btn btn-default btn-block newAccountSuccess">Continue to Login Screen</button>');
                                $('.newAccountSuccess').click(function() {

                                    modal.close();
                                    App.router.navigate('auth/login', {
                                        trigger: true
                                    });

                                });
                            },
                            //error: function(model, xhr, options) {
                            error: function() {
                                that.$el.prepend($('<div class="alert alert-error">').text('Account creation failed. Please check your username, password and email.').fadeIn());
                                $('#password').val('');
                                modal.close();
                            }
                        }
                    );
                });

                // Popup callback
                modal.$el.on('hidden', function() {
                    modal.remove();
                });

                //this.setView('.create-account-modal', modal);

                // Show Popup
                modal.render();
            }
            else {
                this.$el.find('.alert-error').remove().end().prepend($('<div class="alert alert-error">').text('Username, Password and Email are all required.').fadeIn());
            }
            return false;
        }
    });


    App.Views.Account = Account;
    return Account;
});
