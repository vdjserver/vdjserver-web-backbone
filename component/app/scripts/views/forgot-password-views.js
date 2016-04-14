define(['app', 'backbone.syphon'], function(App) {

    'use strict';

    var ForgotPassword = {};

    ForgotPassword.Form = Backbone.View.extend({
        template: 'account/password-reset',
        initialize: function(opts) {
            this.model = new Backbone.Agave.Model.PasswordReset({uuid: opts.uuid});
            if (opts.uuid) {
                this.template = this.template + '-verify';
            }
            this.listenTo(this.model, 'change', this.render);
        },
        afterRender: function() {
            this.setupModalView();
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Validating account',
                'body': '<p>Please wait while we validate your account information...</p>'
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
                    that.model.save()
                        .done(function() {
                            $('#modal-message')
                                .modal('hide')
                                .on('hidden.bs.modal', function() {
                                    if (that.model.get('uuid')) {
                                        // we're verified and password reset; redirect to login
                                        App.router.navigate('', {trigger:true});
                                        setTimeout(function() {
                                            $('.home-view').prepend(
                                                $('<div class="alert alert-success alert-floating">').html(
                                                    '<i class="fa fa-thumbs-up"></i> You have successfully changed your password!'
                                                ).fadeIn()
                                            );
                                        }, 500);
                                    }
                                    else {
                                        // reset process initiated; vdj middleware should send email to user
                                        var message = '<i class="fa fa-thumbs-up"></i>'
                                                      + 'Your password reset request has been received!'
                                                      + ' Please check the email address associated with your account for further instructions.';

                                        that.model.clear();
                                        that.$el.find('.public-view').prepend($('<div class="alert alert-success">').html(message).fadeIn());
                                    }
                                });
                        })
                        .fail(function(error) {
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(error);
                            telemetry.set('method', 'Backbone.Agave.Model.PasswordReset().save()');
                            telemetry.set('view', 'ForgotPassword.Form');
                            telemetry.save();

                            $('#modal-message').modal('hide').on('hidden.bs.modal', function() {
                                that.$el.find('.public-view').prepend(
                                    $('<div class="alert alert-danger">')
                                        .text('Unable to reset password! Please confirm that your username is correct and try again.')
                                        .fadeIn()
                                );
                            });
                        });
                });
        },

        validateForm: function(formData) {
            this.model.set(formData, {silent: true});
            this.model.isValid();
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
                    var type = formErrors[i].type;

                    this.$el.find('.public-view').prepend($('<div class="alert alert-danger">').text(message).fadeIn());
                    $('#' + type + '-container').addClass('has-error');
                }
            }
        },
    });

    App.Views.ForgotPassword = ForgotPassword;
    return ForgotPassword;
});
