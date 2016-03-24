define(
    [
        'app',
    ],
function(
    App
) {

    'use strict';

    var Recaptcha = {};

    Recaptcha = Backbone.Model.extend(
        {
            validate: function(attributes) {
                var errors = [];

                // Missing attributes
                if (!attributes['g-recaptcha-response']) {
                    errors.push({
                        'message': 'Missing reCAPTCHA Challenge',
                        'type': 'recaptcha',
                    });
                }

                if (errors.length) {
                    return errors;
                }
            },
        },
        {
            RECAPTCHA_ERROR_MESSAGE: 'Recaptcha response invalid: incorrect-captcha-sol',
        }
    );

    App.Models.Recaptcha = Recaptcha;
    return Recaptcha;
});
