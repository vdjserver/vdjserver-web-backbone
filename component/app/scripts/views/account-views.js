define([
    'app',
    'backbone.syphon',
], function(
    App
) {

    'use strict';

    var Account = {};

    Account.CreateAccount = Backbone.View.extend({
        template: 'account/create-account-form',
        initialize: function() {
            this.model = new Backbone.Agave.Model.Account.NewAccount();
        },
        afterRender: function() {
            this.setupModalView();

            grecaptcha.render('recaptcha', {
                sitekey: EnvironmentConfig.recaptchaPublicKey,
            });
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Creating Account',
                'body':   '<p>Please wait while your account is created...</p>',
            });

            var modal = new App.Views.Util.ModalMessage({
                model: message,
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);
            modal.render();

        },
        events: {
            'submit form': 'submitForm',
        },
        validateForm: function(formData) {

            this.model.set(formData);
            this.model.isValid();

            var recaptchaModel = new App.Models.Recaptcha();
            recaptchaModel.set(formData);
            recaptchaModel.isValid();

            var errors = [];

            if (Array.isArray(this.model.validationError)) {
                errors = errors.concat(this.model.validationError);
            }

            if (Array.isArray(recaptchaModel.validationError)) {
                errors = errors.concat(recaptchaModel.validationError);
            }

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

                    this.$el
                        .find('.public-view')
                        .prepend(
                            $('<div class="alert alert-danger">')
                                .text(message)
                                .fadeIn()
                        )
                    ;
                    $('#' + type + '-container').addClass('has-error');
                }

                $('html,body').animate({
                    scrollTop: 0,
                });
            }
        },
        submitForm: function(e) {

            e.preventDefault();

            var formData = Backbone.Syphon.serialize(this);
            var formErrors = this.validateForm(formData);
            this.displayFormErrors(formErrors);

            if (_.isArray(formErrors) && formErrors.length > 0) {
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
                            email:    formData.email,
                        })
                        .always(function() {
                            grecaptcha.reset();
                        })
                        .done(function() {

                            $('#modal-message')
                                .modal('hide')
                                .on('hidden.bs.modal', function() {
                                    App.router.navigate('/account/pending', {
                                        trigger: true,
                                    });
                                });

                        })
                        .fail(function(jqXhr, errorText, errorThrown) {

                            // Recaptcha telemetry
                            if (jqXhr.responseJSON.message === App.Models.Recaptcha.RECAPTCHA_ERROR_MESSAGE) {
                                var captchaTelemetry = new Backbone.Agave.Model.Telemetry();
                                captchaTelemetry.setError(jqXhr);
                                captchaTelemetry.set('method', 'Backbone.Agave.Model.NewAccount().save()');
                                captchaTelemetry.set('view', 'Account.CreateAccount');
                                captchaTelemetry.save();
                            }

                            // Account telemetry
                            var telemetry = new Backbone.Agave.Model.Telemetry();
                            telemetry.setError(jqXhr);
                            telemetry.set('username', formData.username);
                            telemetry.set('method', 'Backbone.Agave.Model.Account.NewAccount().save()');
                            telemetry.set('view', 'Account.CreateAccount');
                            telemetry.save();

                            $('#modal-message').modal('hide');

                            if (errorMessage === '4' || errorMessage === '5') {
                                $('#modal-message')
                                    .on('hidden.bs.modal', function() {
                                        App.router.navigate('/account/pending', {
                                            trigger: true,
                                        });
                                    })
                                    ;
                            }

                            var errorMessage = jqXhr.responseText.message;

                            var parsedErrorMessage = that.model.parseApiErrorMessage(errorMessage);
                            that.displayFormErrors([parsedErrorMessage]);
                        });
                });
        },
    });

    Account.VerificationPending = Backbone.View.extend({
        template: 'account/verification-pending',
        initialize: function() {
        },
        afterRender: function() {

        },
        events: {
            'submit #resend-verification-form': 'resendVerificationEmail',
            'submit #verify-account-form': 'verifyAccount',
        },
        resendVerificationEmail: function(e) {
            e.preventDefault();

            //var formErrors = this.validateForm(formData);
            var username = $('#verification-username').val();

            if (username.length <= 0) {
                $('#resend-email-form-group').addClass('has-error');
                return;
            }

            var model = new Backbone.Agave.Model.Account.ResendVerificationEmail({
                username: username,
            });

            var that = this;
            model.save()
                .done(function() {

                    var messageModel = new App.Models.MessageModel({
                        //'header': 'Verifying Account',
                        'body': '<p class="text-center">Verification email sent successfully.</p>',
                        'successStyle': true,
                    });

                    that.setupModalView(messageModel)
                        .done(function() {
                            $('#confirmation-button').removeClass('hidden');
                            $('#modal-message').modal('show');
                        })
                        ;
                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('username', username);
                    telemetry.set('method', 'Backbone.Agave.Model.Account.ResendVerificationEmail().save()');
                    telemetry.set('view', 'Account.VerificationPending');
                    telemetry.save();

                    var messageModel = new App.Models.MessageModel({
                        //'header': 'Verifying Account',
                        'body': '<p class="text-center">Unable to send verification email. Please check your username and try again.</p>',
                        'errorStyle': true,
                    });

                    that.setupModalView(messageModel)
                        .done(function() {
                            $('#confirmation-button').removeClass('hidden');
                            $('#modal-message').modal('show');
                        })
                        ;
                });

        },
        verifyAccount: function(e) {

            e.preventDefault();

            //var formErrors = this.validateForm(formData);

            var verificationId = $('#verification-code').val();

            if (verificationId.length <= 0) {
                $('#verification-form-group').addClass('has-error');
                return;
            }

            var model = new Backbone.Agave.Model.Account.VerifyAccount({
                verificationId: verificationId,
            });

            var that = this;
            model.save()
                .done(function() {

                    var messageModel = new App.Models.MessageModel({
                        //'header': 'Verifying Account',
                        'body': '<p class="text-center">Account verification successful.</p>',
                        'successStyle': true,
                    });

                    that.setupModalView(messageModel)
                        .done(function() {
                            $('#confirmation-button').removeClass('hidden');
                            $('#modal-message').modal('show');

                            $('#modal-message')
                                .on('hidden.bs.modal', function() {
                                    App.router.navigate('/', {
                                        trigger: true,
                                    });
                                })
                                ;
                        })
                        ;

                })
                .fail(function(error) {
                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(error);
                    telemetry.set('method', 'Backbone.Agave.Model.Account.VerifyEmail().save()');
                    telemetry.set('view', 'Account.VerificationPending');
                    telemetry.save();

                    var messageModel = new App.Models.MessageModel({
                        //'header': 'Verifying Account',
                        'body': '<p class="text-center">Unable to verify account. Please check your verification code and try again.</p>',
                        'errorStyle': true,
                    });

                    that.setupModalView(messageModel)
                        .done(function() {
                            $('#confirmation-button').removeClass('hidden');
                            $('#modal-message').modal('show');
                        })
                        ;
                })
                ;
        },
        setupModalView: function(messageModel) {

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: messageModel,
            });

            $('#modal-view').remove();

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);

            return modal.render().promise();
        },
    });

    Account.VerifyAccount = Backbone.View.extend({
        template: 'account/verify-account',
        initialize: function(parameters) {

            this.verificationId = false;

            if (parameters && parameters['verificationId']) {
                this.verificationId = parameters['verificationId'];
            }

            var loadingView = new App.Views.Util.Loading({
                keep: true,
            });

            this.setView('#loading-view', loadingView);
            loadingView.render();

        },
        afterRender: function() {

            var that = this;

            this.setupModalView()
                .done(function() {

                    if (that.verificationId) {
                        that.model = new Backbone.Agave.Model.Account.VerifyAccount({
                            verificationId: that.verificationId,
                        });

                        that.model.save()
                            .done(function() {

                                that.removeView('#loading-view');

                                $('#confirmation-button').removeClass('hidden');

                                $('#modal-message')
                                    .modal('show');

                                $('#modal-message')
                                    .on('hidden.bs.modal', function() {
                                        App.router.navigate('/', {
                                            trigger: true,
                                        });
                                    })
                                    ;
                            })
                            .fail(function(error) {
                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.setError(error);
                                telemetry.set('method', 'Backbone.Agave.Model.Account.VerifyAccount().save()');
                                telemetry.set('view', 'Account.VerifyAccount');
                                telemetry.save();

                                $('#verification-content').html(
                                    '<div class="alert alert-danger">'
                                        + '<i class="fa fa-user"></i> Verification failed. Please try again.'
                                    + '</div>'
                                );
                            })
                            ;
                    }
                    else {
                        App.router.navigate('/', {
                            trigger: true,
                        });
                    }
                })
                ;
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                //'header': 'Verifying Account',
                'body': '<p class="text-center">Verification complete.</p>',
                'successStyle': true,
            });

            var modal = new App.Views.Util.ModalMessageConfirm({
                model: message,
            });

            $('<div id="modal-view">').appendTo(this.el);

            this.setView('#modal-view', modal);

            return modal.render().promise();
        },
    });

    App.Views.Account = Account;
    return Account;
});