/*global describe, it, before, sinon */

//require('sinon');

define(['app', 'environment-config', 'moment', 'agave-job'], function(App, EnvironmentConfig, moment) {

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

            var safeName = model._getDirectorySafeName('name with spaces');
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
                request.url.should.equal(EnvironmentConfig.vdjauthRoot + '/permissions/jobs');

                done();
            });

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('id', 'job123');

            model._shareJobWithProjectMembers('project123');

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
                request.url.should.equal(EnvironmentConfig.vdjauthRoot + '/jobs/metadata');

                done();
            });

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('id', 'job123');

            model._createJobMetadata('project123');

            this.server.respond();
        });

        it('createArchivePathDirectory should send correct data payload', function(done) {

            this.server.respondWith(function(request) {

                request.requestBody.should.equal('action=mkdir&path=2014-06-16-14-10-58-46-test');
                request.method.should.equal('PUT');
                request.url.should.equal(EnvironmentConfig.agaveRoot + '/files/v2/media/system/data.vdjserver.org//projects/project123/analyses');

                done();
            });

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('archivePath', '/projects/project123/analyses/2014-06-16-14-10-58-46-test');

            model._createArchivePathDirectory('project123');

            this.server.respond();
        });

        it('getRelativeArchivePath should return a correct split archivePath', function() {

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.set('archivePath', '/projects/project123/analyses/2014-06-16-14-10-58-46-test');

            var relativeArchivePath = model._getRelativeArchivePath();

            relativeArchivePath.should.equal('2014-06-16-14-10-58-46-test');
        });

        it('setArchivePath should create a correct archivePath', function() {

            var archivePathDateFormat = 'YYYY-MM-DD';

            var model = new Backbone.Agave.Model.Job.VdjPipe();
            model.archivePathDateFormat = archivePathDateFormat;

            model.set('name', 'testJob');

            model._setArchivePath('project123');
            var time = moment().format(archivePathDateFormat);

            model.get('archivePath').should.equal('/projects/project123/analyses/' + time + '-testjob');
        });

        it('getDirectorySafeName should return a string that is lowercase and without any spaces', function() {
            var model = new Backbone.Agave.Model.Job.VdjPipe();

            var safeName = model._getDirectorySafeName('1.21 GigaWATTS');

            safeName.should.equal('1.21-gigawatts');
        });

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
                        'projectUuid': projectUuid,
                        'fileCategory': 'uploaded',
                        'name': 'emid_1_rev.fastq',
                        'length': 4036,
                        'mimeType': '',
                        'isDeleted': false,
                        'readDirection': 'R',
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
            job._setJobConfigFromWorkflowFormData(formData, files, files);

            var serializedJob = JSON.stringify(job.toJSON());

            serializedJob.should.equal(
                '{"appId":"vdj_pipe-0.1.5u1","archive":true,"archivePath":"","archiveSystem":"data.vdjserver.org","batchQueue":"normal","inputs":{},"maxRunTime":"24:00:00","outputPath":"","name":"test","nodeCount":1,"parameters":{"json":"{\\"base_path_input\\":\\"\\",\\"base_path_output\\":\\"\\",\\"input\\":[{\\"sequence\\":\\"emid_1_rev.fastq\\",\\"is_reverse\\":true}],\\"steps\\":[{\\"quality_stats\\":{}},{\\"composition_stats\\":{}}]}"},"processorsPerNode":12}'
            );
        });

        it('setFilesParameter should set file paths correctly', function() {

            var projectUuid = '0001410469863267-5056a550b8-0001-012';
            var file1 = new Backbone.Agave.Model.File.Metadata(
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
                        'projectUuid': projectUuid,
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

            var file2 = new Backbone.Agave.Model.File.Metadata(
                {
                    'uuid': '0001410544419359-5056a550b8-0001-012',
                    'owner': 'wscarbor',
                    'schemaId': null,
                    'internalUsername': null,
                    'associationIds': [
                        '0001410469863267-5056a550b8-0001-012'
                    ],
                    'lastUpdated': '2014-09-12T12:53:39.359-05:00',
                    'name': 'projectFile',
                    'value': {
                        'projectUuid': projectUuid,
                        'fileCategory': 'uploaded',
                        'name': 'emid1.fasta',
                        'length': 75,
                        'mimeType': '',
                        'isDeleted': false,
                        'privateAttributes': {}
                    },
                    'created': '2014-09-12T12:53:39.359-05:00',
                    '_links': {
                        'self': {
                            'href': 'https://agave.iplantc.org/meta/v2/data/0001410544419359-5056a550b8-0001-012'
                        },
                        'metadata': {
                            'href': 'https://wso2-elb.tacc.utexas.edu/meta/v2//data/0001410469863267-5056a550b8-0001-012'
                        }
                    }
                }
            );

            var files = new Backbone.Agave.Collection.Files.Metadata();
            files.add(file1);
            files.add(file2);

            var job = new Backbone.Agave.Model.Job.VdjPipe();
            job._setFilesParameter(files);

            var jobFilesParameter = JSON.stringify(job.get('inputs'));

            jobFilesParameter.should.equal(
                '{"files":"agave://data.vdjserver.org//projects/0001410469863267-5056a550b8-0001-012/files/emid_1_rev.fastq;agave://data.vdjserver.org//projects/0001410469863267-5056a550b8-0001-012/files/emid1.fasta"}'
            );
        });

        it('prepareJob should adjust settings correctly', function() {

            var projectUuid = '0001410469863267-5056a550b8-0001-012';

            var file1 = new Backbone.Agave.Model.File.Metadata(
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
                        'projectUuid': projectUuid,
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

            var file2 = new Backbone.Agave.Model.File.Metadata(
                {
                    'uuid': '0001410544419359-5056a550b8-0001-012',
                    'owner': 'wscarbor',
                    'schemaId': null,
                    'internalUsername': null,
                    'associationIds': [
                        '0001410469863267-5056a550b8-0001-012'
                    ],
                    'lastUpdated': '2014-09-12T12:53:39.359-05:00',
                    'name': 'projectFile',
                    'value': {
                        'projectUuid': projectUuid,
                        'fileCategory': 'uploaded',
                        'name': 'emid1.fasta',
                        'length': 75,
                        'mimeType': '',
                        'isDeleted': false,
                        'privateAttributes': {}
                    },
                    'created': '2014-09-12T12:53:39.359-05:00',
                    '_links': {
                        'self': {
                            'href': 'https://agave.iplantc.org/meta/v2/data/0001410544419359-5056a550b8-0001-012'
                        },
                        'metadata': {
                            'href': 'https://wso2-elb.tacc.utexas.edu/meta/v2//data/0001410469863267-5056a550b8-0001-012'
                        }
                    }
                }
            );

            var files = new Backbone.Agave.Collection.Files.Metadata();
            files.add(file1);
            files.add(file2);

            var formData = {
                'job-name': 'test',
                '0-quality_stats': 'Read Quality Statistics',
                '1-composition_stats': 'Base Composition Statistics',
                'single-reads':'on'
            };

            var job = new Backbone.Agave.Model.Job.VdjPipe();
            job.prepareJob(formData, files, projectUuid);

            // Need to override |archivePath| since it is time dependent
            job.set('archivePath', 'testArchivePath');

            var serializedJob = JSON.stringify(job);

            serializedJob.should.equal(
                '{"appId":"vdj_pipe-0.1.5u1","archive":true,"archivePath":"testArchivePath","archiveSystem":"data.vdjserver.org","batchQueue":"normal","inputs":{"files":"agave://data.vdjserver.org//projects/0001410469863267-5056a550b8-0001-012/files/emid_1_rev.fastq;agave://data.vdjserver.org//projects/0001410469863267-5056a550b8-0001-012/files/emid1.fasta"},"maxRunTime":"24:00:00","outputPath":"","name":"test","nodeCount":1,"parameters":{"json":"{\\"base_path_input\\":\\"\\",\\"base_path_output\\":\\"\\",\\"input\\":[{\\"sequence\\":\\"emid_1_rev.fastq\\"},{\\"sequence\\":\\"emid1.fasta\\"}],\\"steps\\":[{\\"quality_stats\\":{}},{\\"composition_stats\\":{}}]}"},"processorsPerNode":12}'
            );
        });

        it('job using Single Read Workflow should be setup correctly', function() {

            var projectUuid = '0001410469863267-5056a550b8-0001-012';

            var file1 = new Backbone.Agave.Model.File.Metadata(
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
                        'projectUuid': projectUuid,
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

            var file2 = new Backbone.Agave.Model.File.Metadata(
                {
                    'uuid': '0001410544419359-5056a550b8-0001-012',
                    'owner': 'wscarbor',
                    'schemaId': null,
                    'internalUsername': null,
                    'associationIds': [
                        '0001410469863267-5056a550b8-0001-012'
                    ],
                    'lastUpdated': '2014-09-12T12:53:39.359-05:00',
                    'name': 'projectFile',
                    'value': {
                        'projectUuid': projectUuid,
                        'fileCategory': 'uploaded',
                        'name': 'emid1.fasta',
                        'length': 75,
                        'mimeType': '',
                        'isDeleted': false,
                        'privateAttributes': {}
                    },
                    'created': '2014-09-12T12:53:39.359-05:00',
                    '_links': {
                        'self': {
                            'href': 'https://agave.iplantc.org/meta/v2/data/0001410544419359-5056a550b8-0001-012'
                        },
                        'metadata': {
                            'href': 'https://wso2-elb.tacc.utexas.edu/meta/v2//data/0001410469863267-5056a550b8-0001-012'
                        }
                    }
                }
            );

            var files = new Backbone.Agave.Collection.Files.Metadata();
            files.add(file1);
            files.add(file2);

            var formData = {
                'job-name': 'test',
                'single-reads': 'on',
                '0-quality_stats': 'Read Quality Statistics',
                '1-composition_stats': 'Base Composition Statistics',
                '2-match': '',
                '2-match-reverse-complement': true,
                '2-match-trimmed': false,
                '3-histogram-name': 'MID',
                '4-length_filter': '',
                '4-length_filter-min': '200',
                '4-length_filter-max': '',
                '5-average_quality_filter': '35',
                '6-homopolymer_filter': '20',
                '7-find_shared': '',
                '7-find_shared-min-length': '',
                '7-find_shared-fraction-match': '',
                '7-find_shared-ignore-ends': ''
            };

            var job = new Backbone.Agave.Model.Job.VdjPipe();
            job.prepareJob(formData, files, projectUuid);

            // Need to override |archivePath| since it is time dependent
            job.set('archivePath', 'testArchivePath');

            var serializedJob = JSON.stringify(job);

            var expectedResult = {'appId':'vdj_pipe-0.1.5u1','archive':true,'archivePath':'testArchivePath','archiveSystem':'data.vdjserver.org','batchQueue':'normal','inputs':{'files':'agave://data.vdjserver.org//projects/0001410469863267-5056a550b8-0001-012/files/emid_1_rev.fastq;agave://data.vdjserver.org//projects/0001410469863267-5056a550b8-0001-012/files/emid1.fasta'},'maxRunTime':'24:00:00','outputPath':'','name':'test','nodeCount':1,'parameters':{'json':'{\"base_path_input\":\"\",\"base_path_output\":\"\",\"input\":[{\"sequence\":\"emid_1_rev.fastq\"},{\"sequence\":\"emid1.fasta\"}],\"steps\":[{\"quality_stats\":{}},{\"composition_stats\":{}},{\"match\":{\"reverse\":true,\"elements\":[]}},{\"length_filter\":{\"min\":200}},{\"average_quality_filter\":{\"min_quality\":35}},{\"homopolymer_filter\":{\"max_length\":20}},{\"find_shared\":{\"out_group_unique\":\"test-unique.fasta\"}}]}'},'processorsPerNode':12};

            serializedJob.should.equal(
                JSON.stringify(expectedResult)
            );
        });

    });
});
