define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Projects)', function()  {
        this.timeout(50000);

        it('Should be able to login', function(done) {

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

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

        var data = {};

        it('Create a new project', function(done) {

            should.exist(Backbone.Agave.Model.Project);
            var model = new Backbone.Agave.Model.Project();

            // simulate form data
            var formData = {
                name:  'My project'
            };

            model.setAttributesFromFormData(formData);

            model.save()
                .then(function(response) {
                    if (EnvironmentConfig.debug.console) console.log(response);
                    if (EnvironmentConfig.debug.console) console.log(model);

                    assert.equal(model.get('name'), 'project', 'name attribute');
                    assert.equal(model.get('projectName'), formData.name, 'project name');
                    assert.equal(model.get('created'), model.get('lastUpdated'), 'data fields');
                    assert.equal(model.get('owner'), 'vdj', 'owner attribute');
                    assert.equal(model.get('username'), EnvironmentConfig.test.username, 'username attribute');
                    assert.isDefined(model.get('uuid'), 'id attribute');
                    assert.isNotNull(model.get('uuid'), 'id attribute');
                    assert.isDefined(model.get('value'), 'value attribute');

                    data['project'] = model;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not create new project."));
                })
                ;
        });

        it('Check project permissions', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.console) console.log(response);
                    if (EnvironmentConfig.debug.console) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.equal(permissions.uuid, model.get('uuid'));

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var perm = permissions.at(0);
                    assert.equal(perm.get('username'), EnvironmentConfig.test.username);
                    assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    assert.equal(perm.uuid, model.get('uuid'));

                    perm = permissions.at(1);
                    assert.equal(perm.get('username'), 'vdj');
                    assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    assert.equal(perm.uuid, model.get('uuid'));

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get project permissions."));
                })
                ;
        });

        it('Check for project directories', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/listings/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid')
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // current plus 3 project directories
                assert.strictEqual(result.length, 4);
                var foundAnalyses = false;
                var foundDeleted = false;
                var foundFiles = false;
                for (var i = 0; i < 4; ++i) {
                    assert.equal(result[i].permissions, 'ALL');
                    assert.equal(result[i].type, 'dir');
                    assert.equal(result[i].system, EnvironmentConfig.agave.systems.storage.corral.hostname);
                    switch (result[i].name) {
                        case 'analyses': foundAnalyses = true; break;
                        case 'deleted': foundDeleted = true; break;
                        case 'files': foundFiles = true; break;
                    }
                }
                assert.isTrue(foundAnalyses);
                assert.isTrue(foundDeleted);
                assert.isTrue(foundFiles);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;

        });

        it('Check project directory (.) permissions', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/pems/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid')
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, 'vdj');
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;

        });

        it('Check project directory (analyses) permissions', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/pems/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid') + '/analyses'
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, 'vdj');
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Check project directory (deleted) permissions', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/pems/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid') + '/deleted'
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, 'vdj');
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Check project directory (files) permissions', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/pems/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid') + '/files'
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.console) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, 'vdj');
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Delete the project', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            model.destroy()
                .then(function(response) {
                    if (EnvironmentConfig.debug.console) console.log(response);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not delete project."));
                })
                ;
        });

    });

});
