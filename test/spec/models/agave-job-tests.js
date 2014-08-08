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

    });
});
