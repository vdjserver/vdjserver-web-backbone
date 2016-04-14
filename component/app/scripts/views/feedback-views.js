define([
    'app',
    'backbone.syphon',
], function(
    App
) {

    'use strict';

    var Feedback = {};

    Feedback.PublicForm = Backbone.View.extend({
        template: 'feedback/public-feedback',
        initialize: function() {
            this.model = new Backbone.Agave.Model.Feedback.Public();
            this.render;
        },
        afterRender: function() {
            grecaptcha.render('recaptcha', {
                sitekey: EnvironmentConfig.recaptchaPublicKey,
            });
        },
        events: {
            'submit form': 'submitForm'
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
            }
        },
        submitForm: function(e) {

            e.preventDefault();

            $('.alert-success').remove();

            var formData = Backbone.Syphon.serialize(this);
            var formErrors = this.validateForm(formData);
            this.displayFormErrors(formErrors);

            if (_.isArray(formErrors) && formErrors.length > 0) {
                return false;
            }

            var that = this;

            this.model.save({
                feedback: formData.feedback,
            })
            .always(function() {
                grecaptcha.reset();
            })
            .done(function() {
                that.$el.find('.form-control').val('');

                $('.alert-info').before(
                    $('<div class="alert alert-success">').html(
                        '<i class="fa fa-thumbs-up"></i> You have successfully submitted your feedback!'
                    ).fadeIn()
                );

                that.model.set(that.model.defaults);
            })
            .fail(function(e) {
                if (e.responseJSON.message === App.Models.Recaptcha.RECAPTCHA_ERROR_MESSAGE) {

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.setError(e);
                    telemetry.set('method', 'Backbone.Agave.Model.FeedbackModel().save()');
                    telemetry.set('view', 'Feedback.Form');
                    telemetry.save();

                    that.model.set(that.model.defaults);
                    var formData = Backbone.Syphon.serialize(that);
                    var formErrors = that.validateForm(formData);
                    that.displayFormErrors(formErrors);
                }
            });

        },
    });

    Feedback.UserForm = Backbone.View.extend({
        template: 'feedback/user-feedback-form',
        initialize: function() {

            $('html,body').animate({
                scrollTop: 0
            });

            this.model = new Backbone.Agave.Model.Feedback.User();

            this.loadingView = new App.Views.Util.Loading({
                keep: true
            });

            this.insertView(this.loadingView);

            this.setupViews();
        },
        setupViews: function() {
            this.loadingView.remove();
            this.render();
        },
        serialize: function() {
            return {
                userFeedbackData: this.model.get('value'),
            };
        },
        afterRender: function() {
            this.setupModalView();
        },
        setupModalView: function() {

            var message = new App.Models.MessageModel({
                'header': 'Sending User Feedback'
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

            if (formData.feedback) {

                this.setupModalView();
                var that = this;

                $('#modal-message')
                    .modal('show')
                    .on('shown.bs.modal', function() {

                        that.model
                            .save(formData)
                            .done(function() {

                                that.$el.find('.form-control').val('');

                                $('#modal-message')
                                    .modal('hide')
                                    .on('hidden.bs.modal', function() {
                                        setTimeout(function() {
                                            $('.alert-success').remove();
                                            $('.alert-info').after(
                                                $('<div class="alert alert-success">').html(
                                                    '<i class="fa fa-thumbs-up"></i> You have successfully submitted your feedback!'
                                                ).fadeIn()
                                            );
                                        }, 500);
                                    })
                                    ;
                            })
                            .fail(function(error) {

                                var telemetry = new Backbone.Agave.Model.Telemetry();
                                telemetry.setError(error);
                                telemetry.set('method', 'Backbone.Agave.Model.UserFeedback().save()');
                                telemetry.set('view', 'UserFeedback.Form');
                                telemetry.save();

                                that.$el.find('.alert-danger')
                                    .remove()
                                    .end()
                                    .prepend(
                                        $('<div class="alert alert-danger">')
                                            .text('Sending feedback failed. Please try again.')
                                            .fadeIn()
                                    );
                                $('#modal-message').modal('hide');
                            });
                    });
            }
            else {
                this.$el.find('.alert-danger')
                    .remove()
                    .end()
                    .prepend(
                        $('<div class="alert alert-danger">')
                            .text('Sending feedback failed. Please try again.')
                            .fadeIn()
                    )
                    ;
            }

            return false;
        }
    });

    App.Views.Feedback = Feedback;
    return Feedback;
});
