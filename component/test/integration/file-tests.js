define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Files)', function()  {
        this.timeout(50000);

        it('Should be able to login', function(done) {

            should.exist(App);
            App.init();
            App.Instances.WebsocketManager = new App.Utilities.WebsocketManager();

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

        it('New project has no files', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.console) console.log(response);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.strictEqual(projectFiles.length, 0);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not delete project."));
                })
                ;
        });

        it('Upload file from URL', function(done) {
            assert.isDefined(data.project);
            var model = data.project;

            model.listenTo(App.Instances.WebsocketManager, 'addFileImportPlaceholder', function(fileMetadataResponse) {
                console.log('got addFileImportPlaceholder');
            });

            model.listenTo(App.Instances.WebsocketManager, 'updateFileImportProgress', function(fileMetadataResponse) {
                console.log('got updateFileImportProgress');
            });

            model.listenTo(App.Instances.WebsocketManager, 'addFileToProject', function(fileMetadataResponse) {
                console.log('got addFileToProject');
            });

            var agaveFile = new Backbone.Agave.Model.File.UrlImport({
                projectUuid: model.get('uuid'),
                urlToIngest: 'http://wiki.vdjserver.org/test/all_plates.fastq'
            });

            agaveFile.save()
                .then(function() {
                    agaveFile.notifyApiUploadComplete()
                        .then(function() {
                            var notificationData = agaveFile.getFileStagedNotificationData();

                            if (EnvironmentConfig.debug.console) console.log(notificationData);

                        })

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not upload file."));
                })
                ;

        });


/*
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
*/
    });

});
