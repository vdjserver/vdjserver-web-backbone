define(['backbone'], function(Backbone) {

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
            return '/files/v2/media/system/data.vdjserver.org//projects/' + this.get('projectUuid') + '/files/';
        },
        sync: function(method, model, options) {
            if (method !== 'create' && method !== 'update') {
                return Backbone.Agave.sync(method, model, options);
            }
            else {
                var url = model.apiRoot + (options.url || _.result(model, 'url'));
                var agaveToken = options.agaveToken || model.agaveToken || Backbone.Agave.instance.token();

                var formData = new FormData();
                formData.append('fileToUpload', model.get('fileReference'));

                var deferred = $.Deferred();

                var xhr = options.xhr || new XMLHttpRequest();
                xhr.open('POST', url, true);
                xhr.setRequestHeader('Authorization', 'Bearer ' + agaveToken.get('access_token'));
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
                        //var parsedJSON = JSON.parse(xhr.response);
                        deferred.resolve(xhr.response);
                    }
                    else {
                        console.log("jqxhr ELSE - " + xhr.status);
                        deferred.reject('HTTP Error: ' + xhr.status)
                    }
                }, false);

                xhr.send(formData);
                return deferred;
            }
        },
        getAssociationId: function() {
            var path = this.get('path');
            var split = path.split('/');
            console.log("split is: " + JSON.stringify(split));
            return split[2];
        },
        syncFilePermissionsWithProjectPermissions: function() {

            var jxhr = $.ajax({
                data: {
                    projectUuid: this.get('projectUuid'),
                    fileName: this.get('name')
                },
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/permissions/files'
            });

            return jxhr;
        },
        // TODO: refactor these together
        getFile: function(name) {
            console.log("called getFile with " + name);
            console.log();
            var jxhr = $.ajax({
                headers: Backbone.Agave.oauthHeader(),
                type: 'GET',
                url: Backbone.Agave.apiRoot + '/files/v2/media/system/data.vdjserver.org//projects/' + this.get('projectUuid') + '/files/' + name,
            });
            this.name = name;
            return jxhr;
        },
        downloadFile: function() {

            var that = this;

            var xhr = new XMLHttpRequest();
            xhr.open('get', Backbone.Agave.apiRoot + '/files/v2/media/system/data.vdjserver.org//projects/' + this.get('projectUuid') + '/files/' + this.get('name'));
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

            var jxhr = $.ajax({
                data: {
                    projectUuid: value.projectUuid,
                    uuid: this.get('uuid')
                },
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/permissions/metadata'
            });

            return jxhr;
        },
        softDeleteFile: function() {
            var value = this.get('value');
            value.isDeleted = true;

            this.set('value', value);

            return this.save();
        },
    });

    Backbone.Agave.Model.File = File;
    return File;
});
