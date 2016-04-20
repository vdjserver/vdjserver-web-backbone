define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var PasswordReset = {};

    PasswordReset = Backbone.Agave.Model.extend({
        defaults: {
            username:  '',
            uuid:  ''
        },
        apiHost: EnvironmentConfig.vdjApi.hostname,
        url: function() {
            var url = '/user/reset-password';
            if (this.get('uuid')) {
                url = url + '/verify';
            }
            return url;
        },
        requiresAuth: false,
        validate: function(attributes) {

            var errors = [];

            // Missing attributes
            if (!attributes.username) {
                errors.push({
                    'message': 'Missing username.',
                    'type': 'username'
                });
            }

            // only validate password if uuid present
            if (attributes.uuid) {
                if (!attributes.newPassword) {
                    errors.push({
                        'message': 'Missing password.',
                        'type': 'newPassword'
                    });
                }

                if (!attributes.passwordCheck) {
                    errors.push({
                        'message': 'Missing password verification.',
                        'type': 'passwordCheck'
                    });
                }

                // Incorrect attributes
                if (attributes.newPassword.length > 0 && attributes.newPassword.length < 5) {
                    errors.push({
                        'message': 'Password is too short.',
                        'type': 'newPassword'
                    });
                }

                if (attributes.username.length > 0 &&
                    attributes.newPassword.length > 0 &&
                    attributes.username.indexOf(attributes.newPassword) >= 0
                ) {
                    errors.push({
                        'message': 'Password can\'t be part of username.',
                        'type': 'newPassword'
                    });
                }

                if (attributes.newPassword !== attributes.passwordCheck) {
                    errors.push({
                        'message': 'Passwords do not match.',
                        'type': 'passwordCheck'
                    });
                }
            }

            if (errors.length) {
                return errors;
            }
        }
    });

    Backbone.Agave.Model.PasswordReset = PasswordReset;
    return PasswordReset;
});
