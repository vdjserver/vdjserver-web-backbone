define(['backbone'], function(Backbone) {

    'use strict';

    var FileMetadata = {};

    FileMetadata = Backbone.Agave.MetadataModel.extend({
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
                headers: {
                    'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + Backbone.Agave.instance.token().get('access_token'))
                },
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
        downloadFile: function() {

            var that = this;

            var xhr = new XMLHttpRequest();
            xhr.open('get', this.get('_links').file.href);
            xhr.responseType = 'blob';
            xhr.setRequestHeader('Authorization', 'Bearer ' + Backbone.Agave.instance.token().get('access_token'));
            
            xhr.onload = function() {
              if (this.status === 200 || this.status === 202) {
                window.saveAs(new Blob([this.response]), that.get('value').name);
              }
            };
            xhr.send();
            
            return xhr;
        }
    });

    Backbone.Agave.Model.FileMetadata = FileMetadata;
    return FileMetadata;
});
