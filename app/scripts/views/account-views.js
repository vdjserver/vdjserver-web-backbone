define(['app'], function(App) {

    var Account = {}, UtilViews = App.Views.Util;

    Account.NewAccountForm = Backbone.View.extend({
        template: 'account/new-account-form',
        events: {
            'submit form': 'submitForm'
        },
        submitForm: function(e) {

            e.preventDefault();

            var internalUsername = this.$el.find('#internalUsername').val();
            var password         = this.$el.find('#password').val();
            var email            = this.$el.find('#email').val();


            if (internalUsername && password && email) {

                var message = new App.Models.MessageModel({
                    'header': 'Creating new account',
                    'body':   '<p>Please wait while your new account is being made...</p>'
                });

                var modal = new UtilViews.ModalMessage({
                    model:    message,
                    backdrop: 'static',
                    keyboard: false
                });

                that = this;

                $('<div class="create-account-modal">').appendTo(this.el);
                modal.$el.on('shown', function() {
                    that.$el.find('.alert-error').remove();
                    that.model.save(
                        {
                            internalUsername: internalUsername,
                            password:         password,
                            email:            email
                        },
                        {
                            password: password,
                            success: function() {
                                message.set('body', message.get('body') + '<p>Success!</p> <button class="btn btn-default btn-block newAccountSuccess">Continue to Login Screen</button>');
                                $('.newAccountSuccess').click(function() {

                                    console.log("click. it happened.");
                                    modal.close();
                                    App.router.navigate('auth/login', {
                                        trigger: true
                                    });

                                });

                            },
                            error: function(model, xhr, options) {
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


    App.Views.Account = Account;
    return Account;
});
