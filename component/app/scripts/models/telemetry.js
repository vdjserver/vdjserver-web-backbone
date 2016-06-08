define(
    [
        'backbone',
        'detect',
    ],
function(
    Backbone,
    detect
) {

    'use strict';

    var Telemetry = Backbone.Agave.Model.extend({
        defaults: {
            username:  '',
            projectId: '',
            jobId: '',
            filename: '',
            method: '',
            error: '',
            view: '',
            browser: '',
            os: '',
        },
        apiHost: EnvironmentConfig.vdjApi.hostname,
        url: function() {
            return '/telemetry';
        },
        requiresAuth: false,
        initialize: function(options) {

            Backbone.Agave.Model.prototype.initialize.apply(this, [options]);

            var browser = this._detectBrowser();
            var os = this._detectOS();
            var username = Backbone.Agave.instance.token().get('username');

            this.set('browser', browser);
            this.set('os', os);
            this.set('username', username);
        },
        setError: function(error) {
            try {
                error.responseText = JSON.parse(error.responseText);
            } catch(e) {
            }
            delete error.responseJSON;

            this.set('error', error);
        },
        _detectBrowser: function() {
            var ua = detect.parse(navigator.userAgent);

            return ua.browser.name;
        },
        _detectOS: function() {
            var ua = detect.parse(navigator.userAgent);

            return ua.os.name;
        },
        /*
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
        */
    });

    Backbone.Agave.Model.Telemetry = Telemetry;
    return Telemetry;
});
