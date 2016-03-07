define(
    [
        'backbone',
        'environment-config',
        'moment',
        'file-transfer-mixins',
        'chance',
        'underscore.string',
    ],
function(
    Backbone,
    EnvironmentConfig,
    moment,
    FileTransferMixins,
    Chance,
    _string
) {

    'use strict';

    var FilePlaceholderMixin = {};

    FilePlaceholderMixin.getNameGuid = function(name) {

        // Remove url params from name - otherwise it'll be hard to match it up with websocket messages later on
        if (name.indexOf('?') !== -1) {
            name = name.split('?')[0];
        }

        var nameGuid = _string.slugify(name);
        return nameGuid;
    };

    var File = {};

    File = Backbone.Agave.Model.extend(
        _.extend({}, FilePlaceholderMixin,
            {
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
                initialize: function(parameters) {
                    Backbone.Agave.Model.prototype.initialize.apply(this, [parameters]);

                    this.relativeUrl = '';

                    if (_.isObject(parameters) && parameters.hasOwnProperty('relativeUrl')) {
                        this.relativeUrl = parameters.relativeUrl;
                    }

                    this.uniqueIdentifier = this.generateUniqueIdentifier();
                },
                generateUniqueIdentifier: function() {
                    var chance = new Chance();

                    return chance.guid();
                },
                url: function() {
                    return '/files/v2/listings/system'
                        + '/' + EnvironmentConfig.agave.storageSystems.corral
                        + this.relativeUrl
                    ;
                },
                applyUploadAttributes: function(formData) {
                    this.set('vdjFileType', formData['file-type-' + this.get('formElementGuid')]);

                    if (formData.hasOwnProperty('read-direction-' + this.get('formElementGuid'))) {
                        this.set('readDirection', formData['read-direction-' + this.get('formElementGuid')]);
                    }

                    if (formData.hasOwnProperty('tags-' + this.get('formElementGuid'))) {
                        this.set('tags', formData['tags-' + this.get('formElementGuid')]);
                    }
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
                            var url = model.apiHost + (options.url || _.result(model, 'url'));

                            var formData = new FormData();
                            formData.append('fileToUpload', model.get('fileReference'));

                            var that = this;

                            var request = $.ajax({
                                beforeSend: function(xhr) {
                                    xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));
                                },
                                xhr: function() {

                                    var xhr = $.ajaxSettings.xhr();

                                    if (typeof xhr.upload == 'object') {
                                        xhr.upload.addEventListener('progress', function(evt) {
                                            if (evt.lengthComputable) {
                                                that.trigger(File.UPLOAD_PROGRESS, evt.loaded);
                                            }

                                        }, false);
                                    }

                                    that.listenTo(that, File.CANCEL_UPLOAD, function() {
                                        xhr.abort();
                                    });

                                    return xhr;
                                },
                                url: url,
                                type: 'POST',
                                data: formData,
                                processData: false,
                                contentType: false,
                            })
                            .then(function(response) {
                                that.set('uuid', response.result.uuid);
                                that.set('path', '/vdjZ' + response.result.path);
                            })
                            ;

                            return request;

                        default:
                            break;
                    }

                },
                notifyApiUploadComplete: function() {

                    var readDirection = '';
                    var tags = '';
                    var that = this;

                    if (_.isString(this.get('readDirection'))) {
                        readDirection = this.get('readDirection');
                    }

                    if (_.isString(this.get('tags'))) {
                        tags = this.get('tags');
                    }

                    return $.ajax({
                        url: EnvironmentConfig.vdjApi.host
                                + '/notifications'
                                + '/files'
                                + '/import'
                                + '?fileUuid=' + this.get('uuid')
                                + '&path=' + this.get('path')
                                + '&projectUuid=' + this.get('projectUuid')
                                + '&vdjFileType=' + this.get('vdjFileType')
                                + '&readDirection=' + readDirection
                                + '&tags=' + encodeURIComponent(tags)
                                ,
                        type: 'POST',
                        processData: false,
                        contentType: false,
                    })
                    ;
                },
                getFileStagedNotificationData: function() {

                    var nameGuid = this.getNameGuid(this.get('name'));

                    return {
                        'value': {
                            'name': this.get('name'),
                        },
                        'projectUuid': this.get('projectUuid'),
                        'uuid': nameGuid,
                    };
                },
            }
        ),
        {
            CANCEL_UPLOAD: 'cancelUpload',
            UPLOAD_PROGRESS: 'uploadProgress',

            fileTypeCodes: {
                FILE_TYPE_BARCODE: 0,
                FILE_TYPE_PRIMER: 1,
                FILE_TYPE_READ: 2,
                FILE_TYPE_BARCODE_COMBO: 3, // deprecated
                FILE_TYPE_UNSPECIFIED: 4,
                FILE_TYPE_QUALITY: 5,
                FILE_TYPE_TSV: 6,
                FILE_TYPE_CSV: 7,
                FILE_TYPE_VDJML: 8,
                FILE_TYPE_FASTA: 9,
                FILE_TYPE_FASTQ: 10,
            },

            // index should map to codes
            fileTypeNames: [
                'Barcode Sequences',
                'Primer Sequences',
                'Read-Level Data',
                'Barcode Combinations', // deprecated
                'Unspecified',
                'Quality Scores',
                'TAB-separated Text',
                'Comma-separated Text',
                'VDJML',
                'Read-Level (FASTA) Data',
                'Read-Level (FASTQ) Data',
            ],
        }
    );

    // 13/Aug/2015 TODO: merge File.ProjectFile w/ Job.OutputFile
    File.ProjectFile = File.extend(
        _.extend({}, FileTransferMixins, {

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
            url: function() {
                return '/files/v2/media/system'
                       + '/' + EnvironmentConfig.agave.storageSystems.corral
                       + '//projects'
                       + '/' + this.get('projectUuid')
                       + '/files/';
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
                    url: EnvironmentConfig.vdjApi.host + '/permissions/files'
                });

                return jqxhr;
            },
            // TODO: merge this with agave-job model downloadFileToCache()
            downloadFileToMemory: function() {

                var that = this;

                var path = '';

                if (this.get('jobUuid')) {
                    path = EnvironmentConfig.agave.host
                         + '/jobs'
                         + '/v2'
                         + '/' + this.get('jobUuid')
                         + '/outputs'
                         + '/media'
                         + '/' + this.get('name')
                         ;
                }
                else {
                    path = EnvironmentConfig.agave.host
                         + '/files'
                         + '/v2'
                         + '/media'
                         + '/system'
                         + '/' + EnvironmentConfig.agave.storageSystems.corral

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
            downloadFileToDisk: function(totalSize) {

                var url = EnvironmentConfig.agave.host
                        + '/files'
                        + '/v2'
                        + '/media'
                        + '/system'
                        + '/' + EnvironmentConfig.agave.storageSystems.corral

                        // NOTE: this uses agave // paths
                        + '/' + this.get('path')
                        ;

                if (this.has('jobUuid') && this.get('jobUuid').length > 0) {

                    url = EnvironmentConfig.agave.host
                        + '/jobs'
                        + '/v2'
                        + '/' + this.get('jobUuid')
                        + '/outputs'
                        + '/media'
                        + '/' + this.get('name')
                        ;
                }

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },
            softDelete: function() {

                var that = this;
                var datetimeDir = moment().format('YYYY-MM-DD-HH-mm-ss-SS');

                var softDeletePromise = $.Deferred();

                $.ajax({
                    data:   'action=mkdir&path=' + datetimeDir,
                    headers: Backbone.Agave.oauthHeader(),
                    type:   'PUT',

                    url:    EnvironmentConfig.agave.host
                            + '/files/v2/media/system'
                            + '/' + EnvironmentConfig.agave.storageSystems.corral
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

                            url:    EnvironmentConfig.agave.host
                                    + '/files/v2/media/system'
                                    + '/' + EnvironmentConfig.agave.storageSystems.corral
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
        })
    );

    File.Community = File.extend(
        _.extend({}, FileTransferMixins, {
            downloadFileToDisk: function() {
                var that = this;

                var url = '';

                url = EnvironmentConfig.agave.host
                    + '/files'
                    + '/v2'
                    + '/media'
                    + '/system'
                    + '/' + EnvironmentConfig.agave.storageSystems.corral
                    + '//community'
                    + '/' + this.get('communityUuid')
                    + '/files'
                    + '/' + this.get('filename')
                    ;

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },
        })
    );

    File.UrlImport = File.extend({
        url: function() {
            return '/files/v2/media/system'
                + '/' + EnvironmentConfig.agave.storageSystems.corral
                + '//projects'
                + '/' + this.get('projectUuid')
                + '/files/'
            ;
        },
        getFilenameFromSourceUrl: function() {
            var urlSplit = this.get('urlToIngest').split('/');
            var filename = urlSplit.pop();

            return filename;
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

                    //var that = this;

                    return $.ajax({
                        url: this.apiHost + this.url(),
                        headers: {
                            'Authorization': 'Bearer ' + Backbone.Agave.instance.token().get('access_token'),
                        },
                        /*
                        xhr: function() {

                            var xhr = $.ajaxSettings.xhr();

                            that.listenTo(that, File.CANCEL_UPLOAD, function() {
                                console.log('cancel upload received: ' + model.get('name'));
                                xhr.abort();
                            });

                            return xhr;
                        },
                        */
                        data: {
                            urlToIngest: this.get('urlToIngest'),
                            callbackURL: EnvironmentConfig.vdjApi.host
                                        + '/notifications'
                                        + '/files'
                                        + '/import'
                                        + '/?fileUuid=${UUID}'
                                        + '&event=${EVENT}'
                                        + '&type=${TYPE}'
                                        //+ '&format=${FORMAT}'
                                        + '&path=${PATH}'
                                        + '&system=${SYSTEM}'
                                        + '&projectUuid=' + this.get('projectUuid')
                                        ,
                        },
                        method: 'POST',

                    })
                    .then(function() {
                        that.set('name', that.getFilenameFromSourceUrl());
                    })
                    ;
            }
        },
    });

    // 13/Aug/2015 TODO: abstract this out into a more generic base class and inherit
    File.Metadata = Backbone.Agave.MetadataModel.extend(
        _.extend({}, FilePlaceholderMixin, {
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
                            'isPlaceholder': false,
                        },
                    }
                );
            },
            url: function() {
                return '/meta/v2/data/' + this.get('uuid');
            },
            addPlaceholderMarker: function() {
                this.set('isPlaceholder', true);
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
                    url: EnvironmentConfig.vdjApi.host + '/permissions/metadata'
                });

                return jqxhr;
            },
            softDelete: function() {
                var value = this.get('value');
                value.isDeleted = true;

                this.set('value', value);

                return this.save();
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

                var fileModel = new File.ProjectFile({
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
        }),
        {

            getFileTypeById: function(fileTypeId) {
                return File.fileTypeNames[fileTypeId];
            },

            getFileTypes: function() {
                return [
                    File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_BARCODE],
                    File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_PRIMER],
                    File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_READ],
                    File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_BARCODE_COMBO],
                    File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_UNSPECIFIED],
                    File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_QUALITY],
                ];
            },

            isFileTypeIdQualAssociable: function(fileTypeId) {
                var isQualAssociable = false;

                switch (fileTypeId) {
                    case File.fileTypeCodes.FILE_TYPE_READ:
                    case File.fileTypeCodes.FILE_TYPE_QUALITY:
                        isQualAssociable = true;
                        break;

                    default:
                        // code
                        break;
                }

                return isQualAssociable;
            },

            doesFileTypeIdHaveReadDirection: function(fileTypeId) {

                var hasReadDirection = false;

                switch (fileTypeId) {
                    case File.fileTypeCodes.FILE_TYPE_READ:
                        hasReadDirection = true;
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
