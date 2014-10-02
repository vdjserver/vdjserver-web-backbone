define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var File = {};

    File = Backbone.Agave.Model.extend({
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
            _links: {}
        },
        url: function() {
            return '/files/v2/media/system/' + EnvironmentConfig.storageSystem + '//projects/' + this.get('projectUuid') + '/files/';
        },
        sync: function(method, model, options) {

            var that = this;

            if (method !== 'create' && method !== 'update') {
                return Backbone.Agave.sync(method, model, options);
            }
            else {
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
            }
        },
        getAssociationId: function() {
            var path = this.get('path');
            var split = path.split('/');
            return split[3];
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
                url: Backbone.Agave.vdjauthRoot + '/permissions/files'
            });

            return jqxhr;
        },
        // TODO: refactor these together
        getFile: function(name) {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type: 'GET',
                url: Backbone.Agave.apiRoot + '/files/v2/media/system/' + EnvironmentConfig.storageSystem + '//projects/' + this.get('projectUuid') + '/files/' + name,
            });
            this.name = name;
            return jqxhr;
        },
        downloadFile: function() {

            var that = this;

            var xhr = new XMLHttpRequest();
            xhr.open('get', Backbone.Agave.apiRoot + '/files/v2/media/system/' + EnvironmentConfig.storageSystem + '//projects/' + this.get('projectUuid') + '/files/' + this.get('name'));
            xhr.responseType = 'blob';
            xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));

            xhr.onload = function() {
              if (this.status === 200 || this.status === 202) {
                window.saveAs(new Blob([this.response]), that.get('name'));
              }
            };
            xhr.send();

            return xhr;
        }
    });

    File.Metadata = Backbone.Agave.MetadataModel.extend({
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
                url: Backbone.Agave.vdjauthRoot + '/permissions/metadata'
            });

            return jqxhr;
        },
        softDeleteFile: function() {
            var value = this.get('value');
            value.isDeleted = true;

            this.set('value', value);

            return this.save();
        },
        setInitialMetadata: function(file, formData) {

            var privateAttributes = {};
            var publicAttributes = {
                'tags': [],
            };

            if (formData['forward-reads']) {
                privateAttributes['forward-reads'] = true;
            }

            if (formData['reverse-reads']) {
                privateAttributes['reverse-reads'] = true;
            }

            if (formData['tags']) {
                var tagArray = this.formatTagsForSave(formData['tags']);

                publicAttributes['tags'] = tagArray;
            }

            this.set({
                associationIds: [file.getAssociationId()],
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
        formatTagsForSave: function(tagString) {
            var tagArray = $.map(tagString.split(','), $.trim);

            return tagArray
        },
        updateTags: function(tags) {

            var value = this.get('value');

            var tagArray = this.formatTagsForSave(tags);

            value['publicAttributes']['tags'] = tagArray;

            this.set('value', value);

            return this.save();
        },
    });

    Backbone.Agave.Model.File = File;
    return File;
});
