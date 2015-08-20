define(
    [
        'backbone',
        'environment-config',
        'moment',
    ],
function(Backbone, EnvironmentConfig, moment) {

    'use strict';

    var File = {};

    File = Backbone.Agave.Model.extend(
        {
            // Private methods

            // Path should be resemble this format: /projects/0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
            _getAssociationId: function() {
                var path = this.get('path');

                /*
                 * /projects/0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
                 * ->
                 * /projects
                 * and
                 * /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
                 */
                var split1 = path.split('/projects');

                /*
                 * /projects
                 * and
                 * /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
                 * ->
                 * /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
                 */
                var split2 = split1[split1.length - 1];

                /*
                 * /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
                 * ->
                 * ""
                 * and
                 * 0001438007785058-e0bd34dffff8de6-0001-012
                 * and
                 * files
                 * and
                 * mid_pair_1.fastq
                 */
                var split3 = split2.split('/');

                // 0001438007785058-e0bd34dffff8de6-0001-012
                return split3[1];
            },

            // Public methods
            idAttribute: 'path',
            defaults: {
                fileReference: '',
                format: '',
                lastModified: '',
                length: 0,
                name: '',
                path: '',
                permissions: '',
                projectUuid: '',
                system: '',
                type: '',
                _links: {},
            },
            url: function() {
                return '/files/v2/media/system'
                       + '/' + EnvironmentConfig.storageSystem
                       + '//projects'
                       + '/' + this.get('projectUuid')
                       + '/files/';
            },
            sync: function(method, model, options) {

                var that = this;

                switch (method) {
                    case 'read':
                    case 'delete':
                        return Backbone.Agave.sync(method, model, options);
                        //break;

                    case 'create':
                    case 'update':
                        var url = model.apiRoot + (options.url || _.result(model, 'url'));

                        var formData = new FormData();
                        formData.append('fileToUpload', model.get('fileReference'));

                        var deferred = $.Deferred();

                        var xhr = options.xhr || new XMLHttpRequest();
                        xhr.open('POST', url, true);
                        xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));
                        xhr.timeout = 0;

                        // Listen to the upload progress.
                        xhr.upload.onprogress = function(e) {
                            if (e.lengthComputable) {
                                var uploadProgress = (e.loaded / e.total) * 100;
                                model.trigger(File.UPLOAD_PROGRESS, uploadProgress);
                            }
                        };

                        model.on(File.CANCEL_UPLOAD, function() {
                            xhr.abort();
                        });

                        xhr.addEventListener('load', function() {

                            if (xhr.status === 200 || 202) {

                                // A little bit of a hack, but it does the trick
                                try {
                                    var parsedJSON = JSON.parse(xhr.response);
                                    parsedJSON = parsedJSON.result;
                                    that.set(parsedJSON);

                                    deferred.resolve(xhr.response);
                                }
                                catch (error) {
                                    deferred.reject('Error: Agave response serialization failed.');
                                }
                            }
                            else {
                                deferred.reject('HTTP Error: ' + xhr.status);
                            }
                        }, false);

                        xhr.addEventListener('error', function() {
                            deferred.reject('HTTP Error: ' + xhr.status);
                        });

                        xhr.send(formData);
                        return deferred;

                        //break;

                    default:
                        break;
                }

            },
            syncFilePermissionsWithProjectPermissions: function() {

                var jqxhr = $.ajax({
                    contentType: 'application/json',
                    data: JSON.stringify({
                        projectUuid: this.get('projectUuid'),
                        fileName: this.get('name')
                    }),
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    url: EnvironmentConfig.vdjauthRoot + '/permissions/files'
                });

                return jqxhr;
            },
            downloadFileToMemory: function() {

                var that = this;

                var path = '';

                if (this.get('jobUuid')) {
                    path = EnvironmentConfig.agaveRoot
                         + '/jobs'
                         + '/v2'
                         + '/' + this.get('jobUuid')
                         + '/outputs'
                         + '/media'
                         + '/' + this.get('name')
                         ;
                }
                else {
                    path = EnvironmentConfig.agaveRoot
                         + '/files'
                         + '/v2'
                         + '/media'
                         + '/system'
                         + '/' + EnvironmentConfig.storageSystem

                         // NOTE: this uses agave // paths
                         + '/' + this.get('path')
                         ;
                }

                return $.ajax({
                    url: path,
                    headers: {
                        'Authorization': 'Bearer ' + Backbone.Agave.instance.token().get('access_token'),
                    },
                });
            },
            downloadFileToDisk: function() {

                var that = this;

                var path = '';

                if (this.get('jobUuid')) {
                    path = EnvironmentConfig.agaveRoot
                         + '/jobs'
                         + '/v2'
                         + '/' + this.get('jobUuid')
                         + '/outputs'
                         + '/media'
                         + '/' + this.get('name')
                         ;
                }
                else {
                    path = EnvironmentConfig.agaveRoot
                         + '/files'
                         + '/v2'
                         + '/media'
                         + '/system'
                         + '/' + EnvironmentConfig.storageSystem

                         // NOTE: this uses agave // paths
                         + '/' + this.get('path')
                         ;
                }

                var xhr = new XMLHttpRequest();
                xhr.open(
                    'get',
                    path
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
            softDelete: function() {

                var that = this;
                var datetimeDir = moment().format('YYYY-MM-DD-HH-mm-ss-SS');

                var softDeletePromise = $.Deferred();

                $.ajax({
                    data:   'action=mkdir&path=' + datetimeDir,
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'PUT',

                    url:    EnvironmentConfig.agaveRoot
                            + '/files/v2/media/system'
                            + '/' + EnvironmentConfig.storageSystem
                            + '//projects'
                            + '/' + this.get('projectUuid')
                            + '/deleted/',

                    complete: function() {

                        $.ajax({
                            data:   'action=move&path='
                                    + '//projects'
                                    + '/' + that.get('projectUuid')
                                    + '/deleted'
                                    + '/' + datetimeDir
                                    + '/' + that.get('name'),

                            headers: Backbone.Agave.oauthHeader(),
                            type:   'PUT',

                            url:    EnvironmentConfig.agaveRoot
                                    + '/files/v2/media/system'
                                    + '/' + EnvironmentConfig.storageSystem
                                    + '/' + that.get('path'),

                            success: function() {
                                softDeletePromise.resolve();
                            },
                            error: function() {
                                softDeletePromise.reject();
                            },
                        });

                    },
                });

                return softDeletePromise;
            },
        },
        {
            CANCEL_UPLOAD: 'cancelUpload',
            UPLOAD_PROGRESS: 'uploadProgress',
        }
    );

    File.Dropbox = File.extend({
        sync: function(method, model, options) {

            var that = this;

            switch (method) {
                case 'read':
                case 'delete':
                    return Backbone.Agave.sync(method, model, options);
                    //break;

                case 'create':
                case 'update':

                    return $.ajax({
                        url: this.apiRoot + this.url(),
                        headers: {
                            'Authorization': 'Bearer ' + Backbone.Agave.instance.token().get('access_token'),
                        },
                        data: {
                            urlToIngest: this.get('urlToIngest'),
                        },
                        method: 'POST',
                    });
            }
        },
    });

    File.Metadata = Backbone.Agave.MetadataModel.extend(
        {
            // Public Methods
            defaults: function() {
                return _.extend(
                    {},
                    Backbone.Agave.MetadataModel.prototype.defaults,
                    {
                        name: 'projectFile',
                        owner: '',
                        value: {
                            'projectUuid': '',
                            'fileType': '',
                            'isDeleted': false,
                        },
                    }
                );
            },
            url: function() {
                return '/meta/v2/data/' + this.get('uuid');
            },
            syncMetadataPermissionsWithProjectPermissions: function() {

                var value = this.get('value');

                var jqxhr = $.ajax({
                    contentType: 'application/json',
                    data: JSON.stringify({
                        projectUuid: value.projectUuid,
                        uuid: this.get('uuid')
                    }),
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    url: EnvironmentConfig.vdjauthRoot + '/permissions/metadata'
                });

                return jqxhr;
            },
            softDelete: function() {
                var value = this.get('value');
                value.isDeleted = true;

                this.set('value', value);

                return this.save();
            },
            setInitialMetadata: function(file, formData) {

                var publicAttributes = {
                    'tags': this._formatTagsForSave(formData['tags']),
                };

                this.set({
                    associationIds: [file._getAssociationId()],
                    value: {
                        projectUuid: file.get('projectUuid'),
                        fileType: parseInt(formData['file-type']),
                        name: file.get('name'),
                        length: file.get('fileReference').size,
                        isDeleted: false,
                        readDirection: this._formatReadDirectionForInitialSave(formData),
                        publicAttributes: publicAttributes,
                    },
                });
            },
            updateTags: function(tags) {

                var value = this.get('value');

                var tagArray = this._formatTagsForSave(tags);

                value['publicAttributes']['tags'] = tagArray;

                this.set('value', value);

                return this.save();
            },
            getFilePath: function() {

                var value = this.get('value');
                var filePath = '';

                if (this.get('name') === 'projectFile') {

                    filePath = '/projects'
                             + '/' + value['projectUuid']
                             + '/files'
                             + '/' + encodeURIComponent(value['name'])
                             ;
                }
                else if (this.get('name') === 'projectJobFile') {

                    filePath = '/projects'
                             + '/' + value['projectUuid']
                             + '/analyses'
                             + '/' + value['relativeArchivePath']
                             + '/' + encodeURIComponent(value['name'])
                             ;
                }

                return filePath;
            },
            getFileModel: function() {
                var value = this.get('value');

                var fileModel = new File({
                    path: this.getFilePath(),
                    projectUuid: value['projectUuid'],
                    jobUuid: value['jobUuid'],
                    name: value['name'],
                });

                return fileModel;
            },
            getReadDirection: function() {
                var value = this.get('value');

                var readDirection = value['readDirection'];

                return readDirection;
            },
            setReadDirection: function(newReadDirection) {
                var value = this.get('value');

                value['readDirection'] = newReadDirection;

                this.set('value', value);

                return this.save();
            },
            getQualityScoreMetadataUuid: function() {
                var value = this.get('value');

                var qualUuid = value['qualityScoreMetadataUuid'];

                return qualUuid;
            },
            setQualityScoreMetadataUuid: function(qualityScoreMetadataUuid) {
                var value = this.get('value');

                value['qualityScoreMetadataUuid'] = qualityScoreMetadataUuid;

                this.set('value', value);

                return this.save();
            },
            removeQualityScoreMetadataUuid: function() {
                var value = this.get('value');

                delete value['qualityScoreMetadataUuid'];

                this.set('value', value);

                return this.save();
            },
            getPairedReadMetadataUuid: function() {
                var value = this.get('value');

                var pairedReadUuid = value['pairedReadMetadataUuid'];

                return pairedReadUuid;
            },
            setPairedReadMetadataUuid: function(pairedReadMetadataUuid) {
                var value = this.get('value');

                value['pairedReadMetadataUuid'] = pairedReadMetadataUuid;

                this.set('value', value);

                return this.save();
            },
            removePairedReadMetadataUuid: function() {
                var value = this.get('value');

                delete value['pairedReadMetadataUuid'];

                this.set('value', value);

                return this.save();
            },
            getFileType: function() {
                var value = this.get('value');

                return value['fileType'];
            },
            updateFileType: function(fileType) {
                var value = this.get('value');

                value['fileType'] = fileType;

                this.set('value', value);

                return this.save();
            },
            getFileExtension: function() {
                var value = this.get('value');

                var fileExtension = value['name'].split('.').pop();

                return fileExtension;
            },

            // Private Methods
            _formatTagsForSave: function(tagString) {

                var tagArray = [];

                if (tagString) {
                    tagArray = $.map(tagString.split(','), $.trim);
                }

                return tagArray;
            },
            _formatReadDirectionForInitialSave: function(formData) {
                if (formData['forward-reads'] && formData['reverse-reads']) {
                    return 'FR';
                }
                else if (formData['forward-reads'] && !formData['reverse-reads']) {
                    return 'F';
                }
                else if (formData['reverse-reads'] && !formData['forward-reads']) {
                    return 'R';
                }
                else {
                    return '';
                }
            },
        },
        {
            FILE_TYPE_0: 'Barcode Sequences',
            FILE_TYPE_1: 'Primer Sequences',
            FILE_TYPE_2: 'Read-Level Data',
            FILE_TYPE_3: 'Barcode Combinations',
            FILE_TYPE_4: 'Specify Later',

            getFileTypeById: function(fileTypeId) {

                var fileType = '';

                switch (fileTypeId) {
                    case 0:
                        fileType = this.FILE_TYPE_0;
                        break;

                    case 1:
                        fileType = this.FILE_TYPE_1;
                        break;

                    case 2:
                        fileType = this.FILE_TYPE_2;
                        break;

                    case 3:
                        fileType = this.FILE_TYPE_3;
                        break;

                    case 4:
                        fileType = this.FILE_TYPE_4;
                        break;

                    default:
                        break;
                }

                return fileType;
            },

            getFileTypes: function() {
                return [
                    this.FILE_TYPE_0,
                    this.FILE_TYPE_1,
                    this.FILE_TYPE_2,
                    this.FILE_TYPE_3,
                    this.FILE_TYPE_4,
                ];
            },

            isFileTypeIdQualAssociable: function(fileTypeId) {
                var isQualAssociable = false;

                switch (fileTypeId) {
                    case 2:
                    case 4:
                        isQualAssociable = true;
                        break;

                    default:
                        // code
                        break;
                }

                return isQualAssociable;
            },

            doesFileTypeIdHaveReadDirection: function(fileTypeId) {

                var hasReadDirection = true;

                switch (fileTypeId) {
                    case 0:
                    case 1:
                    case 3:
                    case 4:
                        hasReadDirection = false;
                        break;

                    default:
                        // code
                        break;
                }

                return hasReadDirection;
            },

            getReadDirections: function() {
                return [
                    'F',
                    'R',
                    'FR',
                ];
            },
        }
    );

    Backbone.Agave.Model.File = File;
    return File;
});
