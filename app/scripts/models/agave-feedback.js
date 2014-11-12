define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var FeedbackModel = Backbone.Agave.Model.extend({
        defaults: {
            feedback: '',
            recaptcha_challenge_field:   '',
            recaptcha_response_field: '',
        },
        apiRoot: EnvironmentConfig.vdjauthRoot,
        url: function() {
            return '/feedback';
        },
        requiresAuth: false,
        validate: function(attributes) {
            var errors = [];

            // Missing attributes
            if (! attributes.feedback) {
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
            if(! attributes.recaptcha_response_field) {
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

    Backbone.Agave.Model.FeedbackModel = FeedbackModel;
    return FeedbackModel;
});
