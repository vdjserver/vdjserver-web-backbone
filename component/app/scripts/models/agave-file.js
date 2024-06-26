
'use strict';

//
// agave-file.js
// File models
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import Backbone from 'backbone';
import { Agave } from 'Scripts/backbone/backbone-agave';
import _string from 'underscore.string';
import Chance from 'chance';
import { FileTransfers } from 'Scripts/models/mixins/file-transfer-mixins';
import moment from 'moment';

// AIRR Schema
import { airr } from 'airr-js';
import { vdj_schema } from 'vdjserver-schema';

// A raw file within the Tapis Files API
// this is used for uploading files
export var File = Agave.Model.extend({
    // Public methods
    idAttribute: 'path',
    defaults: {
        type: '',
        url: '',
        lastModified: '',
        size: 0,
        name: '',
        path: ''
    },
    initialize: function(parameters) {
        Agave.Model.prototype.initialize.apply(this, [parameters]);

        this.relativeUrl = '';

        if (_.isObject(parameters) && parameters.hasOwnProperty('relativeUrl')) {
            this.relativeUrl = parameters.relativeUrl;
        }
    },
    apiHost: EnvironmentConfig.agave.internal,
    authType: 'jwt',
    url: function() {
        return '/v3/files/ops/'
            + EnvironmentConfig.agave.systems.storage.corral.hostname
            + this.relativeUrl
        ;
    },
    sync: function(method, model, options) {

        switch (method) {
            case 'read':
            case 'delete':
                return Agave.sync(method, model, options);
                //break;

            // file uploading
            case 'create':
            case 'update':
                if (model.get('name')) {
                    model.set('name', File.cleanName(model.get('name')));
                }

                var url = model.apiHost + (options.url || _.result(model, 'url'));

                var formData = new FormData();
                formData.append('file', model.get('fileReference'));

                var that = this;

                var request = Agave.ajax({
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('X-Tapis-Token', Agave.instance.token().get('access_token'));
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
                    console.log(response);
                    //that.set('uuid', response.result.uuid);
                    that.set('path', '/projects/' + that.get('projectUuid')
                        + '/files/' + that.get('name'));
                });

                return request;

            default:
                break;
        }

    },
    notifyApiUploadComplete: function() {

        var obj = {
            path: this.get('name'),
            fileType: this.get('type'),
            readDirection: '',
            tags: ''
        };

        if (_.isString(this.get('readDirection'))) {
            obj['readDirection'] = this.get('readDirection');
        }

        if (_.isString(this.get('tags'))) {
            obj['tags'] = this.get('tags');
        }

        var that = this;
        return new Promise((resolve, reject) => {
            $.ajax({
                headers: Agave.oauthHeader(),
                url: EnvironmentConfig.vdjApi.hostname
                        + '/project/'
                        + this.get('projectUuid')
                        + '/file'
                        + '/import'
                        ,
                type: 'POST',
                data: JSON.stringify(obj),
                processData: false,
                contentType: 'application/json',
                success: function (data) {
                    resolve(data)
                },
                error: function (error) {
                    reject(error)
                },
            })
        });
    },
},
{
    //
    // class (global) variables and functions
    //

    CANCEL_UPLOAD: 'cancelUpload',
    UPLOAD_PROGRESS: 'uploadProgress',
    STAGE_PROGRESS: 'stageProgress',

    // These should not be used directly for display, instead use the
    // getFileTypes() and getFileTypeNames() functions which provide
    // the types in a specific order for display
    fileTypeCodes: {
        FILE_TYPE_UNSPECIFIED: 0,
        FILE_TYPE_PRIMER: 1,
        FILE_TYPE_FASTQ_READ: 2,
        FILE_TYPE_FASTA_READ: 3,
        FILE_TYPE_BARCODE: 4,
        FILE_TYPE_QUALITY: 5,
        FILE_TYPE_TSV: 6,
        FILE_TYPE_CSV: 7,
        FILE_TYPE_VDJML: 8,
        FILE_TYPE_AIRR_TSV: 9,
        FILE_TYPE_AIRR_JSON: 10,
    },

    // index should map to codes
    fileTypeNames: [
        'Unspecified',
        'Primer Sequences',
        'FASTQ Read Data',
        'FASTA Sequences',
        'Barcode Sequences',
        'Quality Scores',
        'TAB-separated Values',
        'Comma-separated Values',
        'VDJML',
        'AIRR TSV',
        'AIRR JSON',
    ],

    getFileTypeById: function(fileTypeId) {
        if (fileTypeId === undefined) return File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_UNSPECIFIED];
        if (File.fileTypeNames[fileTypeId] === undefined) return File.fileTypeNames[File.fileTypeCodes.FILE_TYPE_UNSPECIFIED];
        return File.fileTypeNames[fileTypeId];
    },

    getFileTypes: function() {
        // put them in a specific order for display
        return [
            File.fileTypeCodes.FILE_TYPE_UNSPECIFIED,
            File.fileTypeCodes.FILE_TYPE_FASTQ_READ,
            File.fileTypeCodes.FILE_TYPE_FASTA_READ,
            File.fileTypeCodes.FILE_TYPE_BARCODE,
            File.fileTypeCodes.FILE_TYPE_PRIMER,
            File.fileTypeCodes.FILE_TYPE_QUALITY,
            File.fileTypeCodes.FILE_TYPE_AIRR_TSV,
            File.fileTypeCodes.FILE_TYPE_AIRR_JSON,
            File.fileTypeCodes.FILE_TYPE_TSV,
            File.fileTypeCodes.FILE_TYPE_CSV,
            File.fileTypeCodes.FILE_TYPE_VDJML
        ];
    },

    getNamesForFileTypes: function(fileTypeIds) {
        var fileTypeNames = [];

        for (var i = 0; i < fileTypeIds.length; ++i) {
            fileTypeNames.push(this.getFileTypeById(fileTypeIds[i]));
        }

        return fileTypeNames;
    },

    getFileTypeNames: function() {
        return this.getNamesForFileTypes(this.getFileTypes());
    },

    cleanName: function(name) {
        // Replace symbols that could cause problems on file systems
        var allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.",
            regex = new RegExp('.', 'g');

        name = name.replace(regex, function(c) {
          var index = allowed.indexOf(c);
          if (index >= 0) return c;
          else return '_';
        });

        return name;
    },

    guessTypeFromName: function(name) {
        var guessType = File.fileTypeCodes.FILE_TYPE_UNSPECIFIED;
        var components = name.split('.');
        if (components.length > 1) {
            var idx = components.length - 1;
            if ((components[idx] == 'gz') ||
                (components[idx] == 'zip') ||
                (components[idx] == 'bz2')) --idx;
            if (components[idx] == 'fasta') guessType = File.fileTypeCodes.FILE_TYPE_FASTA_READ;
            if (components[idx] == 'fastq') guessType = File.fileTypeCodes.FILE_TYPE_FASTQ_READ;
            if (components[idx] == 'fna') guessType = File.fileTypeCodes.FILE_TYPE_FASTA_READ;
            if (components[idx] == 'qual') guessType = File.fileTypeCodes.FILE_TYPE_QUALITY;
            if (components[idx] == 'tsv') {
                if (components[idx-1] && components[idx-1] == 'airr')
                    guessType = File.fileTypeCodes.FILE_TYPE_AIRR_TSV;
                else
                    guessType = File.fileTypeCodes.FILE_TYPE_TSV;
            }
            if (components[idx] == 'csv') guessType = File.fileTypeCodes.FILE_TYPE_CSV;
            if (components[idx] == 'vdjml') guessType = File.fileTypeCodes.FILE_TYPE_VDJML;
        }

        if (components.length > 2) {
            var idx1 = components.length - 1;
            var idx2 = components.length - 2;
            if ((components[idx1] == 'tsv') && (components[idx2] == 'airr')) guessType = File.fileTypeCodes.FILE_TYPE_AIRR_TSV;
        }

        return guessType;
    },

    getReadDirections: function() {
        return [
            'F',
            'R',
            'FR',
        ];
    },

    doesFileTypeIdHaveReadDirection: function(fileTypeId) {
        var hasReadDirection = false;
        switch (fileTypeId) {
            case File.fileTypeCodes.FILE_TYPE_FASTQ_READ:
            case File.fileTypeCodes.FILE_TYPE_FASTA_READ:
                hasReadDirection = true;
                break;
            default:
                // code
                break;
        }
        return hasReadDirection;
    },
});

