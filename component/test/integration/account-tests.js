/*global describe, it */

define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    var data = {};

    describe('VDJServer-Agave Integration Tests (Accounts)', function()  {
        this.timeout(50000);

        it('Agave should exist', function() {
            var agave = new Backbone.Agave();
            should.exist(agave);

            should.exist(App);
            App.init();
            should.exist(App.Agave);
        });

        it('Auth token model should exist', function() {
            var authTokenModel = new Backbone.Agave.Auth.Token();
            should.exist(authTokenModel);
        });

      describe('Account creation - invalid', function()  {

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Created account without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Created account without password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Created account without email"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Created account with invalid recaptcha"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

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

        it.skip('Account with invalid recaptcha', function(done) {

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
                'g-recaptcha-response': 'garbage value'
            };

            model.set(formData);
            //model.isValid();

            model.save({
                username: formData.username,
                password: formData.password,
                email:    formData.email,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Created account with invalid recaptcha"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Recaptcha response invalid: invalid-input-response');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Account with existing username', function(done) {

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
                'g-recaptcha-response': 'skip_recaptcha'
            };

            model.set(formData);
            //model.isValid();

            model.save({
                username: formData.username,
                password: formData.password,
                email:    formData.email,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Created account with existing username"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, '1');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });
      }); // describe

      // If you are working on tests, you might want to run this suite of
      // tests to create an account but not verify it. Then for later runs,
      // skip the create account test case, hard code the username in the next
      // test case, and run the metadata verify; this will allow you to use
      // that data in subsequent tests without creating a new account for each run.
      describe('Account creation', function()  {

        it('Create Account - send email', function(done) {

            var model = new Backbone.Agave.Model.Account.NewAccount();

            data.username = 'vdj-test-' + (Math.round(Math.random() * 0x10000)).toString(16);
            console.log('Account is ' + data.username);

            // simulate form data
            var formData = {
                firstName: 'Testing',
                lastName: 'mcVDJ',
                email: 'vdjserver@utsouthwestern.edu',
                city: 'Vdjville',
                state: 'Texas',
                country: 'USA',
                affiliation: 'VDJ testers',
                username: data.username,
                password: EnvironmentConfig.test.password,
                passwordCheck: EnvironmentConfig.test.password,
                'g-recaptcha-response': 'skip_recaptcha'
            };

            model.set(formData);
            //model.isValid();

            model.save({
                username: formData.username,
                password: formData.password,
                email:    formData.email,
            })
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.strictEqual(response.status, 200);
                assert.equal(responseText.result.username, data.username);
                assert.equal(responseText.result.email, 'vdjserver@utsouthwestern.edu');
                assert.equal(responseText.status, 'success');
                assert.equal(responseText.message, '');

                done();
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Could not create account"));
            })
            ;
        });

        it('Create Account - login before verified', function(done) {

            //data.username = 'vdj-test-eff7';
            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

            var model = App.Agave.token();
            App.Agave.destroyToken();

            // simulate form data
            var formData = {
                username: data.username,
                password: EnvironmentConfig.test.password,
            };

            model.save(formData, {password: formData.password})
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error('Able to login before account was verified'));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'TokenController.getToken - error - unable to verify account for ' + data.username);
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Login as service account', function(done) {

            var model = App.Agave.token();
            App.Agave.destroyToken();

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.serviceAccountKey,
                password: EnvironmentConfig.test.serviceAccountSecret,
            };

            model.save(formData, {password: formData.password})
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

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

                    if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(model));

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

        it('Create Account - verify metadata', function(done) {

            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

            // get the metadata item
            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/meta/v2/data?q='
                            + encodeURIComponent(
                                '{'
                                    + '"name":"userVerification",'
                                    + '"value.username":"' + data.username + '"'
                                + '}'
                            )
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // expecting only one metadata entry, but there may be more
                // from failed tests, etc., don't make that a hard error
                assert.isAtLeast(result.length, 1);
                if (result.length != 1) console.log('Was only expecting one metadata entry, but got: ' + result.length);

                assert.equal(result[0].owner, EnvironmentConfig.test.serviceAccountKey);
                var uuid = result[0].uuid;
                assert.isDefined(uuid);
                assert.isNotNull(uuid);
                assert.isFalse(result[0].value.isVerified);
                assert.equal(result[0].value.username, data.username);

                data.new_account_uuid = uuid;

                // check metadata permissions
                jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data/' + uuid + '/pems'
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.equal(response.status, 'success');

                    assert.isDefined(response.result);
                    var result = response.result;
                    assert.strictEqual(result.length, 1);

                    assert.equal(result[0].username, EnvironmentConfig.test.serviceAccountKey);
                    assert.deepEqual(result[0].permission, {read: true, write: true});

                    done();
                })
                .fail(function(error) {
                    console.log("response: " + JSON.stringify(error));
                    done(new Error('Failed HTTP request for metadata permissions'));
                })
                ;
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request for metadata item'));
            })
            ;
        });

        it('Create Account - verify profile', function(done) {

            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

            // get the profile
            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/profiles/v2/?name='+ data.username
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // expecting only one profile entry
                assert.strictEqual(result.length, 1);

                assert.equal(result[0].status, 'Active');
                assert.equal(result[0].username, data.username);
                assert.equal(result[0].email, 'vdjserver@utsouthwestern.edu');

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request for profile item'));
            })
            ;
        });

        it('Create Account - verify profile metadata', function(done) {

            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

            // get the metadata item
            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/meta/v2/data?q='
                            + encodeURIComponent(
                                '{'
                                    + '"name":"profile",'
                                    + '"owner":"' + data.username + '"'
                                + '}'
                            )
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // expecting only one metadata entry, but there may be more
                // from failed tests, etc., don't make that a hard error
                assert.isAtLeast(result.length, 1);
                if (result.length != 1) console.log('Was only expecting one metadata entry, but got: ' + result.length);

                assert.isDefined(result[0].uuid);
                assert.equal(result[0].created, result[0].lastUpdated);

                var value = result[0].value;
                assert.equal(value.affiliation, 'VDJ testers');
                assert.equal(value.city, 'Vdjville');
                assert.equal(value.country, 'USA');
                assert.equal(value.email, 'vdjserver@utsouthwestern.edu');
                assert.equal(value.firstName, 'Testing');
                assert.equal(value.lastName, 'mcVDJ');
                assert.equal(value.state, 'Texas');
                assert.equal(value.username, data.username);

                data.profile_uuid = result[0].uuid;

                // check metadata permissions
                jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data/' + data.profile_uuid + '/pems'
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.equal(response.status, 'success');

                    assert.isDefined(response.result);
                    var result = response.result;
                    assert.strictEqual(result.length, 1);

                    assert.equal(result[0].username, data.username);
                    assert.deepEqual(result[0].permission, {read: true, write: true});

                    done();
                })
                .fail(function(error) {
                    console.log("response: " + JSON.stringify(error));
                    done(new Error('Failed HTTP request for metadata permissions'));
                })
                ;
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Could not fetch profile metadata'));
            })
            ;
        });

        it('Create Account - same username as unverified creation', function(done) {

            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

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
                username: data.username,
                password: EnvironmentConfig.test.password,
                passwordCheck: EnvironmentConfig.test.password,
                'g-recaptcha-response': 'skip_recaptcha'
            };

            model.set(formData);
            //model.isValid();

            model.save({
                username: formData.username,
                password: formData.password,
                email:    formData.email,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Created account with existing username"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, '1');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });
      }); // describe

      describe('Resend verification email', function()  {

        it.skip('Resend verification email - invalid username', function(done) {

            var model = new Backbone.Agave.Model.Account.ResendVerificationEmail({username: 'quyiuegnbuauejs'});

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Sent verification email with invalid username"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // TODO: vdj-api should return a better error message
                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Non-existent verification for username');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Resend verification email - invalid username', function(done) {

            var model = new Backbone.Agave.Model.Account.ResendVerificationEmail();

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Sent verification email with invalid username"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // TODO: vdj-api should return a better error message
                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Username required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Resend verification email - already active user account', function(done) {

            var model = new Backbone.Agave.Model.Account.ResendVerificationEmail({username: EnvironmentConfig.test.username});

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Sent verification email with invalid username"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'UserController.resendVerificationEmail - error - verification metadata failed comparison for ' + EnvironmentConfig.test.username);
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Resend verification email', function(done) {

            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

            var model = new Backbone.Agave.Model.Account.ResendVerificationEmail({username: data.username});

            model.save()
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done();
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Could not resend verification email"));
            })
            ;
        });

      }); // describe

      describe('Verify Account', function()  {

        it.skip('Verify New Account - invalid uuid', function(done) {

            var model = new Backbone.Agave.Model.Account.VerifyAccount({verificationId: '123456'});

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Verified account with invalid uuid"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // TODO: vdj-api should return a better error message
                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid verification id');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        // TODO: Should this be an error?
        it.skip('Verify New Account - valid uuid but for wrong account', function(done) {

            var model = new Backbone.Agave.Model.Account.VerifyAccount({verificationId: '4039667090080076261-242ac11c-0001-012'});

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Verified account with invalid uuid"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid verification id');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Verify New Account - valid uuid but for wrong metadata type', function(done) {

            //var model = new Backbone.Agave.Model.Account.VerifyAccount({verificationId: '3258481531092275686-242ac1110-0001-012'});
            var model = new Backbone.Agave.Model.Account.VerifyAccount({verificationId: '1295759335974769126-242ac1110-0001-012'});

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Verified account with invalid uuid"));
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid verification id');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Verify New Account - no verification id', function(done) {

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/verify/%20',
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'UserController.verifyUser - error - verification metadata failed comparison for  ');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Verify New Account', function(done) {

            assert.isDefined(data.new_account_uuid, 'this test requires new_account_uuid from prior test');
            assert.isNotNull(data.new_account_uuid, 'this test requires new_account_uuid from prior test');

            var model = new Backbone.Agave.Model.Account.VerifyAccount({verificationId: data.new_account_uuid});

            model.save()
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.strictEqual(response.status, 200);
                assert.equal(responseText.status, 'success');
                assert.equal(responseText.message, '');

                done();
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Could not verify account"));
            })
            ;
        });

        it('Verify New Account - verify metadata', function(done) {

            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

            // get the metadata item
            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/meta/v2/data?q='
                            + encodeURIComponent(
                                '{'
                                    + '"name":"userVerification",'
                                    + '"value.username":"' + data.username + '"'
                                + '}'
                            )
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // expecting only one metadata entry, but there may be more
                // from failed tests, etc., don't make that a hard error
                assert.isAtLeast(result.length, 1);
                if (result.length != 1) console.log('Was only expecting one metadata entry, but got: ' + result.length);

                assert.equal(result[0].owner, EnvironmentConfig.test.serviceAccountKey);
                var uuid = result[0].uuid;
                assert.isDefined(uuid);
                assert.isNotNull(uuid);
                assert.isTrue(result[0].value.isVerified);
                assert.equal(result[0].value.username, data.username);

                data.new_account_uuid = uuid;

                // check metadata permissions
                jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data/' + uuid + '/pems'
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.equal(response.status, 'success');

                    assert.isDefined(response.result);
                    var result = response.result;
                    assert.strictEqual(result.length, 1);

                    assert.equal(result[0].username, EnvironmentConfig.test.serviceAccountKey);
                    assert.deepEqual(result[0].permission, {read: true, write: true});

                    done();
                })
                .fail(function(error) {
                    console.log("response: " + JSON.stringify(error));
                    done(new Error('Failed HTTP request for metadata permissions'));
                })
                ;
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request for metadata item'));
            })
            ;
        });

        it('Login with new account', function(done) {

            assert.isDefined(data.username, 'this test requires username from prior test');
            assert.isNotNull(data.username, 'this test requires username from prior test');

            var model = App.Agave.token();
            App.Agave.destroyToken();

            // simulate form data
            var formData = {
                username: data.username,
                password: EnvironmentConfig.test.password,
            };

            model.save(formData, {password: formData.password})
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

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

                    if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(model));

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

      }); // describe

      describe('Account change password', function()  {

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                assert.equal(response.responseText, 'Unauthorized');

                done();
            })
            ;
        });

        it('Login as user1', function(done) {

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
                    if (EnvironmentConfig.debug.test) console.log(response);

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

                    if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(model));

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

        it.skip('Change password with garbage authorization', function(done) {

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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

        // TODO: Not sure if this is an error or not
        it.skip('Change password with bad access token', function(done) {

            // simulate form data
            var formData = {
                password: EnvironmentConfig.test.password,
                newPassword: EnvironmentConfig.test.password,
            };

            var auth = { 'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + 'junk') };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/change-password',
                data: JSON.stringify(formData),
                headers: auth,
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password with bad access token"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without new password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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

        it.skip('Change password with wrong password', function(done) {

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
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password with wrong password"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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

        it('Change password with direct HTTP', function(done) {

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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.strictEqual(response.status, 200);
                assert.equal(responseText.result, 'Password changed successfully.');
                assert.equal(responseText.status, 'success');
                assert.equal(responseText.message, '');

                done();
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Could not change password"));
            })
            ;
        });

        it('Change password with backbone model', function(done) {

            // simulate form data
            var formData = {
                password: EnvironmentConfig.test.password,
                newPassword: EnvironmentConfig.test.password,
            };

            var model = new Backbone.Agave.Model.PasswordChange();
            model.set(formData);

            model.callSave()
                .then(function(responseText, responseStatus, response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.isDefined(response);
                    assert.strictEqual(response.status, 200);
                    assert.equal(responseText.result, 'Password changed successfully.');
                    assert.equal(responseText.status, 'success');
                    assert.equal(responseText.message, '');

                    done();
                })
                .fail(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Could not change password"));
                })
                ;
        });
      });

      describe('Account forgot password', function()  {

        it('Forgot password with invalid username', function(done) {

            // simulate form data
            var formData = {
                username: 'garbage_user_name',
            };

            var model = new Backbone.Agave.Model.PasswordReset({uuid: null});
            model.set(formData);

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Reset password with invalid username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'PasswordResetController.createResetPasswordRequest - error - username unknown for garbage_user_name');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Forgot password without username', function(done) {

            // simulate form data
            var formData = {
                junk: 'garbage_user_name',
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/reset-password',
                data: JSON.stringify(formData),
                //headers: Backbone.Agave.basicAuthHeader(),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Reset password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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

        it('Forgot password - send email', function(done) {

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
            };

            var model = new Backbone.Agave.Model.PasswordReset({uuid: null});
            model.set(formData);

            model.save()
                .then(function(responseText, responseStatus, response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.isDefined(response);
                    assert.strictEqual(response.status, 200);
                    assert.equal(responseText.result, 'Password reset email sent.');
                    assert.equal(responseText.status, 'success');
                    assert.equal(responseText.message, '');

                    // login with the service account
                    var token = App.Agave.token();
                    App.Agave.destroyToken();

                    var serviceData = {
                        username: EnvironmentConfig.test.serviceAccountKey,
                        password: EnvironmentConfig.test.serviceAccountSecret,
                    };

                    token.save(serviceData, {password: serviceData.password})
                    .then(function(response) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(token));

                        // get the metadata item
                        var jqxhr = Backbone.Agave.ajax({
                            headers: Backbone.Agave.oauthHeader(),
                            type:   'GET',
                            url:    EnvironmentConfig.agave.hostname
                                    + '/meta/v2/data?q='
                                        + encodeURIComponent(
                                            '{'
                                                + '"name":"passwordReset",'
                                                + '"value.username":"' + EnvironmentConfig.test.username + '"'
                                            + '}'
                                        )
                        })
                        .then(function(response) {
                            if (EnvironmentConfig.debug.test) console.log(response);

                            assert.equal(response.status, 'success');

                            assert.isDefined(response.result);
                            var result = response.result;

                            // expecting only one metadata entry, but there may be more
                            // from failed tests, etc., don't make that a hard error
                            assert.isAtLeast(result.length, 1);
                            if (result.length != 1) console.log('Was only expecting one metadata entry, but got: ' + result.length);

                            assert.equal(result[0].owner, EnvironmentConfig.test.serviceAccountKey);
                            var uuid = result[0].uuid;
                            assert.isDefined(uuid);
                            assert.isNotNull(uuid);

                            data.uuid = uuid;

                            // check metadata permissions
                            jqxhr = Backbone.Agave.ajax({
                                headers: Backbone.Agave.oauthHeader(),
                                type:   'GET',
                                url:    EnvironmentConfig.agave.hostname
                                        + '/meta/v2/data/' + uuid + '/pems'
                            })
                            .then(function(response) {
                                if (EnvironmentConfig.debug.test) console.log(response);

                                assert.equal(response.status, 'success');

                                assert.isDefined(response.result);
                                var result = response.result;
                                assert.strictEqual(result.length, 1);

                                assert.equal(result[0].username, EnvironmentConfig.test.serviceAccountKey);
                                assert.deepEqual(result[0].permission, {read: true, write: true});

                                done();
                            })
                            .fail(function(error) {
                                console.log("response: " + JSON.stringify(error));
                                done(new Error('Failed HTTP request for metadata permissions'));
                            })
                            ;
                        })
                        .fail(function(error) {
                            console.log("response: " + JSON.stringify(error));
                            done(new Error('Failed HTTP request for metadata item'));
                        })
                        ;
                    })
                    .fail(function(error) {
                        console.log("login error: " + JSON.stringify(error));
                        done(new Error("Could not login."));
                    })
                    ;
                })
                .fail(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Could not reset password"));
                })
            ;
        });

        it('Forgot password - access unauthorized metadata', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // login with user account
            var token = App.Agave.token();
            App.Agave.destroyToken();

            var formData = {
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
            };

            token.save(formData, {password: formData.password})
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(token));

                // get the metadata item
                var jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data/' + data.uuid
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("User account can access metadata"));
                })
                .fail(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.isDefined(response);
                    assert.isDefined(response.responseText);
                    assert.strictEqual(response.status, 403);

                    var responseText = JSON.parse(response.responseText);
                    assert.equal(responseText.message, 'User does not have permission to read this metadata entry.');
                    assert.equal(responseText.status, 'error');

                    done();
                })
                ;
            })
            .fail(function(error) {
                console.log("login error: " + JSON.stringify(error));
                done(new Error("Could not login."));
            })
            ;
        });

        it('Forgot password - access unauthorized metadata permissions', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // login with user account
            var token = App.Agave.token();
            App.Agave.destroyToken();

            var formData = {
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
            };

            token.save(formData, {password: formData.password})
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(token));

                // get the metadata item
                var jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data/' + data.uuid + '/pems'
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("User account can access metadata permissions"));
                })
                .fail(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.isDefined(response);
                    assert.isDefined(response.responseText);
                    assert.strictEqual(response.status, 403);

                    var responseText = JSON.parse(response.responseText);
                    assert.equal(responseText.message, 'User does not have permission to view this resource');
                    assert.equal(responseText.status, 'error');

                    done();
                })
                ;
            })
            .fail(function(error) {
                console.log("login error: " + JSON.stringify(error));
                done(new Error("Could not login."));
            })
            ;
        });

        it('Forgot password - verify without username', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                //username: EnvironmentConfig.test.username,
                newPassword: EnvironmentConfig.test.password,
                uuid: data.uuid,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/reset-password/verify',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

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

        it('Forgot password - verify without uuid', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                newPassword: EnvironmentConfig.test.password,
                //uuid: data.uuid,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/reset-password/verify',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Password reset id required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Forgot password - verify without new password', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                //newPassword: EnvironmentConfig.test.password,
                uuid: data.uuid,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/reset-password/verify',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'New password required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Forgot password - verify with username of another user', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username2,
                newPassword: EnvironmentConfig.test.password,
                uuid: data.uuid,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/reset-password/verify',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'PasswordResetController.processResetPasswordRequest - error - reset metadata uuid does not match.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Forgot password - verify with garbage username', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: 'garbage',
                newPassword: EnvironmentConfig.test.password,
                uuid: data.uuid,
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/reset-password/verify',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'PasswordResetController.processResetPasswordRequest - error - reset metadata uuid does not match.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Forgot password - verify with garbage uuid', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                newPassword: EnvironmentConfig.test.password,
                uuid: 'garbage',
            };

            var jqxhr = Backbone.Agave.ajax({
                type:   'POST',
                url:    EnvironmentConfig.vdjApi.hostname
                        + '/user/reset-password/verify',
                data: JSON.stringify(formData),
                contentType: 'application/json',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Changed password without username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // TODO: vdj-api should handle this error better
                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid metadata id.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Forgot password - set new password', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                newPassword: EnvironmentConfig.test.password,
                passwordCheck: EnvironmentConfig.test.password,
                uuid: data.uuid,
            };

            var model = new Backbone.Agave.Model.PasswordReset({uuid: data.uuid});
            model.set(formData);

            model.save()
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.strictEqual(response.status, 200);
                assert.equal(responseText.result, 'Password reset successfully.');
                assert.equal(responseText.status, 'success');
                assert.equal(responseText.message, '');

                done();
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Could not reset password"));
            })
            ;
        });

        it('Forgot password - verify deleted metadata', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // login with service account
            var token = App.Agave.token();
            App.Agave.destroyToken();

            var formData = {
                username: EnvironmentConfig.test.serviceAccountKey,
                password: EnvironmentConfig.test.serviceAccountSecret,
            };

            token.save(formData, {password: formData.password})
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(token));

                // get the metadata item
                var jqxhr = Backbone.Agave.ajax({
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data/' + data.uuid
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("User account can access metadata"));
                })
                .fail(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.isDefined(response);
                    assert.isDefined(response.responseText);
                    assert.strictEqual(response.status, 404);

                    var responseText = JSON.parse(response.responseText);
                    assert.equal(responseText.message, 'No metadata item found for user with id ' + data.uuid);
                    assert.equal(responseText.status, 'error');

                    done();
                })
                ;
            })
            .fail(function(error) {
                console.log("login error: " + JSON.stringify(error));
                done(new Error("Could not login."));
            })
            ;
        });

        it.skip('Forgot password - set new password with stale uuid', function(done) {

            assert.isDefined(data.uuid, 'this test requires uuid from prior test');
            assert.isNotNull(data.uuid, 'this test requires uuid from prior test');

            should.exist(App);
            App.init();
            should.exist(App.Agave);

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                newPassword: EnvironmentConfig.test.password,
                passwordCheck: EnvironmentConfig.test.password,
                uuid: data.uuid,
            };

            var model = new Backbone.Agave.Model.PasswordReset({uuid: data.uuid});
            model.set(formData);

            model.save()
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Reset password with stale uuid"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // TODO: vdj-api should handle this error better
                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid metadata id.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

      }); // describe

      describe('Account change profile', function()  {

        it('Login as user1', function(done) {

            var model = App.Agave.token();
            App.Agave.destroyToken();

            // simulate form data
            var formData = {
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
            };

            model.save(formData, {password: formData.password})
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

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

                    if (EnvironmentConfig.debug.test) console.log("token is: " + JSON.stringify(model));

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

        it('Fetch account profile', function(done) {

            var model = new Backbone.Agave.Model.Profile();

            model.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(model.get('value'));
                var value = model.get('value');

                assert.equal(value.email, 'vdjserver@utsouthwestern.edu');

                // simulate form data
                var formData = {
                    value: {
                        firstName: (Math.round(Math.random() * 0x10000)).toString(16),
                        lastName:  (Math.round(Math.random() * 0x10000)).toString(16),
                        email: 'vdjserver@utsouthwestern.edu',
                        city:      (Math.round(Math.random() * 0x10000)).toString(16),
                        state:     (Math.round(Math.random() * 0x10000)).toString(16),
                        country:   (Math.round(Math.random() * 0x10000)).toString(16),
                        affiliation: (Math.round(Math.random() * 0x10000)).toString(16)
                    }
                };
                data.profile = formData;

                model.save(formData, {url: model.getSaveUrl()})
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.isDefined(response);
                    assert.equal(response.result.uuid, model.get('uuid'));

                    done();
                })
                .fail(function(error) {
                    console.log(error);
                    done(new Error("Could not save profile."));
                })
                ;
            })
            .fail(function(error) {
                console.log(error);
                done(new Error("Could not fetch profile."));
            })
            ;
        });

        it('Verify account profile', function(done) {
            assert.isDefined(data.profile, 'this test requires profile data from prior test');
            assert.isNotNull(data.profile, 'this test requires profile data from prior test');

            var model = new Backbone.Agave.Model.Profile();

            model.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(model.get('value'));
                var value = model.get('value');

                assert.equal(value.firstName, data.profile.value.firstName);
                assert.equal(value.lastName, data.profile.value.lastName);
                assert.equal(value.email, data.profile.value.email);
                assert.equal(value.city, data.profile.value.city);
                assert.equal(value.state, data.profile.value.state);
                assert.equal(value.country, data.profile.value.country);
                assert.equal(value.affiliation, data.profile.value.affiliation);

                done();
            })
            .fail(function(error) {
                console.log(error);
                done(new Error("Could fetch profile."));
            })
            ;
        });

      }); // describe

    }); // describe

});
