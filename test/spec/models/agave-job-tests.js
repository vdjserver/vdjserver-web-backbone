/*global describe, it, before, sinon */

//require('sinon');

define(['app', 'agave-job', 'moment'], function() {

    'use strict';

    describe('Agave Job Tests', function()  {

        it('Agave Job Detail model should exist', function() {
            var model = new Backbone.Agave.Model.Job.Detail();
            should.exist(model);
        });

        it('Agave Job vdjpipe model should exist', function() {
            var model = new Backbone.Agave.Model.Job.VdjPipe();
            should.exist(model);
        });

        it('Agave Job vdjpipe model should exist', function() {
            var model = new Backbone.Agave.Model.Job.VdjPipe();
            should.exist(model);
        });
    });

    describe('Agave Job VdjPipe Tests', function()  {

        before(function() {
            this.server = sinon.fakeServer.create();
        });

        it('getDirectorySafeName should return a safe directory name', function() {
            var model = new Backbone.Agave.Model.Job.VdjPipe();

            var safeName = model.getDirectorySafeName('name with spaces');
            safeName.should.equal('name-with-spaces');
        });

        it('shareJobWithProjectMembers should send correct data payload', function(done) {

            this.server.respondWith(function(request) {

                var requestBody = JSON.parse(request.requestBody);
                var requestHeaders = request.requestHeaders;

                requestHeaders['Content-Type'].should.equal('application/json;charset=utf-8');

                requestBody.projectUuid.should.equal('project123');
                requestBody.jobUuid.should.equal('job123');
                request.method.should.equal('POST');
                request.url.should.equal(Backbone.Agave.vdjauthRoot + '/permissions/jobs');

                done();
            });

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('id', 'job123');

            model.shareJobWithProjectMembers('project123');

            this.server.respond();
        });

        it('createJobMetadata should send correct data payload', function(done) {

            this.server.respondWith(function(request) {

                var requestBody = JSON.parse(request.requestBody);
                var requestHeaders = request.requestHeaders;

                requestHeaders['Content-Type'].should.equal('application/json;charset=utf-8');

                requestBody.projectUuid.should.equal('project123');
                requestBody.jobUuid.should.equal('job123');
                request.method.should.equal('POST');
                request.url.should.equal(Backbone.Agave.vdjauthRoot + '/jobs/metadata');

                done();
            });

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('id', 'job123');

            model.createJobMetadata('project123');

            this.server.respond();
        });

        it('createArchivePathDirectory should send correct data payload', function(done) {

            this.server.respondWith(function(request) {

                request.requestBody.should.equal('action=mkdir&path=2014-06-16-14-10-58-46-test');
                request.method.should.equal('PUT');
                request.url.should.equal(Backbone.Agave.apiRoot + '/files/v2/media/system/data.vdjserver.org//projects/project123/analyses');

                done();
            });

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('archivePath', '/projects/project123/analyses/2014-06-16-14-10-58-46-test');

            model.createArchivePathDirectory('project123');

            this.server.respond();
        });

        it('getRelativeArchivePath should return a correct split archivePath', function() {

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('archivePath', '/projects/project123/analyses/2014-06-16-14-10-58-46-test');

            var relativeArchivePath = model.getRelativeArchivePath();

            relativeArchivePath.should.equal('2014-06-16-14-10-58-46-test');

        });

        it('setArchivePath should create a correct archivePath', function() {

            var archivePathDateFormat = 'YYYY-MM-DD';

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.archivePathDateFormat = archivePathDateFormat;

            model.set('name', 'testJob');

            model.setArchivePath('project123');
            var time = moment().format(archivePathDateFormat);

            model.get('archivePath').should.equal('/projects/project123/analyses/' + time + '-testjob');
        });

        it('getDirectorySafeName should return a string that is lowercase and without any spaces', function() {
            var model = new Backbone.Agave.Model.Job.VdjPipe();

            var safeName = model.getDirectorySafeName('1.21 GigaWATTS');

            safeName.should.equal('1.21-gigawatts');
        });

        //it('getRelativeArchivePath should')

        it('setJobConfigFromWorkflowFormData should correctly set vdjpipe config parameter as a model parameter', function() {

            var projectUuid = '0001410469863267-5056a550b8-0001-012';
            var file = new Backbone.Agave.Model.File.Metadata(
                {
                    'uuid': '0001410469889770-5056a550b8-0001-012',
                    'owner': 'wscarbor',
                    'schemaId': null,
                    'internalUsername': null,
                    'associationIds':[
                        '0001410469863267-5056a550b8-0001-012'
                    ],
                    'lastUpdated': '2014-09-11T16:11:29.770-05:00',
                    'name': 'projectFile',
                    'value': {
                        'projectUuid': '0001410469863267-5056a550b8-0001-012',
                        'fileCategory': 'uploaded',
                        'name': 'emid_1_rev.fastq',
                        'length': 4036,
                        'mimeType': '',
                        'isDeleted': false,
                        'privateAttributes': {
                            'reverse-reads': true
                        }
                    },
                    'created': '2014-09-11T16:11:29.770-05:00',
                    '_links': {
                        'self': {
                            'href': 'https://agave.iplantc.org/meta/v2/data/0001410469889770-5056a550b8-0001-012'
                        },
                        'metadata': {
                            'href': 'https://wso2-elb.tacc.utexas.edu/meta/v2//data/0001410469863267-5056a550b8-0001-012'
                        }
                    }
                }
            );
            var files = new Backbone.Agave.Collection.Files.Metadata();
            files.add(file);

            var formData = {
                'job-name': 'test',
                '0-quality_stats': 'Read Quality Statistics',
                '1-composition_stats': 'Base Composition Statistics',
                'single-reads':'on'
            };

            var job = new Backbone.Agave.Model.Job.VdjPipe();
            job.setJobConfigFromWorkflowFormData(formData, files);

            var serializedJob = JSON.stringify(job.toJSON());

            serializedJob.should.equal(
                '{"appId":"vdj_pipe-0.0.16u2","archive":true,"archivePath":"","archiveSystem":"data.vdjserver.org","batchQueue":"normal","inputs":{},"maxRunTime":"24:00:00","outputPath":"","name":"test","nodeCount":1,"parameters":{"json":"{\\"base_path_input\\":\\"\\",\\"base_path_output\\":\\"\\",\\"csv_file_delimiter\\":\\"\\\\\\\\t\\",\\"input\\":[{\\"reverse_seq\\":\\"emid_1_rev.fastq\\"}],\\"single_read_pipe\\":[{\\"quality_stats\\":{\\"out_prefix\\":\\"pre-\\"}},{\\"composition_stats\\":{\\"out_prefix\\":\\"pre-\\"}}]}"},"processorsPerNode":12}'
            )
        });

    });
});
