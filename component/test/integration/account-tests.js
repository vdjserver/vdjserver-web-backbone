/*global describe, it */

define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Accounts)', function()  {
        this.timeout(5000);

        it('Agave should exist', function() {
            var agave = new Backbone.Agave();
            should.exist(agave);
        });

        it('Auth token model should exist', function() {
            var authTokenModel = new Backbone.Agave.Auth.Token();
            should.exist(authTokenModel);
        });

        it('Account without username', function(done) {

            // simulate form data
            var formData = {
                firstName: 'Testing',
                lastName: 'mcVDJ',
                email: 'vdjserver@utsouthwestern.edu',
                city: 'Vdjville',
                state: 'Texas',
                country: 'USA',
                affiliation: 'VDJ testers',
                password: EnvironmentConfig.test.password,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Created account without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Username required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;

        });

        it('Account without password', function(done) {

            // simulate form data
            var formData = {
                firstName: 'Testing',
                lastName: 'mcVDJ',
                email: 'vdjserver@utsouthwestern.edu',
                city: 'Vdjville',
                state: 'Texas',
                country: 'USA',
                affiliation: 'VDJ testers',
                username: EnvironmentConfig.test.username,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Created account without password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Password required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;

        });

        it('Account without email', function(done) {

            // simulate form data
            var formData = {
                firstName: 'Testing',
                lastName: 'mcVDJ',
                city: 'Vdjville',
                state: 'Texas',
                country: 'USA',
                affiliation: 'VDJ testers',
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Created account without email"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Email required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;

        });

        it.skip('Account without recaptcha', function(done) {

            var model = new Backbone.Agave.Model.Account.NewAccount();

            // simulate form data
            var formData = {
                firstName: 'Testing',
                lastName: 'mcVDJ',
                email: 'vdjserver@utsouthwestern.edu',
                city: 'Vdjville',
                state: 'Texas',
                country: 'USA',
                affiliation: 'VDJ testers',
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
                passwordCheck: EnvironmentConfig.test.password,
            };

            model.set(formData);
            //model.isValid();

            model.save({
                username: formData.username,
                password: formData.password,
                email:    formData.email,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Created account with invalid recaptcha"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Recaptcha response invalid: missing-input-response');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Change password, unauthorized', function(done) {

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
                newPassword: EnvironmentConfig.test.password,
                passwordCheck: EnvironmentConfig.test.password,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/change-password',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                assert.equal(response.responseText, 'Unauthorized');

                done();
            })
            ;

        });

        it('Should perform login', function(done) {

            should.exist(App);
            App.init();

            should.exist(App.Agave);

            var model = App.Agave.token();
            App.Agave.destroyToken();

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
            };

            model.save(formData, {password: formData.password})
                .then(function(response) {
                    if (EnvironmentConfig.debug.console) console.log(response);

                    assert.isDefined(model.get('access_token'));
                    assert.isDefined(model.get('expires'));
                    assert.isDefined(model.get('expires_in'));
                    assert.isDefined(model.get('refresh_token'));
                    assert.isDefined(model.get('token_type'));
                    assert.isDefined(model.get('username'));
                    assert.isDefined(model.get('password'));
                    assert.equal(model.get('token_type'), 'bearer');
                    assert.equal(model.get('username'), formData.username);
                    assert.equal(model.get('password'), formData.password);

                    if (EnvironmentConfig.debug.console) console.log("token is: " + JSON.stringify(model));

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

        it('Change password with garbage authorization', function(done) {

            // simulate form data
            var formData = {
                password: EnvironmentConfig.test.password,
                newPassword: EnvironmentConfig.test.password,
            };

            var auth = { 'Authorization': 'Basic ' + btoa('garbage: junk') };
            //var auth = { 'Authorization': 'Basic ' + 'garbage: junk' };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/change-password',
                data: JSON.stringify(formData),
                headers: auth,
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                // TODO: vdj-api should handle this error better
                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Username required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;

        });

        it('Change password without password', function(done) {

            // simulate form data
            var formData = {
                newPassword: EnvironmentConfig.test.password,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/change-password',
                data: JSON.stringify(formData),
                headers: Backbone.Agave.basicAuthHeader(),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Changed password without password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Password required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;

        });

        it('Change password without new password', function(done) {

            // simulate form data
            var formData = {
                password: EnvironmentConfig.test.password,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/change-password',
                data: JSON.stringify(formData),
                headers: Backbone.Agave.basicAuthHeader(),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Changed password without new password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'New Password required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;

        });

        it('Change password with wrong password', function(done) {

            // simulate form data
            var formData = {
                password: 'not_real',
                newPassword: EnvironmentConfig.test.password,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/change-password',
                data: JSON.stringify(formData),
                headers: Backbone.Agave.basicAuthHeader(),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Changed password with wrong password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                // TODO: vdj-api should handle this error better
                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Password is incorrect.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;

        });

        it('Change password', function(done) {

            // simulate form data
            var formData = {
                password: EnvironmentConfig.test.password,
                newPassword: EnvironmentConfig.test.password,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/change-password',
                data: JSON.stringify(formData),
                headers: Backbone.Agave.basicAuthHeader(),
                contentType: 'application/json',
            })
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.isDefined(response);
                assert.strictEqual(response.status, 200);
                assert.equal(responseText.result, 'Password changed successfully.');
                assert.equal(responseText.status, 'success');
                assert.equal(responseText.message, '');

                done();
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                done(new Error("Could not change password"));
            })
            ;

        });

    });

});
