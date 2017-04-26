define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Files)', function()  {
        this.timeout(500000);

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

        it('Create another new project', function(done) {

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

                    data['anotherProject'] = model;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not create new project."));
                })
                ;
        });

        it('New project has no files', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function() {
                    // paginated fetch no longer returns a response object

                    assert.strictEqual(projectFiles.length, 0);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get file metadata."));
                })
                ;
        });

        it('Upload local file', function(done) {

            this.timeout(50000);

            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            var model = data.project;

            App.Instances.WebsocketManager.subscribeToEvent(model.get('uuid'));

            model.listenTo(App.Instances.WebsocketManager, 'updateFileImportProgress', function(fileMetadataResponse) {
                if (EnvironmentConfig.debug.test) console.log('updateFileImportProgress:');
                if (EnvironmentConfig.debug.test) console.log(fileMetadataResponse);

                assert.isDefined(fileMetadataResponse);
                assert.isNotNull(fileMetadataResponse);
                assert.equal(fileMetadataResponse.fileInformation.projectUuid, model.get('uuid'));
                assert.equal(fileMetadataResponse.fileInformation.tags, '');
                assert.equal(fileMetadataResponse.fileInformation.readDirection, '');
            });

            model.listenTo(App.Instances.WebsocketManager, 'addFileToProject', function(fileMetadataResponse) {
                if (EnvironmentConfig.debug.test) console.log('addFileToProject:');
                if (EnvironmentConfig.debug.test) console.log(fileMetadataResponse);

                assert.isDefined(fileMetadataResponse);
                assert.isNotNull(fileMetadataResponse);
                assert.isDefined(fileMetadataResponse.uuid);
                assert.isNotNull(fileMetadataResponse.uuid);
                assert.equal(fileMetadataResponse.owner, EnvironmentConfig.test.serviceAccountKey);
                assert.equal(fileMetadataResponse.name, 'projectFile');
                assert.equal(fileMetadataResponse.created, fileMetadataResponse.lastUpdated, 'data fields');
                assert.equal(fileMetadataResponse.value.projectUuid, model.get('uuid'));
                assert.deepEqual(fileMetadataResponse.value.publicAttributes.tags, []);
                assert.equal(fileMetadataResponse.value.readDirection, '');
                assert.equal(fileMetadataResponse.value.name, 'blob');
                assert.isFalse(fileMetadataResponse.value.isDeleted);

                data.fileUuid = fileMetadataResponse.uuid;
                model.stopListening();

                done();
            });

            model.listenTo(App.Instances.WebsocketManager, 'fileImportError', function(fileMetadataResponse) {
                if (EnvironmentConfig.debug.test) console.log('fileImportError hit:');
                if (EnvironmentConfig.debug.test) console.log(fileMetadataResponse);
                model.stopListening();

                done(new Error('Could not upload file.'));
            });

            var blob = new Blob(['test123456'], {type: 'text/plain'});

            var agaveFile = new Backbone.Agave.Model.File.ProjectFile({
                name: 'blob',
                length: 11,
                lastModified: 'Thu Jun 18 2015 15:17:36 GMT-0500 (CDT)',
                projectUuid: model.get('uuid'),
                fileReference: blob,
                formElementGuid: '12345',
            });

            assert.isDefined(agaveFile);
            assert.isNotNull(agaveFile);

            agaveFile.save()
                .then(function() {
                    data.agaveFile = agaveFile;

                    return agaveFile.notifyApiUploadComplete();
                })
                .then(function() {
                    var notificationData = agaveFile.getFileStagedNotificationData();

                    if (EnvironmentConfig.debug.test) console.log('stagedNotificationData:');
                    if (EnvironmentConfig.debug.test) console.log(notificationData);

                })
                .fail(function(error) {
                    done(new Error('Could not upload file.'));
                })
                ;

        });

        it('New project has one file', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fileUuid, 'this test requires file uuid from prior test');

            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function() {
                    // paginated fetch no longer returns a response object

                    assert.strictEqual(projectFiles.length, 1);
                    var agaveFile = projectFiles.at(0);

                    assert.equal(agaveFile.get('uuid'), data.fileUuid);
                    assert.equal(agaveFile.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                    assert.equal(agaveFile.get('name'), 'projectFile');
                    assert.equal(agaveFile.get('created'), agaveFile.get('lastUpdated'), 'data fields');

                    var value = agaveFile.get('value');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.deepEqual(value.publicAttributes.tags, []);
                    //assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_UNSPECIFIED);
                    assert.equal(value.readDirection, '');
                    assert.equal(value.name, 'blob');
                    assert.isFalse(value.isDeleted);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get file metadata."));
                })
                ;
        });

        it('Upload file from URL', function(done) {

            this.timeout(200000);

            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            var model = data.project;

            App.Instances.WebsocketManager.subscribeToEvent(model.get('uuid'));

            model.listenTo(App.Instances.WebsocketManager, 'updateFileImportProgress', function(fileMetadataResponse) {
                if (EnvironmentConfig.debug.test) console.log('updateFileImportProgress:');
                if (EnvironmentConfig.debug.test) console.log(fileMetadataResponse);

                assert.isDefined(fileMetadataResponse);
                assert.isNotNull(fileMetadataResponse);
                assert.equal(fileMetadataResponse.fileInformation.projectUuid, model.get('uuid'));
                assert.equal(fileMetadataResponse.fileInformation.vdjFileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ);
                assert.equal(fileMetadataResponse.fileInformation.tags, 'test file');
                assert.equal(fileMetadataResponse.fileInformation.readDirection, 'F');
            });

            model.listenTo(App.Instances.WebsocketManager, 'addFileToProject', function(fileMetadataResponse) {
                if (EnvironmentConfig.debug.test) console.log('addFileToProject:');
                if (EnvironmentConfig.debug.test) console.log(fileMetadataResponse);

                assert.isDefined(fileMetadataResponse);
                assert.isNotNull(fileMetadataResponse);
                assert.isDefined(fileMetadataResponse.uuid);
                assert.isNotNull(fileMetadataResponse.uuid);
                assert.equal(fileMetadataResponse.owner, EnvironmentConfig.test.serviceAccountKey);
                assert.equal(fileMetadataResponse.name, 'projectFile');
                assert.equal(fileMetadataResponse.created, fileMetadataResponse.lastUpdated, 'data fields');
                assert.equal(fileMetadataResponse.value.projectUuid, model.get('uuid'));
                assert.deepEqual(fileMetadataResponse.value.publicAttributes.tags, ['test file']);
                assert.equal(fileMetadataResponse.value.readDirection, 'F');
                assert.equal(fileMetadataResponse.value.name, 'all_plates.fastq');
                assert.isFalse(fileMetadataResponse.value.isDeleted);

                data.fileUuid = fileMetadataResponse.uuid;
                model.stopListening();

                done();
            });

            model.listenTo(App.Instances.WebsocketManager, 'fileImportError', function(fileMetadataResponse) {
                if (EnvironmentConfig.debug.test) console.log('fileImportError hit:');
                if (EnvironmentConfig.debug.test) console.log(fileMetadataResponse);
                model.stopListening();

                done(new Error('Could not upload file.'));
            });

            var agaveFile = new Backbone.Agave.Model.File.UrlImport({
                projectUuid: model.get('uuid'),
                urlToIngest: 'http://wiki.vdjserver.org/test/all_plates.fastq'
            });
            assert.isDefined(agaveFile);
            assert.isNotNull(agaveFile);

            agaveFile.set('vdjFileType', Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ);
            agaveFile.set('tags', 'test file');
            agaveFile.set('readDirection', 'F');
            agaveFile.save()
                .then(function() {
                    data.agaveFile = agaveFile;

                    return agaveFile.notifyApiUploadComplete();

                })
                .then(function() {
                    var notificationData = agaveFile.getFileStagedNotificationData();

                    if (EnvironmentConfig.debug.test) console.log('stagedNotificationData:');
                    if (EnvironmentConfig.debug.test) console.log(notificationData);

                })
                .fail(function(error) {
                    done(new Error('Could not upload file.'));
                })
                ;

        });

        it('New project has two files', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fileUuid, 'this test requires file uuid from prior test');

            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function() {
                    // paginated fetch no longer returns a response object

                    assert.strictEqual(projectFiles.length, 2);
                    var agaveFile = projectFiles.at(0);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(1);

                    assert.equal(agaveFile.get('uuid'), data.fileUuid);
                    assert.equal(agaveFile.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                    assert.equal(agaveFile.get('name'), 'projectFile');
                    assert.equal(agaveFile.get('created'), agaveFile.get('lastUpdated'), 'data fields');

                    var value = agaveFile.get('value');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.deepEqual(value.publicAttributes.tags, ['test file']);
                    assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ);
                    assert.equal(value.readDirection, 'F');
                    assert.equal(value.name, 'all_plates.fastq');
                    assert.isFalse(value.isDeleted);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get file metadata."));
                })
                ;
        });

        it('Notify vdj-api upload, already notified', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

      					assert.equal(response.status, 'success');

                done();
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                console.log("response error: " + JSON.stringify(error));
                done(new Error("vdj-api notification returned error."));
            })
            ;
        });

        it('New project has two files', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fileUuid, 'this test requires file uuid from prior test');

            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function() {
                    // paginated fetch no longer returns a response object

                    assert.strictEqual(projectFiles.length, 2);
                    var agaveFile = projectFiles.at(0);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(1);

                    assert.equal(agaveFile.get('uuid'), data.fileUuid);
                    assert.equal(agaveFile.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                    assert.equal(agaveFile.get('name'), 'projectFile');
                    assert.equal(agaveFile.get('created'), agaveFile.get('lastUpdated'), 'data fields');

                    var value = agaveFile.get('value');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.deepEqual(value.publicAttributes.tags, ['test file']);
                    assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ);
                    assert.equal(value.readDirection, 'F');
                    assert.equal(value.name, 'all_plates.fastq');
                    assert.isFalse(value.isDeleted);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get file metadata."));
                })
                ;
        });

        it('Notify vdj-api upload without file uuid', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        //+ '?fileUuid=' + agaveFile.get('uuid')
                        + '?path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload without file uuid did not return error"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Notify vdj-api upload with wrong file uuid', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + model.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // Error is not thrown until notification is put in queue
                // and the queue checks the file, so no way for us to verify
                done();
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload with wrong file uuid"));
            })
            ;
        });

        it('Notify vdj-api upload with invalid file uuid', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + 'bogus_uuid'
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // Error is not thrown until notification is put in queue
                // and the queue checks the file, so no way for us to verify
                done();
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload with invalid file uuid"));
            })
            ;
        });

        it('Notify vdj-api upload without project uuid', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        //+ '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload without project uuid did not return error"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 400);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Project uuid required.');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Notify vdj-api upload with mismatch project uuid', function(done) {
            assert.isDefined(data.anotherProject, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.anotherProject;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + model.get('uuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload without project uuid did not return error"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                //assert.equal(responseText.message, 'Unauthorized');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Notify vdj-api upload without file path', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        //+ '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload without project uuid did not return error"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                //assert.equal(responseText.message, 'Unauthorized');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it('Notify vdj-api upload with file path to directory', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + '/vdjZ/projects/' + agaveFile.get('projectUuid') + '/files'
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // Error is not thrown until notification is put in queue
                // and the queue checks the file, so no way for us to verify
                done();
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload with file path to directory"));
            })
            ;
        });

        it('Notify vdj-api upload with file path outside of project', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + '/vdjZ/apps'
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload without project uuid did not return error"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 500);

                var responseText = JSON.parse(response.responseText);
                //assert.equal(responseText.message, 'Unauthorized');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        //
        // Put 401 Unauthorized tests at the end because they tend
        // to cause other error tests (i.e. the ones above) to also return 401
        //
        it.skip('Notify vdj-api upload with wrong project uuid', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('uuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload without project uuid did not return error"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Unauthorized');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Notify vdj-api upload with invalid project uuid', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + 'bogus_uuid'
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload without project uuid did not return error"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.message, 'Unauthorized');
                assert.equal(responseText.status, 'error');

                done();
            })
            ;
        });

        it.skip('Notify vdj-api upload - missing authorization', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                //headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Notify vdj-api upload - missing authorization"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                // mocha-phantomjs sometimes cancels this operation
                // when the server returns unauthorized
                // so do not strictly enforce the response.
                if (!response) console.log('Was expecting error response, but it is undefined.');
                else {
                    if (!response.responseText) console.log('Was expecting error responseText, but it is undefined.');
                    if (response.status != 401) console.log('Was expecting error response status = 401, but it is ' + response.status);
                }

                done();
            })
            ;
        });

        it.skip('Notify vdj-api upload - authorization bad username', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: { 'Authorization': 'Basic ' + btoa('bogus_username' + ':' + Backbone.Agave.instance.token().get('access_token')) },
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Imported subject metadata - authorization bad username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.status, 'error');
                assert.equal(responseText.message, 'Unauthorized');

                done();
            })
            ;
        });

        it.skip('Notify vdj-api upload - authorization bad token', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: { 'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + 'junk_token') },
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Imported subject metadata - authorization bad username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.status, 'error');
                assert.equal(responseText.message, 'Unauthorized');

                done();
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

        it.skip('Notify vdj-api upload - not authorized', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.agaveFile, 'this test requires file from prior test');

            var model = data.project;
            var agaveFile = data.agaveFile;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/notifications'
                        + '/files'
                        + '/import'
                        + '?fileUuid=' + agaveFile.get('uuid')
                        + '&path=' + agaveFile.get('path')
                        + '&projectUuid=' + agaveFile.get('projectUuid')
                        + '&vdjFileType=' + agaveFile.get('vdjFileType')
                        + '&readDirection=' + agaveFile.get('readDirection')
                        + '&tags=' + encodeURIComponent(agaveFile.get('tags'))
                        ,
                type: 'POST',
                processData: false,
                contentType: false,
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                done(new Error("Imported subject metadata - authorization bad username"));
            })
            .fail(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.isDefined(response);
                assert.isDefined(response.responseText);
                assert.strictEqual(response.status, 401);

                var responseText = JSON.parse(response.responseText);
                assert.equal(responseText.status, 'error');
                assert.equal(responseText.message, 'Unauthorized');

                done();
            })
            ;
        });

        it.skip('Delete the project', function(done) {
            assert.isDefined(data.project);
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

    }); // describe

});