export var ProjectFile = File.extend(
    _.extend({}, FileTransfers, {

        // Private methods

        // Path should be resemble this format: /projects/0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
        _getAssociationId: function() {
            var path = this.get('path');

            // /projects/0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
            // ->
            // /projects
            // and
            // /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
            //
            var split1 = path.split('/projects');

            //
            // /projects
            // and
            // /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
            // ->
            // /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
            //
            var split2 = split1[split1.length - 1];

            //
            // /0001438007785058-e0bd34dffff8de6-0001-012/files/mid_pair_1.fastq
            // ->
            // ""
            // and
            // 0001438007785058-e0bd34dffff8de6-0001-012
            // and
            // files
            // and
            // mid_pair_1.fastq
            //
            var split3 = split2.split('/');

            // 0001438007785058-e0bd34dffff8de6-0001-012
            return split3[1];
        },

        // Public methods
        url: function() {
            return '/v3/files/ops/'
                + EnvironmentConfig.agave.systems.storage.corral.hostname
                + '//projects'
                + '/' + this.get('projectUuid')
                + '/files/'
                + this.get('name');
/*            return '/files/v2/media/system'
                   + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                   + '//projects'
                   + '/' + this.get('projectUuid')
                   + '/files/'; */
        },
        // TODO: merge this with agave-job model downloadFileToCache()
        downloadFileToMemory: function() {

            var that = this;

            var path = '';

            if (this.get('jobUuid')) {
                path = EnvironmentConfig.agave.hostname
                     + '/jobs'
                     + '/v2'
                     + '/' + this.get('jobUuid')
                     + '/outputs'
                     + '/media'
                     + '/' + this.get('name')
                     ;
            }
            else {
                path = EnvironmentConfig.agave.hostname
                     + '/files'
                     + '/v2'
                     + '/media'
                     + '/system'
                     + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname

                     // NOTE: this uses agave // paths
                     + '/' + this.get('path')
                     ;
            }

            return Backbone.Agave.ajax({
                url: path,
                headers: {
                    'Authorization': 'Bearer ' + Backbone.Agave.instance.token().get('access_token'),
                },
            });
        },

        downloadFileListToDisk: function(files) {
            function downloadNext(i) {
                if (i >= files.length) {
                    return;
                }

                files[i].downloadFileToDisk();

                setTimeout(function () { downloadNext(i + 1); }, 5000);
            }

            downloadNext(0);
        },

        softDelete: function() {

            var that = this;
            var datetimeDir = moment().format('YYYY-MM-DD-HH-mm-ss-SS');

            var softDeletePromise = $.Deferred();

            Backbone.Agave.ajax({
                data:   'action=mkdir&path=' + datetimeDir,
                headers: Backbone.Agave.oauthHeader(),
                type:   'PUT',

                url:    EnvironmentConfig.agave.hostname
                        + '/files/v2/media/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects'
                        + '/' + this.get('projectUuid')
                        + '/deleted/',

                complete: function() {

                    Backbone.Agave.ajax({
                        data:   'action=move&path='
                                + '//projects'
                                + '/' + that.get('projectUuid')
                                + '/deleted'
                                + '/' + datetimeDir
                                + '/' + that.get('name'),

                        headers: Backbone.Agave.oauthHeader(),
                        type:   'PUT',

                        url:    EnvironmentConfig.agave.hostname
                                + '/files/v2/media/system'
                                + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
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

// metadata entry for project file
var projectFileSchema = null;
export var ProjectFileMetadata = Agave.MetadataModel.extend({
    defaults: function() {

        // VDJServer schema Study object as basis
        if (! projectFileSchema) projectFileSchema = new vdj_schema.SchemaDefinition('ProjectFile');
        this.schema = projectFileSchema;
        var blankEntry = projectFileSchema.template();

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'project_file',
                value: blankEntry
            }
        );
    },

    sync: function(method, model, options) {
        // handle delete specially
        // need to delete both the file and metadata
        if (method === 'delete') {
            var value = model.get('value');
            options.url = '/project/' + this.projectUuid + '/file/name/' + encodeURIComponent(value['name']);
            options.authType = 'oauth';
        }

        return Agave.MetadataModel.prototype.sync.call(this, method, model, options);
    },

    softDelete: function() {
        var value = this.get('value');
        value.isDeleted = true;

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

/*
    getFileModel: function() {
        var value = this.get('value');

        var fileModel = new ProjectFile({
            path: this.getFilePath(),
            projectUuid: value['projectUuid'],
            jobUuid: value['jobUuid'],
            name: value['name'],
            fileUuid: this.get('uuid'),
        });

        return fileModel;
    }, */

    getFileExtension: function() {
        var value = this.get('value');

        var fileExtension = value['name'].split('.').pop();

        return fileExtension;
    },

    getAIRRFileType: function() {
        var value = this.get('value');
        var types = ["fasta","fastq",null];

        //paired with a quality score
        if(value['qualityScoreMetadataUuid'] != null) return types[0];
        //paired, no quality score
        else if(value['pairedReadMetadataUuid'] != null) return types[1];
        //if not paired, then fasta
        else if(value['name']) return types[0];
        //null file
        else return types[2];
    },

    getAIRRReadDirection: function() {
        var value = this.get('value');

        if (value['readDirection'] == 'F') return 'forward';
        if (value['readDirection'] == 'R') return 'reverse';
        if (value['readDirection'] == 'FR') return 'mixed';
        return null;
    },

    getFileType: function() {
        var value = this.get('value');

        return value['fileType'];
    },

    isPaired: function() {
        let value = this.get('value');
        if (value['pairedReadMetadataUuid']) return true;
        if (value['qualityScoreMetadataUuid']) return true;
        if (value['readMetadataUuid']) return true;
        return false;
    },

    getPairUuid: function() {
        let value = this.get('value');
        if (value['pairedReadMetadataUuid']) return value['pairedReadMetadataUuid'];
        if (value['qualityScoreMetadataUuid']) return value['qualityScoreMetadataUuid'];
        if (value['readMetadataUuid']) return value['readMetadataUuid'];
        return null;
    },

    // this assumes the sub-objects have already been denormalized from their uuid
    getValuesForField: function(field) {
        var value = this.get('value');
        var paths = field.split('.');
        switch (paths[0]) {
            case 'fileType':
                return File.getFileTypeById(value[paths[0]]);
            default:
                return value[paths[0]];
        }
    },

    //
    // File downloads
    //
    downloadUrlByPostit: function(project_uuid, url) {
        var jqxhr = Agave.ajax({
            headers: _.extend(
                {},
                Agave.oauthHeader(),
                {
                    'Content-Type': 'application/json',
                }
            ),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + project_uuid + '/file/postit',
            data: JSON.stringify({
                'path': url,
                'allowedUses': 1,
                'validSeconds': 3600
            }),
        })
        .then(function(response) {

            var targetUrl = response.result.redeemUrl;
            // rewrite URL to go through proxy
            //targetUrl = targetUrl.replace(EnvironmentConfig.agave.internal, EnvironmentConfig.agave.hostname);

            return targetUrl;
        })
        /*
            Create an invisible link on the DOM, and programmatically click it

            I realize that this seems like something that the view controller should do,
            but I feel like this is worth handling in the model because:

            * we're only using it for file downloads
            * it has no visible effect on the DOM
            * it's temporary
            * it is only concerned with initiating data transfer, which is what the user is trying to do anyway
        */
        .then(function(targetUrl) {

            var link = document.createElement('a');
            //link.setAttribute('download', null);
            link.setAttribute('data-bypass', 'true');
            link.setAttribute('href', targetUrl + '?download=true');
            link.style.display = 'none';
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
        });

        return jqxhr;
    },

    downloadFileToDisk: function() {
        var jqxhr;

        // relative to project directory
        var value = this.get('value');
        var url = value['path'];
        url = url.replace('/projects/' + this.get('projectUuid') + '/', '');

/*            if (this.has('jobUuid') && this.get('jobUuid').length > 0) {

          url = EnvironmentConfig.agave.internal
              + '/jobs'
              + '/v2'
              + '/' + this.get('jobUuid')
              + '/outputs'
              + '/media'
              + '/' + this.get('name')
              ;
        } */

        jqxhr = this.downloadUrlByPostit(this.get('projectUuid'), url);

        return jqxhr;
    },


});

