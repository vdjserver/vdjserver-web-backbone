define(['app'], function(App) {

    'use strict';

    var UtilViews = App.Views.Util;
    var CreateAccount = {};

    CreateAccount.Form = Backbone.View.extend({
        template: 'account/create-account-form',
        initialize: function() {
            this.model = new Backbone.Agave.Model.NewAccount();
        },
        afterRender: function() {
            this.setupModalView();
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Creating Account',
                'body':   '<p>Please wait while your account is created...</p>'
            });

            var modal = new App.Views.Util.ModalMessage({
                model: message
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

            if (formData.password !== formData.passwordCheck) {
                this.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('Passwords do not match.').fadeIn());
                return false;
            }

            if (formData.username && formData.password && formData.email) {

                this.setupModalView();
                var that = this;

                $('#modal-message').on('shown.bs.modal', function() {

                    that.model.save(
                        {
                            username: formData.username,
                            password: formData.password,
                            email:    formData.email
                        },
                        {
                            success: function() {

                                $('#modal-message').on('hidden.bs.modal', function() {

                                    App.router.navigate('/auth/login', {
                                        trigger: true
                                    });

                                });

                                $('#modal-message').modal('hide');
                            },
                            error: function() {
                                that.$el.find('.alert-danger').remove().end().prepend($('<div class="alert alert-danger">').text('Account creation failed. Please try again.').fadeIn());
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
        }
    });

    App.Views.CreateAccount = CreateAccount;
    return CreateAccount;
});