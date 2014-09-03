define(['app', 'backbone', 'vdjpipe-utilities'], function(App, Backbone) {

    'use strict';

    var Job = {};

    Job.Detail = Backbone.Agave.Model.extend({
        defaults: {
            id: '',
        },
        url: function() {
            return '/jobs/v2/' + this.get('id');
        },
    });

    Job.OutputFile = Backbone.Agave.Model.extend({
        idAttribute: 'name',
        downloadFile: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type: 'GET',
                url: this.get('_links').self.href,
            });
            return jqxhr;
        },
    });

    Job.Listing = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'projectJob',
                    owner: '',
                    value: {
                        'projectUuid': '',
                        'jobUuid': '',
                    },
                }
            );
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
    });

    Job.VdjPipe = Backbone.Agave.JobModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.JobModel.prototype.defaults,
                {
                    appId: 'vdj_pipe-0.0.12u1',
                }
            );
        },
        initialize: function() {
            this.archivePathDateFormat = 'YYYY-MM-DD-HH-mm-ss-SS';
        },
        setJobConfigFromWorkflowFormData: function(formData) {

            console.log("job set top - form data is: " + JSON.stringify(formData));
            var workflowConfig = App.Models.Helpers.VdjPipeUtilities.SerializeWorkflowConfig(formData);

            console.log("job set - workflowConfig is: " + JSON.stringify(workflowConfig));

            var jobConfig = App.Models.Helpers.VdjPipeUtilities.ConvertWorkflowConfigToVdjpipeConfig(workflowConfig);

            console.log("job set - jobConfig is: " + JSON.stringify(jobConfig));

            this.set(
                'parameters',
                {
                    'json': JSON.stringify(jobConfig),
                }
            );

        },
        setFilesParameter: function(filePaths) {

            filePaths = filePaths.join(';');

            this.set('inputs', {
                'files': filePaths,
            });
        },
        setArchivePath: function(projectUuid) {
            var archivePath = '/projects/'
                            + projectUuid
                            + '/analyses/'
                            + moment().format(this.archivePathDateFormat)
                            + '-' + this.getDirectorySafeName(this.get('name'));

            this.set('archivePath', archivePath);

            console.log("archivePath is: " + archivePath);
        },
        getDirectorySafeName: function(name) {
            console.log("name input is: " + name);
            return name.replace(/\s/g, '-').toLowerCase();
        },
        getRelativeArchivePath: function() {
            var fullArchivePath = this.get('archivePath');
            var archivePathSplit = fullArchivePath.split('/');
            var relativeArchivePath = archivePathSplit[4];

            return relativeArchivePath;
        },
        createArchivePathDirectory: function(projectUuid) {

            var relativeArchivePath = this.getRelativeArchivePath();

            console.log("relativeArchivePath is: " + relativeArchivePath);

            var jqxhr = $.ajax({
                data: 'action=mkdir&path=' + relativeArchivePath,
                headers: Backbone.Agave.oauthHeader(),
                type: 'PUT',
                url: Backbone.Agave.apiRoot + '/files/v2/media/system/data.vdjserver.org//projects/' + projectUuid + '/analyses',
            });

            return jqxhr;
        },
        createJobMetadata: function(projectUuid) {
            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/jobs/metadata',
            });

            return jqxhr;
        },
        shareJobWithProjectMembers: function(projectUuid) {
            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/permissions/jobs',
            });

            return jqxhr;
        },
    });

    Job.Workflow = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'vdjpipeWorkflow',
                    owner: '',
                    value: {
                        'config': '',
                        'workflowName': '',
                    },
                }
            );
        },
        fakeSync: function() {
            console.log("calling fakeSync");
            var deferred = $.Deferred();

            deferred.resolve = true;

            return deferred;
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        setConfigFromFormData: function(formData) {

            var workflowConfig = App.Models.Helpers.VdjPipeUtilities.SerializeWorkflowConfig(formData);

            var workflowName = App.Models.Helpers.VdjPipeUtilities.GetWorkflowName(formData);

            this.set(
                'value',
                {
                    'config': workflowConfig,
                    'workflowName': workflowName,
                }
            );
        },
        setConfigFromPreconfiguredData: function(data) {

            var workflowName = data['workflow-name'];
            delete data['workflow-name'];

            this.set(
                'value',
                {
                    'config': data,
                    'workflowName': workflowName,
                }
            );

            this.set(
                'uuid',
                workflowName
            );
        },
        validate: function() {
            var value = this.get('value');
            var config = value.config;

            var errors = [];

            if (!value.workflowName) {
                errors.push({
                    'message': 'Missing Workflow Name.',
                    'type': 'workflow-name',
                });
            }

            // Check if either |single_read_pipe| or |paired_read_pipe| is available.
            if (config['single_read_pipe'] && config['single_read_pipe'].length === 0) {
                errors.push({
                    'message': 'Missing Configuration Steps.',
                    'type': 'configuration-steps',
                });
            }
            else if (config['paired_read_pipe'] && config['paired_read_pipe'].length === 0) {
                errors.push(
                    new App.Models.Error({
                        'message': 'Missing Configuration Steps.',
                        'type': 'configuration-steps',
                    })
                );
            }

            if (errors.length > 0) {
                return errors;
            }
        },
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
});
