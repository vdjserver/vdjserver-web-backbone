/*global describe, it */

define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Setup)', function()  {
        this.timeout(5000);

        it('EnvironmentConfig is defined', function() {
            assert.isDefined(EnvironmentConfig);
        });

        it('EnvironmentConfig.test is defined', function() {
            assert.isDefined(EnvironmentConfig.test);
            assert.isDefined(EnvironmentConfig.test.username);
            assert.isDefined(EnvironmentConfig.test.password);
        });

        it('EnvironmentConfig.agave is defined', function() {
            assert.isDefined(EnvironmentConfig.agave);
        });

        it('EnvironmentConfig.vdjApi is defined', function() {
            assert.isDefined(EnvironmentConfig.vdjApi);
        });

        it('Should be able to login', function(done) {

            should.exist(App);
            App.init();

            should.exist(App.Agave);

            var model = App.Agave.token();
            App.Agave.destroyToken();

            // TODO: need to pull this in from config/env
            var formData = {
                username: EnvironmentConfig.test.username,
                password: EnvironmentConfig.test.password,
            };

            model.save(formData, {password: formData.password})
                .then(function(doneModel) {
                    //assert.strictEqual(jqXHR.statusCode, 200);

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

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/systems/v2'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
            })
            .then(function(response) {
                //console.log(response);
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

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/systems/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.ls5.hostname
            })
            .then(function(response) {
                //console.log(response);
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

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/systems/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.vdjExec02.hostname
            })
            .then(function(response) {
                //console.log(response);
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

        it('Check for execution system (' + EnvironmentConfig.agave.systems.execution.stampede.hostname + ')', function(done) {

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/systems/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.stampede.hostname
            })
            .then(function(response) {
                //console.log(response);
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

        it('Check for application (' + EnvironmentConfig.agave.systems.execution.ls5.apps.igBlast + ')', function(done) {

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/apps/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.ls5.apps.igBlast
            })
            .then(function(response) {
                console.log(response);
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

        it('Check for application (' + EnvironmentConfig.agave.systems.execution.ls5.apps.vdjPipe + ')', function(done) {

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/apps/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.ls5.apps.vdjPipe
            })
            .then(function(response) {
                console.log(response);
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

        it('Check for application (' + EnvironmentConfig.agave.systems.execution.stampede.apps.igBlast + ')', function(done) {

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/apps/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.stampede.apps.igBlast
            })
            .then(function(response) {
                console.log(response);
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

        it('Check for application (' + EnvironmentConfig.agave.systems.execution.stampede.apps.vdjPipe + ')', function(done) {

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/apps/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.stampede.apps.vdjPipe
            })
            .then(function(response) {
                console.log(response);
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

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/apps/v2'
                        + '/' + EnvironmentConfig.agave.systems.execution.vdjExec02.apps.vdjPipe
            })
            .then(function(response) {
                console.log(response);
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
    });

});
