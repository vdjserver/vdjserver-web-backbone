define(
    [
        'backbone',
        'environment-config',
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var NewAccount = {};

    NewAccount = Backbone.Agave.Model.extend({
        defaults: {
            username:  '',
            password:  '',
            passwordCheck: '',
            email:     ''
        },
        apiRoot: EnvironmentConfig.vdjauthRoot,
        url: function() {
            return '/user';
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

            if (!attributes.email) {
                errors.push({
                    'message': 'Missing email.',
                    'type': 'email'
                });
            }

            if (!attributes.password) {
                errors.push({
                    'message': 'Missing password.',
                    'type': 'password'
                });
            }

            if (!attributes.passwordCheck) {
                errors.push({
                    'message': 'Missing password verification.',
                    'type': 'passwordCheck'
                });
            }

            // Incorrect attributes
            if (attributes.password.length > 0 && attributes.password.length < 5) {
                errors.push({
                    'message': 'Password is too short.',
                    'type': 'password'
                });
            }

            if (attributes.username.length > 0 &&
                attributes.password.length > 0 &&
                attributes.username.indexOf(attributes.password) >= 0
            ) {
                errors.push({
                    'message': 'Password can\'t be part of username.',
                    'type': 'password'
                });
            }

            if (attributes.password.indexOf('%') > -1) {
                errors.push({
                    'message': 'Passwords can not contain the \'%\' character.',
                    'type': 'password'
                });
            }

            if (attributes.password !== attributes.passwordCheck) {
                errors.push({
                    'message': 'Passwords do not match.',
                    'type': 'passwordCheck'
                });
            }

            if (errors.length) {
                return errors;
            }
        }
    });

    Backbone.Agave.Model.NewAccount = NewAccount;
    return NewAccount;
});
