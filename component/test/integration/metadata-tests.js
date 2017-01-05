define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Metadata)', function()  {
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
                    done(new Error("Could not delete project."));
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
                assert.equal(fileMetadataResponse.value.name, 'subject_metadata.txt');
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

            var blob = new Blob(['Name\tCategory\tSpecies\tStrain\tGender\tAge\n'
            					+ 'Person 1\tHuman\tHomo sapiens\tNA\tMale\t7\n'
            					+ 'Person 2\tHuman\tHomo sapiens\tNA\tFemale\t8\n'
            					+ 'Person 3\tHuman\tHomo sapiens\tNA\tMale\t10\n'],
            					{type: 'text/plain'});

            var agaveFile = new Backbone.Agave.Model.File.ProjectFile({
                name: 'subject_metadata.txt',
                length: blob.length,
                lastModified: 'Thu Jun 18 2015 15:17:36 GMT-0500 (CDT)',
                projectUuid: model.get('uuid'),
                vdjFileType: Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV,
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
                    assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV);
                    assert.equal(value.readDirection, '');
                    assert.equal(value.name, 'subject_metadata.txt');
                    assert.isFalse(value.isDeleted);

					data.subjectMetadataFile = agaveFile;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not delete project."));
                })
                ;
        });

        it('Upload file from URL', function(done) {

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
                data.fastqUuid = fileMetadataResponse.uuid;

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
                    done(new Error("Could not delete project."));
                })
                ;
        });

        it('Import subject metadata (replace)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.subjectMetadataFile, 'this test requires subject metadata file from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.importFromFile(data.subjectMetadataFile, 'replace')
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not import subject metadata."));
                })
                ;
        });

        it('Export subject metadata', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.createExportFile()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not export subject metadata."));
                })
                ;
        });

        it('Check for subject metadata export file', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/listings/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid')
                        + '/deleted/subject_metadata.tsv'
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // current plus 3 project directories
                assert.strictEqual(result.length, 1);
                result = result[0];
                assert.strictEqual(result.length, 157);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Could not export subject metadata.'));
            })
            ;

        });

        it('Fetch subject columns (6 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SubjectColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'subjectColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 6);
                	assert.deepEqual(result.value.columns, ["Name", "Category", "Species", "Strain", "Gender", "Age"]);

					data.subjectColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Check subject columns permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            assert.isDefined(data.subjectColsUuid, 'this test requires the subjectColumns uuid from prior test');

            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: data.subjectColsUuid});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.equal(permissions.uuid, data.subjectColsUuid);

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var found_vdj = false;
                    var found_user1 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.subjectColsUuid);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.subjectColsUuid);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get subject columns permissions."));
                })
                ;
        });

        it('Fetch subject metadata (3 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(subjectMetadata);

                    assert.strictEqual(subjectMetadata.length, 3);
					data.subjectMetadata = subjectMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Check subject metadata permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            assert.isDefined(data.subjectMetadata, 'this test requires the subject metadata from prior test');

            var model = data.project;

			var uuids = data.subjectMetadata.pluck('uuid');
            if (EnvironmentConfig.debug.test) console.log(uuids);

			var anEntry = data.subjectMetadata.at(0);
            var permissions = new Backbone.Agave.Collection.Permissions({uuid: anEntry.get('uuid')});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.isAtLeast(uuids.indexOf(permissions.uuid), 0);

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var found_vdj = false;
                    var found_user1 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);

					anEntry = data.subjectMetadata.at(1);
            		permissions = new Backbone.Agave.Collection.Permissions({uuid: anEntry.get('uuid')});
					return permissions.fetch();
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.isAtLeast(uuids.indexOf(permissions.uuid), 0);

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var found_vdj = false;
                    var found_user1 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);

					anEntry = data.subjectMetadata.at(2);
            		permissions = new Backbone.Agave.Collection.Permissions({uuid: anEntry.get('uuid')});
					return permissions.fetch();
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.isAtLeast(uuids.indexOf(permissions.uuid), 0);

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var found_vdj = false;
                    var found_user1 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get subject metadata permissions."));
                })
                ;
        });

        it('Import subject metadata (append)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.subjectMetadataFile, 'this test requires subject metadata file from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.importFromFile(data.subjectMetadataFile, 'append')
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not import subject metadata."));
                })
                ;
        });

        it('Fetch subject columns (6 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SubjectColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'subjectColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 6);
                	assert.deepEqual(result.value.columns, ["Name", "Category", "Species", "Strain", "Gender", "Age"]);

					data.subjectColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Fetch subject metadata (6 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(subjectMetadata);

                    assert.strictEqual(subjectMetadata.length, 6);
					data.subjectMetadata = subjectMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
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
                assert.equal(fileMetadataResponse.value.name, 'more_subject_metadata.txt');
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

            var blob = new Blob(['Another\tName\tCategory\tNewColumn\tStrain\tGender\tAge\tOther\n'
            					+ 'A1\tPerson 1\tHuman\tB1\tHomo sapiens\tNA\tMale\t7\tC1\n'
            					+ 'A2\tPerson 2\tHuman\tB2\tHomo sapiens\tNA\tFemale\t8\tC2\n'
            					+ 'A3\tPerson 3\tHuman\tB3\tHomo sapiens\tNA\tMale\t10\tC3\n'],
            					{type: 'text/plain'});

            var agaveFile = new Backbone.Agave.Model.File.ProjectFile({
                name: 'more_subject_metadata.txt',
                length: blob.length,
                lastModified: 'Thu Jun 18 2015 15:17:36 GMT-0500 (CDT)',
                projectUuid: model.get('uuid'),
                vdjFileType: Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV,
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

        it('New project has three files', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fileUuid, 'this test requires file uuid from prior test');

            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function() {
                    // paginated fetch no longer returns a response object

                    assert.strictEqual(projectFiles.length, 3);
                    var agaveFile = projectFiles.at(0);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(1);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(2);

                    assert.equal(agaveFile.get('uuid'), data.fileUuid);
                    assert.equal(agaveFile.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                    assert.equal(agaveFile.get('name'), 'projectFile');
                    assert.equal(agaveFile.get('created'), agaveFile.get('lastUpdated'), 'data fields');

                    var value = agaveFile.get('value');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.deepEqual(value.publicAttributes.tags, []);
                    assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV);
                    assert.equal(value.readDirection, '');
                    assert.equal(value.name, 'more_subject_metadata.txt');
                    assert.isFalse(value.isDeleted);

					data.subjectMetadataFile = agaveFile;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not delete project."));
                })
                ;
        });

        it('Import subject metadata (append)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.subjectMetadataFile, 'this test requires subject metadata file from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.importFromFile(data.subjectMetadataFile, 'append')
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not import subject metadata."));
                })
                ;
        });

        it('Fetch subject columns (6 + 3 = 9 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SubjectColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'subjectColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 9);
                	assert.deepEqual(result.value.columns, ["Name", "Category", "Species", "Strain", "Gender", "Age", "Another", "NewColumn", "Other"]);

					data.subjectColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Fetch subject metadata (9 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(subjectMetadata);

                    assert.strictEqual(subjectMetadata.length, 9);
					data.subjectMetadata = subjectMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Import subject metadata (replace)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.subjectMetadataFile, 'this test requires subject metadata file from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.importFromFile(data.subjectMetadataFile, 'replace')
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not import subject metadata."));
                })
                ;
        });

        it('Fetch subject columns (8 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SubjectColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'subjectColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 8);
                	assert.deepEqual(result.value.columns, ["Another", "Name", "Category", "NewColumn", "Strain", "Gender", "Age", "Other"]);

					data.subjectColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Fetch subject metadata (3 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(subjectMetadata);

                    assert.strictEqual(subjectMetadata.length, 3);
					data.subjectMetadata = subjectMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Upload local file', function(done) {

            this.timeout(50000);

            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fastqUuid, 'this test requires fastq file uuid from prior test');

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
                assert.equal(fileMetadataResponse.value.name, 'sample_metadata.txt');
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

            var blob = new Blob(['SampleID\tName\tStage\tOutcome\tReceptor\tTime\tproject_file\n'
								+ 'Post101.T\t101 9wk TCR\tPost\tCR\tTCR\t9wk\tall_plates.fastq\n'
								+ 'Post101.T\t101 9wk TCR\tPost\tCR\tTCR\t9wk\t' + data.fastqUuid + '\n'],
            					{type: 'text/plain'});

            var agaveFile = new Backbone.Agave.Model.File.ProjectFile({
                name: 'sample_metadata.txt',
                length: blob.length,
                lastModified: 'Thu Jun 18 2015 15:17:36 GMT-0500 (CDT)',
                projectUuid: model.get('uuid'),
                vdjFileType: Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV,
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

        it('New project has four files', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fileUuid, 'this test requires file uuid from prior test');

            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function() {
                    // paginated fetch no longer returns a response object

                    assert.strictEqual(projectFiles.length, 4);
                    var agaveFile = projectFiles.at(0);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(1);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(2);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(3);

                    assert.equal(agaveFile.get('uuid'), data.fileUuid);
                    assert.equal(agaveFile.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                    assert.equal(agaveFile.get('name'), 'projectFile');
                    assert.equal(agaveFile.get('created'), agaveFile.get('lastUpdated'), 'data fields');

                    var value = agaveFile.get('value');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.deepEqual(value.publicAttributes.tags, []);
                    assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV);
                    assert.equal(value.readDirection, '');
                    assert.equal(value.name, 'sample_metadata.txt');
                    assert.isFalse(value.isDeleted);

					data.sampleMetadataFile = agaveFile;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not delete project."));
                })
                ;
        });

        it('Import sample metadata (append)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.sampleMetadataFile, 'this test requires sample metadata file from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.importFromFile(data.sampleMetadataFile, 'append')
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not import sample metadata."));
                })
                ;
        });

        it('Fetch sample columns (6 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SampleColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'sampleColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 6);
                	assert.deepEqual(result.value.columns, ["SampleID", "Name", "Stage", "Outcome", "Receptor", "Time"]);

					data.sampleColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample columns."));
                })
                ;
        });

        it('Check sample columns permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            assert.isDefined(data.sampleColsUuid, 'this test requires the sampleColumns uuid from prior test');

            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: data.sampleColsUuid});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.equal(permissions.uuid, data.sampleColsUuid);

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var found_vdj = false;
                    var found_user1 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.sampleColsUuid);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.sampleColsUuid);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get sample columns permissions."));
                })
                ;
        });

        it('Fetch sample metadata (2 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fastqUuid, 'this test requires fastq file uuid from prior test');

            var model = data.project;

            var sampleMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            sampleMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(sampleMetadata);

                    assert.strictEqual(sampleMetadata.length, 2);
                    var m = sampleMetadata.at(0);
                    var value = m.get('value');
                    assert.equal(value.project_file, data.fastqUuid);
                    m = sampleMetadata.at(1);
                    value = m.get('value');
                    assert.equal(value.project_file, data.fastqUuid);

					data.sampleMetadata = sampleMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample metadata."));
                })
                ;
        });

        it('Check sample metadata permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            assert.isDefined(data.sampleMetadata, 'this test requires the sample metadata from prior test');

            var model = data.project;

			var uuids = data.sampleMetadata.pluck('uuid');
            if (EnvironmentConfig.debug.test) console.log(uuids);

			var anEntry = data.sampleMetadata.at(0);
            var permissions = new Backbone.Agave.Collection.Permissions({uuid: anEntry.get('uuid')});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.isAtLeast(uuids.indexOf(permissions.uuid), 0);

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var found_vdj = false;
                    var found_user1 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);

					anEntry = data.sampleMetadata.at(1);
            		permissions = new Backbone.Agave.Collection.Permissions({uuid: anEntry.get('uuid')});
					return permissions.fetch();
                })
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.isAtLeast(uuids.indexOf(permissions.uuid), 0);

                    // two permission entries, one for the user and one for vdj account
                    assert.strictEqual(permissions.length, 2);
                    assert.strictEqual(permissions.getUserCount(), 1);

                    var found_vdj = false;
                    var found_user1 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                    			assert.isAtLeast(uuids.indexOf(perm.uuid), 0);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get sample metadata permissions."));
                })
                ;
        });

        it('Upload local file', function(done) {

            this.timeout(50000);

            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fastqUuid, 'this test requires fastq file uuid from prior test');

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
                assert.equal(fileMetadataResponse.value.name, 'more_sample_metadata.txt');
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

            var blob = new Blob(['SampleID\tName\tAnother\n'
								+ 'Post101.T\t101 9wk TCR\tA1\n'
								+ 'Post101.T\t101 9wk TCR\tA2\n'],
            					{type: 'text/plain'});

            var agaveFile = new Backbone.Agave.Model.File.ProjectFile({
                name: 'more_sample_metadata.txt',
                length: blob.length,
                lastModified: 'Thu Jun 18 2015 15:17:36 GMT-0500 (CDT)',
                projectUuid: model.get('uuid'),
                vdjFileType: Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV,
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

        it('New project has five files', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fileUuid, 'this test requires file uuid from prior test');

            var model = data.project;

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
                .then(function() {
                    // paginated fetch no longer returns a response object

                    assert.strictEqual(projectFiles.length, 5);
                    var agaveFile = projectFiles.at(0);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(1);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(2);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(3);
                    if (agaveFile.get('uuid') != data.fileUuid) agaveFile = projectFiles.at(4);

                    assert.equal(agaveFile.get('uuid'), data.fileUuid);
                    assert.equal(agaveFile.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                    assert.equal(agaveFile.get('name'), 'projectFile');
                    assert.equal(agaveFile.get('created'), agaveFile.get('lastUpdated'), 'data fields');

                    var value = agaveFile.get('value');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.deepEqual(value.publicAttributes.tags, []);
                    assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV);
                    assert.equal(value.readDirection, '');
                    assert.equal(value.name, 'more_sample_metadata.txt');
                    assert.isFalse(value.isDeleted);

					data.sampleMetadataFile2 = agaveFile;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not delete project."));
                })
                ;
        });

        it('Import sample metadata (append)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.sampleMetadataFile2, 'this test requires sample metadata file from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.importFromFile(data.sampleMetadataFile2, 'append')
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not import sample metadata."));
                })
                ;
        });

        it('Fetch sample columns (6 + 1 = 7 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var sampleCols = new Backbone.Agave.Model.SampleColumns({projectUuid: model.get('uuid')})

            sampleCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'sampleColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 7);
                	assert.deepEqual(result.value.columns, ["SampleID", "Name", "Stage", "Outcome", "Receptor", "Time", "Another"]);

					data.sampleColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample columns."));
                })
                ;
        });

        it('Fetch sample metadata (4 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var sampleMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            sampleMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(sampleMetadata);

                    assert.strictEqual(sampleMetadata.length, 4);

					data.sampleMetadata = sampleMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample metadata."));
                })
                ;
        });

        it('Import sample metadata (replace)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.sampleMetadataFile, 'this test requires sample metadata file from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.importFromFile(data.sampleMetadataFile, 'replace')
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not import sample metadata."));
                })
                ;
        });

        it('Fetch sample columns (6 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SampleColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'sampleColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 6);
                	assert.deepEqual(result.value.columns, ["SampleID", "Name", "Stage", "Outcome", "Receptor", "Time"]);

					data.sampleColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample columns."));
                })
                ;
        });

        it('Fetch sample metadata (2 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fastqUuid, 'this test requires fastq file uuid from prior test');

            var model = data.project;

            var sampleMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            sampleMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(sampleMetadata);

                    assert.strictEqual(sampleMetadata.length, 2);
                    var m = sampleMetadata.at(0);
                    var value = m.get('value');
                    assert.equal(value.project_file, data.fastqUuid);
                    m = sampleMetadata.at(1);
                    value = m.get('value');
                    assert.equal(value.project_file, data.fastqUuid);

					data.sampleMetadata = sampleMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample metadata."));
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

        it('Check subject columns permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            assert.isDefined(data.subjectColsUuid, 'this test requires the subjectColumns uuid from prior test');

            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: data.subjectColsUuid});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.equal(permissions.uuid, data.subjectColsUuid);

                    // three permission entries
                    // one for the user, one for vdj account, and one for the new user
                    assert.strictEqual(permissions.length, 3);
                    assert.strictEqual(permissions.getUserCount(), 2);

                    var found_vdj = false;
                    var found_user1 = false;
                    var found_user2 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.subjectColsUuid);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.subjectColsUuid);
                                break;
                            case EnvironmentConfig.test.username2:
                                found_user2 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.subjectColsUuid);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);
                    assert.isTrue(found_user2);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get subject columns permissions."));
                })
                ;
        });

        it('Check sample columns permissions', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            assert.isDefined(data.sampleColsUuid, 'this test requires the sampleColumns uuid from prior test');

            var model = data.project;

            var permissions = new Backbone.Agave.Collection.Permissions({uuid: data.sampleColsUuid});

            permissions.fetch()
                .then(function(response) {
                    if (EnvironmentConfig.debug.test) console.log(response);
                    if (EnvironmentConfig.debug.test) console.log(permissions);

                    assert.equal(response.status, 'success');
                    assert.isNull(response.message);

                    assert.equal(permissions.uuid, data.sampleColsUuid);

                    // three permission entries
                    // one for the user, one for vdj account, and one for the new user
                    assert.strictEqual(permissions.length, 3);
                    assert.strictEqual(permissions.getUserCount(), 2);

                    var found_vdj = false;
                    var found_user1 = false;
                    var found_user2 = false;
                    for (var i = 0; i < permissions.length; ++i) {
                        var perm = permissions.at(i);
                        switch(perm.get('username')) {
                            case EnvironmentConfig.test.serviceAccountKey:
                                found_vdj = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.sampleColsUuid);
                                break;
                            case EnvironmentConfig.test.username:
                                found_user1 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.sampleColsUuid);
                                break;
                            case EnvironmentConfig.test.username2:
                                found_user2 = true;
                                assert.deepEqual(perm.get('permission'), {read: true, write: true});
                                assert.equal(perm.uuid, data.sampleColsUuid);
                                break;
                        }
                    }
                    assert.isTrue(found_vdj);
                    assert.isTrue(found_user1);
                    assert.isTrue(found_user2);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not get sample columns permissions."));
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

        it('Fetch subject columns (8 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SubjectColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'subjectColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 8);
                	assert.deepEqual(result.value.columns, ["Another", "Name", "Category", "NewColumn", "Strain", "Gender", "Age", "Other"]);

					data.subjectColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Fetch subject metadata (3 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(subjectMetadata);

                    assert.strictEqual(subjectMetadata.length, 3);
					data.subjectMetadata = subjectMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch subject columns."));
                })
                ;
        });

        it('Fetch sample columns (6 columns)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectCols = new Backbone.Agave.Model.SampleColumns({projectUuid: model.get('uuid')})

            subjectCols.fetch()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    assert.strictEqual(result.length, 1);
                    result = result[0];
                    assert.strictEqual(result.associationIds.length, 1);
                    assert.equal(result.name, 'sampleColumns');
                    assert.equal(result.associationIds[0], model.get('uuid'));
                    assert.strictEqual(result.value.columns.length, 6);
                	assert.deepEqual(result.value.columns, ["SampleID", "Name", "Stage", "Outcome", "Receptor", "Time"]);

					data.sampleColsUuid = result.uuid;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample columns."));
                })
                ;
        });

        it('Fetch sample metadata (2 entries)', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fastqUuid, 'this test requires fastq file uuid from prior test');

            var model = data.project;

            var sampleMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            sampleMetadata.fetch()
                .then(function() {
                    if (EnvironmentConfig.debug.test) console.log(sampleMetadata);

                    assert.strictEqual(sampleMetadata.length, 2);
                    var m = sampleMetadata.at(0);
                    var value = m.get('value');
                    assert.equal(value.project_file, data.fastqUuid);
                    m = sampleMetadata.at(1);
                    value = m.get('value');
                    assert.equal(value.project_file, data.fastqUuid);

					data.sampleMetadata = sampleMetadata;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not fetch sample metadata."));
                })
                ;
        });

        it('Export sample metadata', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var sampleMetadata = new Backbone.Agave.Collection.SamplesMetadata({projectUuid: model.get('uuid')})

            sampleMetadata.createExportFile()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not export sample metadata."));
                })
                ;
        });

        it('Check for sample metadata export file', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/listings/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid')
                        + '/deleted/sample_metadata.tsv'
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // current plus 3 project directories
                assert.strictEqual(result.length, 1);
                result = result[0];
                assert.isAtLeast(result.length, 200);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Could not export sample metadata.'));
            })
            ;

        });

        it('Export subject metadata', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');

            var model = data.project;

            var subjectMetadata = new Backbone.Agave.Collection.SubjectsMetadata({projectUuid: model.get('uuid')})

            subjectMetadata.createExportFile()
                .then(function(response) {
					if (EnvironmentConfig.debug.test) console.log(response);

					assert.equal(response.status, 'success');

					assert.isDefined(response.result);
					var result = response.result;

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not export subject metadata."));
                })
                ;
        });

        it('Check for subject metadata export file', function(done) {
            assert.isDefined(data.project, 'this test requires the project from prior test');
            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/listings/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + model.get('uuid')
                        + '/deleted/subject_metadata.tsv'
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                // current plus 3 project directories
                assert.strictEqual(result.length, 1);
                result = result[0];
                assert.strictEqual(result.length, 191);

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Could not export subject metadata.'));
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
