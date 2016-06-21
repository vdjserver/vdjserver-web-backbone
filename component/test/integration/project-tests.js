define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Projects)', function()  {
        this.timeout(100000);

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
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(model);

                    assert.equal(model.get('name'), 'project', 'name attribute');
                    assert.equal(model.get('projectName'), formData.name, 'project name');
                    assert.equal(model.get('created'), model.get('lastUpdated'), 'data fields');
                    assert.equal(model.get('owner'), EnvironmentConfig.test.serviceAccountKey, 'owner attribute');
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
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

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
                    assert.equal(perm.get('username'), EnvironmentConfig.test.serviceAccountKey);
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
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

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
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.serviceAccountKey);
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
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.serviceAccountKey);
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
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.serviceAccountKey);
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
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // two permission entries, one for the user and one for vdj account
                assert.strictEqual(result.length, 2);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.serviceAccountKey);
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

        it('Add user2 to project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            var newUserPermission = permissions.create(
                {
                    username: EnvironmentConfig.test.username2,
                    permission: 'READ_WRITE',
                    uuid: permissions.uuid,
                },
                {
                    success: function() {

                        newUserPermission.addUserToProject()
                            .then(function(response) {
                                if (EnvironmentConfig.debug.test) console.log(response);

                                done();
                            })
                            .fail(function(error) {
                                console.log("response error: " + JSON.stringify(error));
                                done(new Error("Could not add user to project."));
                            })
                            ;

                        permissions.add(newUserPermission);
                    },
                    error: function() {
                        console.log("response error: " + JSON.stringify(error));
                        done(new Error("Could not create user permission."));
                    },
                }
            );
        });

        it('Check project permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.equal(permissions.uuid, model.get('uuid'));

                    // three permission entries
                    // one for the user, one for vdj account, and one for the new user
                    assert.strictEqual(permissions.length, 3);
                    assert.strictEqual(permissions.getUserCount(), 2);

                    var perm = permissions.at(0);
                    assert.equal(perm.get('username'), EnvironmentConfig.test.username);
                    assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    assert.equal(perm.uuid, model.get('uuid'));

                    perm = permissions.at(1);
                    assert.equal(perm.get('username'), EnvironmentConfig.test.username2);
                    assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    assert.equal(perm.uuid, model.get('uuid'));

                    perm = permissions.at(2);
                    assert.equal(perm.get('username'), EnvironmentConfig.test.serviceAccountKey);
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

        it('Check project directory (.) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;

        });

        it('Check project directory (analyses) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Check project directory (deleted) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Check project directory (files) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Login as user2', function(done) {

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

        it('Check project permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.equal(permissions.uuid, model.get('uuid'));

                    // three permission entries
                    // one for the user, one for vdj account, and one for the new user
                    assert.strictEqual(permissions.length, 3);
                    assert.strictEqual(permissions.getUserCount(), 2);

                    var perm = permissions.at(0);
                    assert.equal(perm.get('username'), EnvironmentConfig.test.username);
                    assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    assert.equal(perm.uuid, model.get('uuid'));

                    perm = permissions.at(1);
                    assert.equal(perm.get('username'), EnvironmentConfig.test.username2);
                    assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    assert.equal(perm.uuid, model.get('uuid'));

                    perm = permissions.at(2);
                    assert.equal(perm.get('username'), EnvironmentConfig.test.serviceAccountKey);
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

        it('Check project directory (.) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;

        });

        it('Check project directory (analyses) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Check project directory (deleted) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Check project directory (files) permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
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
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // three permission entries
                // one for the user, one for vdj account, and one for the new user
                assert.strictEqual(result.length, 3);

                assert.equal(result[0].username, EnvironmentConfig.test.username);
                assert.deepEqual(result[0].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[0].recursive);

                assert.equal(result[1].username, EnvironmentConfig.test.username2);
                assert.deepEqual(result[1].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[1].recursive);

                assert.equal(result[2].username, EnvironmentConfig.test.serviceAccountKey);
                assert.deepEqual(result[2].permission, {read: true, write: true, execute: true});
                assert.isTrue(result[2].recursive);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;
        });

        it('Change project settings', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var value = model.get('value');

            value.description = 'This is a test project';
            value.name = 'Test Project';

            model.set('value', value);

            model.save()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done();
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not save project settings."));
            })
            ;
        });

        it('Verify project settings', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            // get model data in separate request
            var newmodel = new Backbone.Agave.Model.Project({uuid: model.get('uuid')});

            newmodel.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                var value = newmodel.get('value');
                assert.equal(value.name, 'Test Project');
                assert.equal(value.description, 'This is a test project');

                done();
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not fetch project settings."));
            })
            ;
        });

        it.skip('Add garbage user to project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            var newUserPermission = permissions.create(
                {
                    username: 'ghrequlq892hduhequfg',
                    permission: 'READ_WRITE',
                    uuid: permissions.uuid,
                },
                {
                    success: function() {

                        newUserPermission.addUserToProject()
                            .then(function(response) {
                                if (EnvironmentConfig.debug.test) console.log(response);

                                done(new Error("Added garbage user to project."));
                            })
                            .fail(function(error) {
                                console.log("response error: " + JSON.stringify(error));

                                done();
                            })
                            ;
                    },
                    error: function() {
                        console.log("response error: " + JSON.stringify(error));
                        done(new Error("Could not create user permission."));
                    },
                }
            );
        });

        it('Create user permission - missing username', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            var newUserPermission = permissions.create(
                {
                    //username: 'garbage',
                    permission: 'READ_WRITE',
                    uuid: permissions.uuid,
                },
                {
                    success: function() {
                        done(new Error("Created permission without username."));
                    },
                    error: function(error) {
                        done();
                    },
                }
            );
        });

        it('Create user permission - missing project uuid', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            var newUserPermission = permissions.create(
                {
                    username: EnvironmentConfig.test.username,
                    permission: 'READ_WRITE',
                    //uuid: permissions.uuid,
                },
                {
                    success: function() {
                        done(new Error("Created permission without project uuid."));
                    },
                    error: function(error) {
                        done();
                    },
                }
            );
        });

        it.skip('Create user permission - missing permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            var newUserPermission = permissions.create(
                {
                    username: EnvironmentConfig.test.username,
                    //permission: 'READ_WRITE',
                    uuid: permissions.uuid,
                },
                {
                    success: function() {
                        done(new Error("Created permission without permissions."));
                    },
                    error: function(error) {
                        done();
                    },
                }
            );
        });

        it('Add user to project - missing username', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Added user to project without project uuid"));
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

        it('Add user to project - missing authorization', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                    username: 'garbage'
                }),
                //headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Added user to project without authorization"));
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

        it('Add user to project - missing project uuid', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    //projectUuid: model.get('uuid'),
                    username: 'garbage'
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Added user to project without project uuid"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Project Uuid required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Add user to project - non-existent username', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                    username: 'hqiugwehrqjkldayu'
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Added user to project with non-existent username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                // TODO: vdj-api should return a better error response
                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid username.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Add user to project - invalid project uuid', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: '123456',
                    username: EnvironmentConfig.test.username
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Added user to project with non-existent username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 404);

                // TODO: vdj-api should return a better error response
                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid project.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Remove user from project - invalid project uuid', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: '123456',
                    username: EnvironmentConfig.test.username2
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'DELETE',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Remove user from project - invalid project uuid"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 404);

                // TODO: vdj-api should return a better error response
                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid project.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Remove user from project - garbage username', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                    username: 'ahagheupiohe'
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'DELETE',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Remove user from project - garbage username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 404);

                // TODO: vdj-api should return a better error response
                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid user.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Remove user from project - missing authorization', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                    username: EnvironmentConfig.test.username2
                }),
                //headers: Backbone.Agave.basicAuthHeader(),
                type: 'DELETE',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Remove user from project - missing authorization"));
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

        it.skip('Remove vdj admin account from project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);
                if (EnvironmentConfig.debug.test) console.log(permissions);

                var userPermission = permissions.findWhere({username: EnvironmentConfig.test.serviceAccountKey});

                userPermission.removeUserFromProject()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Was able to remove vdj admin account from project."));

                    userPermission.destroy()
                    .then(function(response) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done(new Error("Was able to remove vdj admin account permissions."));
                    })
                    .fail(function(error) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done();
                    })
                    ;
                })
                .fail(function(error) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done();
                })
                ;
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);
                done(new Error("Could not get project permissions."));
            })
            ;
        });

        it('Remove user1 from project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);
                if (EnvironmentConfig.debug.test) console.log(permissions);

                var userPermission = permissions.findWhere({username: EnvironmentConfig.test.username});

                userPermission.removeUserFromProject()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    userPermission.destroy()
                    .then(function(response) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done();
                    })
                    .fail(function(error) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done(new Error("Could not delete user permission."));
                    })
                    ;
                })
                .fail(function(error) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Could not remove user from project."));
                })
                ;
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not get project permissions."));
            })
            ;
        });

        it('Add same user1 back to project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            var newUserPermission = permissions.create(
                {
                    username: EnvironmentConfig.test.username,
                    permission: 'READ_WRITE',
                    uuid: permissions.uuid,
                },
                {
                    success: function() {

                        newUserPermission.addUserToProject()
                            .then(function(response) {
                                if (EnvironmentConfig.debug.test) console.log(response);

                                done();
                            })
                            .fail(function(error) {
                                console.log("response error: " + JSON.stringify(error));
                                done(new Error("Could not add user to project."));
                            })
                            ;

                        permissions.add(newUserPermission);
                    },
                    error: function() {
                        console.log("response error: " + JSON.stringify(error));
                        done(new Error("Could not create user permission."));
                    },
                }
            );
        });

        // TODO: The correct behavior of this test is not well-defined
        it.skip('Remove myself from project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);
                if (EnvironmentConfig.debug.test) console.log(permissions);

                var userPermission = permissions.findWhere({username: EnvironmentConfig.test.username2});

                userPermission.removeUserFromProject()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    userPermission.destroy()
                    .then(function(response) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done();
                    })
                    .fail(function(error) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done(new Error("Could not delete user permission."));
                    })
                    ;
                })
                .fail(function(error) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Could not remove user from project."));
                })
                ;
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not get project permissions."));
            })
            ;
        });

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

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

        it('Remove user2 from project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: model.get('uuid')});

            permissions.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);
                if (EnvironmentConfig.debug.test) console.log(permissions);

                var userPermission = permissions.findWhere({username: EnvironmentConfig.test.username2});

                userPermission.removeUserFromProject()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    userPermission.destroy()
                    .then(function(response) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done();
                    })
                    .fail(function(error) {
                        if (EnvironmentConfig.debug.test) console.log(response);

                        done(new Error("Could not delete user permission."));
                    })
                    ;
                })
                .fail(function(error) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Could not remove user from project."));
                })
                ;
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not get project permissions."));
            })
            ;
        });

        it('Login as user2', function(done) {

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

        it('Delete the project - unauthorized user', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            model.destroy()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    done(new Error("Unauthorized user was able to delete project."));
                })
                .fail(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

                    assert.isDefined(response);
                    assert.isDefined(response.responseText);
                    assert.strictEqual(response.status, 401);

                    done();
                })
                ;
        });

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

                    done();
                })
                .fail(function(error) {
                    console.log("login error: " + JSON.stringify(error));
                    done(new Error("Could not login."));
                })
                ;
        });

        it.skip('Remove user from project - valid username but not on project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                    username: EnvironmentConfig.test.username2
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'DELETE',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Remove user from project - valid username but not on project"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 404);

                // TODO: vdj-api should return a better error response
                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid user.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Delete the project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            model.destroy()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);

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

        it.skip('Add user to project - deleted project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                    username: EnvironmentConfig.test.username
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Added user to deleted project"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 404);

                // TODO: vdj-api should return a better error response
                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid project.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Remove user from project - deleted project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: model.get('uuid'),
                    username: EnvironmentConfig.test.username2
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'DELETE',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Remove user from project - deleted project"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 404);

                // TODO: vdj-api should return a better error response
                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Invalid user.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Get project settings - deleted project', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            // get model data in separate request
            var newmodel = new Backbone.Agave.Model.Project({uuid: model.get('uuid')});

            newmodel.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Fetched project settings for deleted project."));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 404);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'No metadata item found for user with id ' + model.get('uuid'));
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

    }); // describe

});
