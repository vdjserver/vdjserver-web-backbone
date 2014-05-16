define(['backbone'], function(Backbone) {

    'use strict';

    var PasswordChange = {};

    PasswordChange = Backbone.Agave.Model.extend({
        defaults: {
            username:  '',
            password: '',   // old password
            newPassword: '',
            passwordCheck: ''
        },
        apiRoot: Backbone.Agave.vdjauthRoot,
        url: function() {
            return '/user/change-password';
        },
        callSave: function() {
            var jxhr = $.ajax({
                data: {
                    newPassword: this.get('newPassword'),
                    password: this.get('password')
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + Backbone.Agave.instance.token().get('access_token'))
                },
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + this.url()
            });

            return jxhr;
        },
        validate: function(attributes) {

            var errors = [];

            // Missing attributes
            if (! attributes.username) {
                errors.push({
                    'message': 'Missing username.',
                    'type': 'username'
                });
            }

            if (! attributes.password) {
                errors.push({
                    'message': 'Missing current password.',
                    'type': 'password'
                });
            }

            if (! attributes.newPassword) {
                errors.push({
                    'message': 'Missing new password.',
                    'type': 'newPassword'
                });
            }

            if (! attributes.passwordCheck) {
                errors.push({
                    'message': 'Missing new password verification.',
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
                attributes.username.indexOf(attributes.newPassword) >= 0)
            {
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

            if (errors.length) {
                return errors;
            }
        }
    });

    Backbone.Agave.Model.PasswordChange = PasswordChange;
    return PasswordChange;
});
