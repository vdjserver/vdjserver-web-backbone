define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var File = {};

    File = Backbone.Agave.Model.extend({
        // Private methods
        _getAssociationId: function() {
            var path = this.get('path');
            var split = path.split('/');

            return split[3];
        },

        // Public methods
        idAttribute: 'path',
        defaults: {
            fileReference: '',
            format: '',
            lastModified: '',
            length: 0,
            mimeType: '',
            name: '',
            path: '',
            permissions: '',
            projectUuid: '',
            system: '',
            type: '',
            _links: {},
        },
        url: function() {
            return  '/files/v2/media/system'
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
                    break;

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
                            model.trigger('uploadProgress', uploadProgress);
                        }
                    };

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

                    break;

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
        // TODO: refactor these together
        getFile: function(name) {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type: 'GET',
                url: EnvironmentConfig.agaveRoot + '/files/v2/media/system/' + EnvironmentConfig.storageSystem + '//projects/' + this.get('projectUuid') + '/files/' + name,
            });
            this.name = name;
            return jqxhr;
        },
        downloadFile: function() {

            var that = this;

            var xhr = new XMLHttpRequest();
            xhr.open('get', EnvironmentConfig.agaveRoot + '/files/v2/media/system/' + EnvironmentConfig.storageSystem + '//projects/' + this.get('projectUuid') + '/files/' + this.get('name'));
            xhr.responseType = 'blob';
            xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));

            xhr.onload = function() {
              if (this.status === 200 || this.status === 202) {
                window.saveAs(new Blob([this.response]), that.get('name'));
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
        getDomFriendlyName: function() {

            // Turn empty spaces into dashes
            var domFriendlyName = this.get('name').replace(/\s+/g, '-');

            // Remove periods - otherwise we don't be able to find this in the DOM
            domFriendlyName = domFriendlyName.replace(/\./g, '').toLowerCase();

            return domFriendlyName;
        },
    });

    File.Metadata = Backbone.Agave.MetadataModel.extend({
        // Private Methods
        _formatTagsForSave: function(tagString) {
            var tagArray = $.map(tagString.split(','), $.trim);

            return tagArray;
        },

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
                        'fileCategory': '',
                        'isDeleted': false,
                    }
                }
            );
        },
        initialize: function() {
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

            var privateAttributes = {
                'tags': [],
            };

            var publicAttributes = {};

            if (formData['forward-reads']) {
                privateAttributes['forward-reads'] = true;
            }

            if (formData['reverse-reads']) {
                privateAttributes['reverse-reads'] = true;
            }

            if (formData['tags']) {
                var tagArray = this._formatTagsForSave(formData['tags']);

                privateAttributes['tags'] = tagArray;
            }

            this.set({
                associationIds: [file._getAssociationId()],
                value: {
                    projectUuid: file.get('projectUuid'),
                    fileCategory: formData['file-category'],
                    name: file.get('name'),
                    length: file.get('fileReference').size,
                    mimeType: file.get('mimeType'),
                    isDeleted: false,
                    privateAttributes: privateAttributes,
                    publicAttributes: publicAttributes,
                },
            });
        },
        updateTags: function(tags) {

            var value = this.get('value');

            var tagArray = this._formatTagsForSave(tags);

            value['privateAttributes']['tags'] = tagArray;

            this.set('value', value);

            return this.save();
        },
        getFileModel: function() {
            var value = this.get('value');

            var filePath = '/projects'
                         + '/' + value['projectUuid']
                         + '/files'
                         + '/' + value['name'];

            var fileModel = new File({
                path: filePath,
                projectUuid: value['projectUuid'],
                name: value['name'],
            });

            return fileModel;
        },
    });

    Backbone.Agave.Model.File = File;
    return File;
});
