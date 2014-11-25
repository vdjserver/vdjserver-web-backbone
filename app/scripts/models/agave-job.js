define(
    [
        'app',
        'backbone',
        'environment-config',
        'vdjpipe-serializer',
    ],
function(App, Backbone, EnvironmentConfig) {

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
        downloadFileToCache: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type:    'GET',
                url:     this.get('_links').self.href,
            });
            return jqxhr;
        },
        downloadFileToDisk: function() {
            var that = this;

            var xhr = new XMLHttpRequest();
            xhr.open(
                'get',
                this.get('_links').self.href
            );

            xhr.responseType = 'blob';
            xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));

            xhr.onload = function() {
                if (this.status === 200 || this.status === 202) {
                    window.saveAs(
                        new Blob([this.response]),
                        that.get('name')
                    );
                }
            };

            xhr.send();

            return xhr;
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
        // Public Methods
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.JobModel.prototype.defaults,
                {
                    //appId: 'vdj_pipe-0.1.2u2',
                    appId: 'vdj_pipe-0.1.2',
                }

            );
        },
        initialize: function() {
            this.archivePathDateFormat = 'YYYY-MM-DD-HH-mm-ss-SS';
        },
        prepareJob: function(formData, selectedFileMetadatas, allFileMetadatas, projectUuid) {

            this._setJobConfigFromWorkflowFormData(formData, selectedFileMetadatas, allFileMetadatas);
            this._setArchivePath(projectUuid);

            selectedFileMetadatas = this._updateSelectedFileMetadatasForBarcodes(
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );

            selectedFileMetadatas = this._updateSelectedFileMetadatasForBarcodeQualityScores(
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );

            selectedFileMetadatas = this._updateSelectedFileMetadatasForCombinationCsv(
                formData,
                selectedFileMetadatas,
                allFileMetadatas
            );

            this._setFilesParameter(selectedFileMetadatas);
        },
        submitJob: function(projectUuid) {

            var that = this;

            return this._createArchivePathDirectory(projectUuid)
                .then(function() {
                    return that.save();
                })
                // Create metadata
                .then(function() {
                    return that._createJobMetadata(projectUuid);
                })
                // Share job w/ project members
                .then(function() {
                    return that._shareJobWithProjectMembers(projectUuid);
                })
                ;
        },

        // Private Methods
        _updateSelectedFileMetadatasForBarcodeQualityScores: function(formData, selectedFileMetadatas, allFileMetadatas) {

            for (var i = 0; i < selectedFileMetadatas.models.length; i++) {

                var selectedFileMetadata = selectedFileMetadatas.at(i);

                var qualUuid = selectedFileMetadata.getAssociatedQualityScoreMetadataUuid();

                if (qualUuid) {
                    var qualFileMetadata = allFileMetadatas.get(qualUuid);

                    selectedFileMetadatas.add(qualFileMetadata);
                }
            }

            return selectedFileMetadatas;
        },
        _updateSelectedFileMetadatasForBarcodes: function(formData, selectedFileMetadatas, allFileMetadatas) {
            var keys = Object.keys(formData);

            // Find if any keys known to have extra files are present
            var matches = [];

            (function() {
                for (var i = 0; i < keys.length; i++) {
                    var search = keys[i].search('element-sequence-file');

                    if (search > -1) {
                        matches.push(keys[i]);
                    }
                }
            })();

            // Extract filenames from form
            var files = [];

            (function() {
                for (var i = 0; i < matches.length; i++) {
                    var fasta = formData[matches[i]];

                    files.push(fasta);
                }
            })();

            // Extract file metadata for filenames
            (function() {

                for (var i = 0; i < files.length; i++) {
                    var fastaMetadata = allFileMetadatas.getModelForName(files[i]);

                    // Add qual files
                    var qualUuid = fastaMetadata.getAssociatedQualityScoreMetadataUuid();

                    var qualMetadata = allFileMetadatas.get(qualUuid);

                    selectedFileMetadatas.add(fastaMetadata);
                    selectedFileMetadatas.add(qualMetadata);
                }

            })();

            return selectedFileMetadatas;
        },

        _updateSelectedFileMetadatasForCombinationCsv: function(formData, selectedFileMetadatas, allFileMetadatas) {
            var keys = Object.keys(formData);

            // Find if any keys known to have extra files are present
            var matches = [];

            (function() {
                for (var i = 0; i < keys.length; i++) {
                    var search = keys[i].search('combination-csv-file');

                    if (search > -1) {
                        matches.push(keys[i]);
                    }
                }
            })();

            // Extract filenames from form
            var files = [];

            (function() {
                for (var i = 0; i < matches.length; i++) {
                    var fasta = formData[matches[i]];

                    files.push(fasta);
                }
            })();

            // Extract file metadata for filenames
            (function() {

                for (var i = 0; i < files.length; i++) {
                    var csvMetadata = allFileMetadatas.getModelForName(files[i]);

                    selectedFileMetadatas.add(csvMetadata);
                }

            })();

            return selectedFileMetadatas;
        },

        _setJobConfigFromWorkflowFormData: function(formData, fileMetadatas, allFileMetadatas) {

            var workflowConfig = App.Utilities.VdjpipeSerializer.SerializeWorkflowConfig(
                formData,
                fileMetadatas,
                allFileMetadatas
            );

            var jobConfig = App.Utilities.VdjpipeSerializer.ConvertWorkflowConfigToVdjpipeConfig(workflowConfig);

            this.set('name', formData['job-name']);

            this.set(
                'parameters',
                {
                    'json': JSON.stringify(jobConfig),
                }
            );
        },
        _setArchivePath: function(projectUuid) {
            var archivePath = '/projects'
                            + '/' + projectUuid
                            + '/analyses'
                            + '/' + moment().format(this.archivePathDateFormat) + '-' + this._getDirectorySafeName(this.get('name'))
                            ;

            this.set('archivePath', archivePath);
        },
        _setFilesParameter: function(fileMetadatas) {
            var tmpFileMetadatas = fileMetadatas.pluck('value');

            var filePaths = [];
            for (var i = 0; i < tmpFileMetadatas.length; i++) {
                filePaths.push(
                    'agave://' + EnvironmentConfig.storageSystem
                    + '//projects'
                    + '/' + tmpFileMetadatas[i].projectUuid
                    + '/files'
                    + '/' + tmpFileMetadatas[i].name
                );
            }

            filePaths = filePaths.join(';');

            this.set('inputs', {
                'files': filePaths,
            });
        },
        _getDirectorySafeName: function(name) {
            return name.replace(/\s/g, '-').toLowerCase();
        },
        _getRelativeArchivePath: function() {
            var fullArchivePath = this.get('archivePath');
            var archivePathSplit = fullArchivePath.split('/');
            var relativeArchivePath = archivePathSplit.pop();

            return relativeArchivePath;
        },
        _createArchivePathDirectory: function(projectUuid) {

            var relativeArchivePath = this._getRelativeArchivePath();

            var jqxhr = $.ajax({
                data:   'action=mkdir&path=' + relativeArchivePath,
                headers: Backbone.Agave.oauthHeader(),
                type:   'PUT',
                url:    EnvironmentConfig.agaveRoot
                        + '/files/v2/media/system'
                        + '/' + EnvironmentConfig.storageSystem
                        + '//projects'
                        + '/' + projectUuid
                        + '/analyses',
            });

            return jqxhr;
        },
        _createJobMetadata: function(projectUuid) {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                }),
                contentType: 'application/json',
                url: EnvironmentConfig.vdjauthRoot + '/jobs/metadata',
            });

            return jqxhr;
        },
        _shareJobWithProjectMembers: function(projectUuid) {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                }),
                contentType: 'application/json',
                url: EnvironmentConfig.vdjauthRoot + '/permissions/jobs',
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
            var deferred = $.Deferred();

            deferred.resolve = true;

            return deferred;
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        setConfigFromFormData: function(formData) {

            var workflowConfig = App.Utilities.VdjpipeSerializer.SerializeWorkflowConfig(formData);

            var workflowName = App.Utilities.VdjpipeSerializer.GetWorkflowName(formData);

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

            if (config['steps'] && config['steps'].length === 0) {
                errors.push({
                    'message': 'Missing Configuration Steps.',
                    'type': 'configuration-steps',
                });
            }

            if (errors.length > 0) {
                return errors;
            }
        },
    });

    Backbone.Agave.Model.Job = Job;
    return Job;
});
