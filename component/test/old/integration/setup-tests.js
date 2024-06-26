
'use strict';

//
// setup-tests.js
// Integration tests
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import { Agave } from 'backbone-agave';

import chai from 'chai';
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

//
// Setup tests
//
// Verify that that EnvironmentConfig has appropriate values
// and that critical Tapis systems and test accounts can be accessed.
//

//
// If these setup tests fail, we do not want to run the others tests
// so use global variable to convey that.
//
global.SetupTestsPassed = true;

export default function suite() {

    this.timeout(5000);

    it('EnvironmentConfig is defined', function() {
        assert.isDefined(EnvironmentConfig);
    });

    it('EnvironmentConfig.test is defined', function() {
        assert.isDefined(EnvironmentConfig.test);
        assert.isDefined(EnvironmentConfig.test.serviceAccountKey);
        assert.isDefined(EnvironmentConfig.test.serviceAccountSecret);
    });

    it('EnvironmentConfig.agave is defined', function() {
        assert.isDefined(EnvironmentConfig.agave);
        assert.isDefined(EnvironmentConfig.agave.hostname);
    });

    it('EnvironmentConfig.vdjApi is defined', function() {
        assert.isDefined(EnvironmentConfig.vdjApi);
        assert.isDefined(EnvironmentConfig.vdjApi.hostname);
    });

    it('Should be able to login with service account at ' + EnvironmentConfig.vdjApi.hostname, function(done) {

        should.exist(App);

        should.exist(App.Agave);

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

                done();
            })
            .fail(function(error) {
                console.log("login error: " + JSON.stringify(error));
                done(new Error("Could not login."));
            })
            ;
    });

    it('Check for storage system (' + EnvironmentConfig.agave.systems.storage.corral.hostname + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/systems/v2'
                    + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.equal(result.type, 'STORAGE');
            assert.isDefined(result.uuid);
            assert.equal(result.status, 'UP');
            assert.equal(result.id, EnvironmentConfig.agave.systems.storage.corral.hostname);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it('Check for execution system (' + EnvironmentConfig.agave.systems.execution.ls5.hostname + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/systems/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.ls5.hostname
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.equal(result.type, 'EXECUTION');
            assert.isDefined(result.uuid);
            assert.equal(result.status, 'UP');
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.ls5.hostname);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it('Check for execution system (' + EnvironmentConfig.agave.systems.execution.vdjExec02.hostname + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/systems/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.vdjExec02.hostname
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.equal(result.type, 'EXECUTION');
            assert.isDefined(result.uuid);
            assert.equal(result.status, 'UP');
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.vdjExec02.hostname);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it.skip('Check for execution system (' + EnvironmentConfig.agave.systems.execution.stampede.hostname + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/systems/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.stampede.hostname
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.equal(result.type, 'EXECUTION');
            assert.isDefined(result.uuid);
            assert.equal(result.status, 'UP');
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.stampede.hostname);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it.skip('Check for application (' + EnvironmentConfig.agave.systems.execution.ls5.apps.igBlast + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/apps/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.ls5.apps.igBlast
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.isDefined(result.uuid);
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.ls5.apps.igBlast);
            assert.equal(result.deploymentSystem, EnvironmentConfig.agave.systems.storage.corral.hostname);
            assert.equal(result.executionSystem, EnvironmentConfig.agave.systems.execution.ls5.hostname);
            assert.isTrue(result.available);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it.skip('Check for application (' + EnvironmentConfig.agave.systems.execution.ls5.apps.vdjPipe + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/apps/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.ls5.apps.vdjPipe
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.isDefined(result.uuid);
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.ls5.apps.vdjPipe);
            assert.equal(result.deploymentSystem, EnvironmentConfig.agave.systems.storage.corral.hostname);
            assert.equal(result.executionSystem, EnvironmentConfig.agave.systems.execution.ls5.hostname);
            assert.isTrue(result.available);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it.skip('Check for application (' + EnvironmentConfig.agave.systems.execution.stampede.apps.igBlast + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/apps/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.stampede.apps.igBlast
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.isDefined(result.uuid);
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.stampede.apps.igBlast);
            assert.equal(result.deploymentSystem, EnvironmentConfig.agave.systems.storage.corral.hostname);
            assert.equal(result.executionSystem, EnvironmentConfig.agave.systems.execution.stampede.hostname);
            assert.isTrue(result.available);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it.skip('Check for application (' + EnvironmentConfig.agave.systems.execution.stampede.apps.vdjPipe + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/apps/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.stampede.apps.vdjPipe
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.isDefined(result.uuid);
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.stampede.apps.vdjPipe);
            assert.equal(result.deploymentSystem, EnvironmentConfig.agave.systems.storage.corral.hostname);
            assert.equal(result.executionSystem, EnvironmentConfig.agave.systems.execution.stampede.hostname);
            assert.isTrue(result.available);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it('Check for application (' + EnvironmentConfig.agave.systems.execution.vdjExec02.apps.vdjPipe + ')', function(done) {

        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/apps/v2'
                    + '/' + EnvironmentConfig.agave.systems.execution.vdjExec02.apps.vdjPipe
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            assert.isDefined(result.uuid);
            assert.equal(result.id, EnvironmentConfig.agave.systems.execution.vdjExec02.apps.vdjPipe);
            assert.equal(result.deploymentSystem, EnvironmentConfig.agave.systems.storage.corral.hostname);
            assert.equal(result.executionSystem, EnvironmentConfig.agave.systems.execution.vdjExec02.hostname);
            assert.isTrue(result.available);

            done();
        })
        .fail(function(error) {
            console.log("response: " + JSON.stringify(error));
            done(new Error('Failed HTTP request'));
        })
        ;

    });

    it('Create user1 account if necessary', function(done) {

        // check the profile
        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/profiles/v2/?name='+ EnvironmentConfig.test.username
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            if (result.length == 1) return done();

            console.log('Creating account for username: ' + EnvironmentConfig.test.username);
            var model = new Agave.Model.Account.NewAccount();

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

            model.save({
                username: formData.username,
                password: formData.password,
                email:    formData.email,
            })
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.strictEqual(response.status, 200);
                assert.equal(responseText.result.username, EnvironmentConfig.test.username);
                assert.equal(responseText.result.email, 'vdjserver@utsouthwestern.edu');
                assert.equal(responseText.status, 'success');
                assert.equal(responseText.message, '');

                // get the metadata item
                var jqxhr = Agave.ajax({
                    headers: Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data?q='
                                + encodeURIComponent(
                                    '{'
                                        + '"name":"userVerification",'
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
                    assert.isFalse(result[0].value.isVerified);
                    assert.equal(result[0].value.username, EnvironmentConfig.test.username);

                    var model = new Agave.Model.Account.VerifyAccount({verificationId: uuid});

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
                })
                .fail(function(response, errorText, errorThrown) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Could not create account"));
                });
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Could not create account"));
            });
        })
        .fail(function(response, errorText, errorThrown) {
            if (EnvironmentConfig.debug.test) console.log(response);

            done(new Error("Could not create account"));
        });
    });

    it('Should be able to login as user1', function(done) {

        should.exist(App);

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

                done();
            })
            .fail(function(error) {
                console.log("login error: " + JSON.stringify(error));
                done(new Error("Could not login."));
            })
            ;
    });

    it('Should be able to login with service account', function(done) {

        should.exist(App);

        should.exist(App.Agave);

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

                done();
            })
            .fail(function(error) {
                console.log("login error: " + JSON.stringify(error));
                done(new Error("Could not login."));
            })
            ;
    });

    it('Create user2 account if necessary', function(done) {

        // check the profile
        var jqxhr = Agave.ajax({
            headers: Agave.oauthHeader(),
            type:   'GET',
            url:    EnvironmentConfig.agave.hostname
                    + '/profiles/v2/?name='+ EnvironmentConfig.test.username2
        })
        .then(function(response) {
            if (EnvironmentConfig.debug.test) console.log(response);

            assert.equal(response.status, 'success');

            assert.isDefined(response.result);
            var result = response.result;

            if (result.length == 1) return done();

            console.log('Creating account for username: ' + EnvironmentConfig.test.username2);
            var model = new Agave.Model.Account.NewAccount();

            // simulate form data
            var formData = {
                firstName: 'Testing',
                lastName: 'mcVDJ',
                email: 'vdjserver@utsouthwestern.edu',
                city: 'Vdjville',
                state: 'Texas',
                country: 'USA',
                affiliation: 'VDJ testers',
                username: EnvironmentConfig.test.username2,
                password: EnvironmentConfig.test.password2,
                passwordCheck: EnvironmentConfig.test.password2,
                'g-recaptcha-response': 'skip_recaptcha'
            };

            model.set(formData);

            model.save({
                username: formData.username,
                password: formData.password,
                email:    formData.email,
            })
            .then(function(responseText, responseStatus, response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.strictEqual(response.status, 200);
                assert.equal(responseText.result.username, EnvironmentConfig.test.username2);
                assert.equal(responseText.result.email, 'vdjserver@utsouthwestern.edu');
                assert.equal(responseText.status, 'success');
                assert.equal(responseText.message, '');

                // get the metadata item
                var jqxhr = Agave.ajax({
                    headers: Agave.oauthHeader(),
                    type:   'GET',
                    url:    EnvironmentConfig.agave.hostname
                            + '/meta/v2/data?q='
                                + encodeURIComponent(
                                    '{'
                                        + '"name":"userVerification",'
                                        + '"value.username":"' + EnvironmentConfig.test.username2 + '"'
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
                    assert.equal(result[0].value.username, EnvironmentConfig.test.username2);

                    var model = new Agave.Model.Account.VerifyAccount({verificationId: uuid});

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
                })
                .fail(function(response, errorText, errorThrown) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Could not create account"));
                });
            })
            .fail(function(response, errorText, errorThrown) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Could not create account"));
            });
        })
        .fail(function(response, errorText, errorThrown) {
            if (EnvironmentConfig.debug.test) console.log(response);

            done(new Error("Could not create account"));
        });
    });

    it('Should be able to login as user2', function(done) {

        should.exist(App);

        should.exist(App.Agave);

        var model = App.Agave.token();
        App.Agave.destroyToken();

        // simulate form data
        var formData = {
            username: EnvironmentConfig.test.username2,
            password: EnvironmentConfig.test.password2,
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

                done();
            })
            .fail(function(error) {
                console.log("login error: " + JSON.stringify(error));
                done(new Error("Could not login."));
            })
            ;
    });

    afterEach(function() {
      if (this.currentTest.state === 'failed') {
        // if any test fails, record to skip downstream tests
        global.SetupTestsPassed = false;
      }
    });
}
