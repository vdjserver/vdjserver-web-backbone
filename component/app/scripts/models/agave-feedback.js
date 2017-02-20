define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var Feedback = {};

    Feedback.Public = Backbone.Agave.Model.extend({
        defaults: {
            feedback: '',
            email: '',
        },
        apiHost: EnvironmentConfig.vdjApi.hostname,
        url: function() {
            return '/feedback/public';
        },
        requiresAuth: false,
        validate: function(attributes) {
            var errors = [];

            // Missing attributes
            if (!attributes.email) {
                errors.push({
                    'message': 'No email provided.',
                    'type': 'feedback'
                });
            }

            if (!attributes.feedback) {
                errors.push({
                    'message': 'No feedback provided.',
                    'type': 'feedback'
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
        apiHost: EnvironmentConfig.vdjApi.hostname,
        authType: 'basic',
        url: function() {
            return '/feedback';
        },
    });

    Backbone.Agave.Model.Feedback = Feedback;
    return Feedback;
});
