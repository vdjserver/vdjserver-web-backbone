define(
    [
        'backbone',
        'environment-config',
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var Account = {};

    Account.VerifyAccount = Backbone.Agave.Model.extend({
        apiRoot: EnvironmentConfig.vdjauthRoot,
        url: function() {
            return '/user'
                   + '/verify'
                   + '/' + this.get('verificationId')
                   ;
        },
        requiresAuth: false,
    });

    Account.ResendVerificationEmail = Backbone.Agave.Model.extend({
        apiRoot: EnvironmentConfig.vdjauthRoot,
        url: function() {
            return '/user'
                   + '/' + this.get('username')
                   + '/verify'
                   + '/email'
                   ;
        },
        requiresAuth: false,
    });

    Account.NewAccount = Backbone.Agave.Model.extend({
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
                    'type': 'username',
                });
            }

            if (!attributes.email) {
                errors.push({
                    'message': 'Missing email.',
                    'type': 'email',
                });
            }

            if (!attributes.password) {
                errors.push({
                    'message': 'Missing password.',
                    'type': 'password',
                });
            }

            if (!attributes.passwordCheck) {
                errors.push({
                    'message': 'Missing password verification.',
                    'type': 'passwordCheck',
                });
            }

            // Incorrect username attributes
            if (attributes.username !== attributes.username.toLowerCase()) {
                errors.push({
                    'message': 'Usernames can not include capital letters.',
                    'type': 'username',
                });
            }

            if (attributes.username.indexOf(' ') >= 0) {
                errors.push({
                    'message': 'Usernames can not include spaces.',
                    'type': 'username',
                });
            }

            // Incorrect password attributes
            if (attributes.password.length > 0 && attributes.password.length < 5) {
                errors.push({
                    'message': 'Password is too short.',
                    'type': 'password',
                });
            }

            if (attributes.username.length > 0 &&
                attributes.password.length > 0 &&
                attributes.username.indexOf(attributes.password) >= 0
            ) {
                errors.push({
                    'message': 'Password can\'t be part of username.',
                    'type': 'password',
                });
            }

            if (attributes.password.indexOf('%') > -1) {
                errors.push({
                    'message': 'Passwords can not contain the \'%\' character.',
                    'type': 'password',
                });
            }

            if (attributes.password !== attributes.passwordCheck) {
                errors.push({
                    'message': 'Passwords do not match.',
                    'type': 'passwordCheck',
                });
            }

            if (errors.length) {
                return errors;
            }
        },
    });

    Backbone.Agave.Model.Account = Account;
    return Account;
});