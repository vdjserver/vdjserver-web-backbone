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
        validateForm: function(formData) {

            this.model.set(formData);

            this.model.isValid()
            var errors = this.model.validationError;

            return errors;
        },
        displayFormErrors: function(formErrors) {

            // Clear out old errors
            //this.$el.find('.alert-danger').fadeOut(function() {
            $('.alert-danger').fadeOut(function() {
                this.remove();
            });

            $('.form-group').removeClass('has-error');

            // Display any new errors
            if (_.isArray(formErrors)) {

                for (var i = 0; i < formErrors.length; i++) {
                    var message = formErrors[i].message;
                    var type    = formErrors[i].type;

                    this.$el.find('.alerts').end().before($('<div class="alert alert-danger">').text(message).fadeIn());
                    $('#' + type + '-container').addClass('has-error');
                };
            }
        },
        submitForm: function(e) {

            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);
            var formErrors = this.validateForm(formData);

            this.displayFormErrors(formErrors);

            if (_.isArray(formErrors)) {
                return false;
            }

            // Reset modal view - otherwise it inadvertently gets duplicated
            this.setupModalView();

            var that = this;

            $('#modal-message')
                .modal('show')
                .on('shown.bs.modal', function() {

                    that.model
                        .save({
                            username: formData.username,
                            password: formData.password,
                            email:    formData.email
                        })
                        .done(function() {

                            $('#modal-message')
                                .modal('hide')
                                .on('hidden.bs.modal', function() {

                                    App.router.navigate('/auth/login', {
                                        trigger: true
                                    });

                                });

                        })
                        .fail(function() {
                            that.$el.find('.alerts').remove().end().before($('<div class="alert alert-danger">').text('Account creation failed. Please try again.').fadeIn());
                            $('#modal-message').modal('hide');
                        });
                });
        }
    });

    App.Views.CreateAccount = CreateAccount;
    return CreateAccount;
});
