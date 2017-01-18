define([
    'app',
    'backbone-agave',
], function(App) {

    'use strict';

    describe('VDJServer-Agave Integration Tests (Jobs)', function()  {
        this.timeout(500000);

        it('Should be able to login as ' + EnvironmentConfig.test.username, function(done) {

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
                assert.equal(fileMetadataResponse.value.name, 'Merged_2000.fastq');
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
                urlToIngest: 'http://wiki.vdjserver.org/test/Merged_2000.fastq'
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
                    assert.deepEqual(value.publicAttributes.tags, ['test file']);
                    assert.equal(value.fileType, Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ);
                    assert.equal(value.readDirection, 'F');
                    assert.equal(value.name, 'Merged_2000.fastq');
                    assert.isFalse(value.isDeleted);

                    done();
                })
                .fail(function(error) {
                    console.log("response error: " + JSON.stringify(error));
                    done(new Error("Could not delete project."));
                })
                ;
        });

        it('Run vdj_pipe-small job', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.fileUuid, 'this test requires file uuid from prior test');

            var job = new Backbone.Agave.Model.Job.VdjPipe();
            var model = data.project;

            App.Instances.WebsocketManager.subscribeToEvent(model.get('uuid'));

            model.listenTo(App.Instances.WebsocketManager, 'jobStatusUpdate', function(jobUpdate) {
                if (EnvironmentConfig.debug.test) console.log('jobStatusUpdate:');
                if (EnvironmentConfig.debug.test) console.log(jobUpdate);

                assert.isDefined(jobUpdate);
                assert.isNotNull(jobUpdate);

                // We could check for the whole sequence of events...
                switch (jobUpdate.jobEvent) {
                  case 'PENDING':
                      data.jobUuid = jobUpdate.jobId;
                      assert.equal(jobUpdate.projectUuid, model.get('uuid'));
                      assert.equal(jobUpdate.jobName, 'test job');
                      break;
                  case 'FINISHED':
                      assert.equal(jobUpdate.jobId, data.jobUuid);
                      assert.equal(jobUpdate.projectUuid, model.get('uuid'));
                      assert.equal(jobUpdate.jobName, 'test job');
                      model.stopListening();

                      done();
                }

                // we will timeout if the job never reaches FINISHED state
            });

            // simulate form data
            var formData = {
                'job-name':  'test job',
                'single_reads': 'on',
                'pre_statistics': '',
                'length_filter': '',
                'length_filter-max': '',
                'length_filter-min': '0',
                'average_quality_filter-min': '35',
                'homopolymer_filter-max': '20',
                'post_statistics': '',
            };

            var projectFiles = new Backbone.Agave.Collection.Files.Metadata({projectUuid: model.get('uuid')})

            projectFiles.fetch()
            .then(function() {
                // paginated fetch no longer returns a response object

		            job.set('totalFileSize', 100); // small size so it goes to small execution system
		            job._configureExecutionHostForFileSize();
                job.unset('maxRunTime');
                job.unset('nodeCount');
                job.unset('processorsPerNode');

                var allFiles = projectFiles.clone();
                var selectedFileListings = _.extend({}, projectFiles);
                var allFiles = _.extend({}, allFiles);

                job.prepareJob(
                    formData,
                    selectedFileListings,
                    allFiles,
                    model.get('uuid')
                );

                return job.submitJob(model.get('uuid'));
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                model.stopListening();
                done(new Error("Could not submit job."));
            })
            ;
        });

        it('Check for job directly from Agave', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.jobUuid, 'this test requires job uuid from prior test');

            var model = data.project;

            var jqxhr = Backbone.Agave.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:   'GET',
                url:    EnvironmentConfig.agave.hostname
                        + '/jobs/v2/' + data.jobUuid
            })
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');

                assert.isDefined(response.result);
                var result = response.result;

                assert.equal(result.name, 'test job');
                assert.equal(result.owner, EnvironmentConfig.test.serviceAccountKey);
                assert.equal(result.appId, EnvironmentConfig.agave.systems.execution.vdjExec02.apps.vdjPipe);
                assert.equal(result.executionSystem, EnvironmentConfig.agave.systems.execution.vdjExec02.hostname);
                assert.equal(result.archiveSystem, EnvironmentConfig.agave.systems.storage.corral.hostname);
                assert.equal(result.status, 'FINISHED');
                assert.isDefined(result.archivePath);
                assert.isNotNull(result.archivePath);

                data.job = result;

                done();
            })
            .fail(function(error) {
                console.log("response: " + JSON.stringify(error));
                done(new Error('Failed HTTP request'));
            })
            ;

        });

        // vdj-api needs to be finished with updating metadata and permissions
        it('Check successful completion of vdj_pipe-small job', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.jobUuid, 'this test requires job uuid from prior test');

            var model = data.project;
            var jobs = new Backbone.Agave.Collection.Jobs();
            jobs.projectUuid = model.get('uuid');
            //jobs.projectUuid = '4969802863779638810-242ac114-0001-012';
            //data.jobUuid = '2832970734673718810-242ac114-0001-007';
            //jobs.projectUuid = '8300682565076521446-242ac114-0001-012';
            //data.jobUuid = '8051706606084550170-242ac114-0001-007';

            jobs.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');
                assert.isNull(response.message);

                assert.strictEqual(jobs.length, 1);
                var agaveJob = jobs.at(0);

                assert.equal(agaveJob.get('id'), data.jobUuid);
                assert.equal(agaveJob.get('name'), 'test job');
                assert.equal(agaveJob.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                assert.equal(agaveJob.get('appId'), EnvironmentConfig.agave.systems.execution.vdjExec02.apps.vdjPipe);
                assert.equal(agaveJob.get('executionSystem'), EnvironmentConfig.agave.systems.execution.vdjExec02.hostname);
                assert.equal(agaveJob.get('status'), 'FINISHED');
            })
            .then(function() {
                var jobListings = new Backbone.Agave.Collection.Jobs.Listings({projectUuid: model.get('uuid')});

                jobListings.fetch()
                .then(function() {
                    // paginated fetch does not return response

                    console.log(jobListings);
                    assert.strictEqual(jobListings.length, 1);
                    var agaveJob = jobListings.at(0);

                    var value = agaveJob.get('value');
                    assert.isDefined(value, 'value attribute');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.equal(value.jobUuid, data.jobUuid);
                })
                .fail(function(error) {
                    console.log("caught error: " + JSON.stringify(error));
                    done(new Error("Could not retrieve job metadata."));
                })
            })
            .then(function() {
                var jobFiles = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: data.jobUuid});

                jobFiles.fetch()
                .then(function() {
                    // paginated fetch does not return response

                    console.log(jobFiles);
                    assert.strictEqual(jobFiles.length, 19);

                    done();
                })
                .fail(function(error) {
                    console.log("caught error: " + JSON.stringify(error));
                    done(new Error("Could not retrieve jobs files."));
                })
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not retrieve jobs."));
            })
            ;
        });

        it('Check process metadata', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.jobUuid, 'this test requires job uuid from prior test');

            var model = data.project;
            var jobProcessMetadata = new Backbone.Agave.Model.Job.ProcessMetadata({jobId: data.jobUuid});

            jobProcessMetadata.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');
                assert.isNull(response.message);

                var value = jobProcessMetadata.get('value');
                assert.isDefined(value, 'value attribute');
                assert.isDefined(value.process, 'process dictionary');
                assert.equal(value.process.appName, 'vdjPipe');
                assert.equal(value.process.jobId, data.jobUuid);
                assert.isDefined(value.files, 'files dictionary');
                assert.isDefined(value.groups, 'groups dictionary');
                assert.isDefined(value.calculations, 'calculations dictionary');

                done();
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not retrieve process metadata."));
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

        it('Check user can retrieve project jobs', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.jobUuid, 'this test requires job uuid from prior test');

            var model = data.project;
            var jobs = new Backbone.Agave.Collection.Jobs();
            jobs.projectUuid = model.get('uuid');

            jobs.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');
                assert.isNull(response.message);

                assert.strictEqual(jobs.length, 1);
                var agaveJob = jobs.at(0);

                assert.equal(agaveJob.get('id'), data.jobUuid);
                assert.equal(agaveJob.get('name'), 'test job');
                assert.equal(agaveJob.get('owner'), EnvironmentConfig.test.serviceAccountKey);
                assert.equal(agaveJob.get('appId'), EnvironmentConfig.agave.systems.execution.vdjExec02.apps.vdjPipe);
                assert.equal(agaveJob.get('executionSystem'), EnvironmentConfig.agave.systems.execution.vdjExec02.hostname);
                assert.equal(agaveJob.get('status'), 'FINISHED');
            })
            .then(function() {
                var jobListings = new Backbone.Agave.Collection.Jobs.Listings({projectUuid: model.get('uuid')});

                jobListings.fetch()
                .then(function() {
                    // paginated fetch does not return response

                    console.log(jobListings);
                    assert.strictEqual(jobListings.length, 1);
                    var agaveJob = jobListings.at(0);

                    var value = agaveJob.get('value');
                    assert.isDefined(value, 'value attribute');
                    assert.equal(value.projectUuid, model.get('uuid'));
                    assert.equal(value.jobUuid, data.jobUuid);
                })
                .fail(function(error) {
                    console.log("caught error: " + JSON.stringify(error));
                    done(new Error("Could not retrieve job metadata."));
                })
            })
            .then(function() {
                var jobFiles = new Backbone.Agave.Collection.Jobs.OutputFiles({jobId: data.jobUuid});

                jobFiles.fetch()
                .then(function() {
                    // paginated fetch does not return response

                    console.log(jobFiles);
                    assert.strictEqual(jobFiles.length, 19);

                    done();
                })
                .fail(function(error) {
                    console.log("caught error: " + JSON.stringify(error));
                    done(new Error("Could not retrieve jobs files."));
                })
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not retrieve jobs."));
            })
            ;
        });

        it('Check process metadata', function(done) {
            assert.isDefined(data.project, 'this test requires project uuid from prior test');
            assert.isDefined(data.jobUuid, 'this test requires job uuid from prior test');

            var model = data.project;
            var jobProcessMetadata = new Backbone.Agave.Model.Job.ProcessMetadata({jobId: data.jobUuid});

            jobProcessMetadata.fetch()
            .then(function(response) {
                if (EnvironmentConfig.debug.test) console.log(response);

                assert.equal(response.status, 'success');
                assert.isNull(response.message);

                var value = jobProcessMetadata.get('value');
                assert.isDefined(value, 'value attribute');
                assert.isDefined(value.process, 'process dictionary');
                assert.equal(value.process.appName, 'vdjPipe');
                assert.equal(value.process.jobId, data.jobUuid);
                assert.isDefined(value.files, 'files dictionary');
                assert.isDefined(value.groups, 'groups dictionary');
                assert.isDefined(value.calculations, 'calculations dictionary');

                done();
            })
            .fail(function(error) {
                console.log("response error: " + JSON.stringify(error));
                done(new Error("Could not retrieve process metadata."));
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
