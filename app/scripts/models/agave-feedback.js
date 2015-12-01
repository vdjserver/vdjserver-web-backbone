define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var Feedback = {};

    Feedback.Public = Backbone.Agave.Model.extend({
        defaults: {
            feedback: '',
        },
        apiHost: EnvironmentConfig.vdjApi.host,
        url: function() {
            return '/feedback/public';
        },
        requiresAuth: false,
        validate: function(attributes) {
            var errors = [];

            // Missing attributes
            if (!attributes.feedback) {
                errors.push({
                    'message': 'No feedback provided.',
                    'type': 'feedback'
                });
            }

            if (!attributes['g-recaptcha-response']) {
                errors.push({
                    'message': 'Missing reCAPTCHA Challenge',
                    'type': 'recaptcha'
                });
            }

            if (errors.length) {
                return errors;
            }
        },
    });

    Feedback.User = Backbone.Agave.Model.extend({
        defaults: function() {

            var defaultValues = {
                'feedback': '',
                'username': Backbone.Agave.instance.token().get('username'),
            };

            return defaultValues;
        },
        apiHost: EnvironmentConfig.vdjApi.host,
        url: function() {
            return '/feedback';
        },
    });

    Backbone.Agave.Model.Feedback = Feedback;
    return Feedback;
});
