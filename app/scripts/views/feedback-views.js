define([
    'app',
    'environment-config',
    'recaptcha-ajax',
    'backbone.syphon',
], function(
    App,
    EnvironmentConfig,
    Recaptcha
) {

    'use strict';

    var Feedback = {};

    Feedback.Form = Backbone.View.extend({
        template: 'feedback/feedback',
        initialize: function() {
            this.model = new Backbone.Agave.Model.FeedbackModel();
            this.render;
        },
        afterRender: function() {
            Recaptcha.destroy();
            Recaptcha.create(EnvironmentConfig.recaptchaPublicKey, 'recaptcha');
        },
        events: {
            'submit form': 'submitForm'
        },
        validateForm: function(formData) {

            this.model.set(formData);

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

            var formData = Backbone.Syphon.serialize(this);
            var formErrors = this.validateForm(formData);
            this.displayFormErrors(formErrors);

            if (_.isArray(formErrors)) {
                return false;
            }

            var that = this;
            this.model.save({
                feedback: formData.feedback,
                recaptcha_challenge_field: formData.recaptcha_challenge_field,
                recaptcha_response_field:  formData.recaptcha_response_field
            })
            .done(function() {
                App.router.navigate('/', {
                    trigger: true
                });
            })
            .fail(function(e) {
                if (e.responseJSON.message === 'Recaptcha response invalid: incorrect-captcha-sol') {

                    var telemetry = new Backbone.Agave.Model.Telemetry();
                    telemetry.set('error', JSON.stringify(e.responseJSON.message));
                    telemetry.set('method', 'Backbone.Agave.Model.FeedbackModel().save()');
                    telemetry.set('view', 'Feedback.Form');
                    telemetry.save();

                    Recaptcha.destroy();
                    that.model.set(that.model.defaults);
                    Recaptcha.create(EnvironmentConfig.recaptchaPublicKey, 'recaptcha');
                    var formData = Backbone.Syphon.serialize(that);
                    var formErrors = that.validateForm(formData);
                    that.displayFormErrors(formErrors);
                }
            });

        },
    });

    App.Views.Feedback = Feedback;
    return Feedback;
});
