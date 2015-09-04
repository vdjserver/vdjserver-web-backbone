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
            recaptcha_challenge_field:   '',
            recaptcha_response_field: '',
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

            /*
            if(! attributes.recaptcha_challenge_field) {
              errors.push({
                  'message': 'Missing Recaptcha Challenge.',
                  'type': 'recaptcha_challenge_field'
              });
            }
            */

            if (!attributes.recaptcha_response_field) {
                errors.push({
                    'message': 'Incorrect captcha response.',
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
