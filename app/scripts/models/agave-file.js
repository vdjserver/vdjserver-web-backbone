define(['backbone'], function(Backbone) {

    'use strict';

    var File = Backbone.Agave.FileModel.extend({
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
        getAssociationId: function() {

            if (this.has('_links')) {
                var links = this.get('_links');

                var metadataReference = links.metadata;

                var href = metadataReference.href;

                var split = href.split('"');

                var associationId = split[3];

                return associationId;
            }
        },
        syncFilePermissionsWithProjectPermissions: function() {

            var jxhr = $.ajax({
                data: {
                    projectUuid: this.get('projectUuid'),
                    fileName: this.get('name')
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + Backbone.Agave.instance.token().get('access_token'))
                },
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/permissions/files'
            });

            return jxhr;
        },
        getFile: function(name) {
            console.log("called getFile with " + name);
            console.log();
            var jxhr = $.ajax({
                headers: {
                    'Authorization': 'Bearer ' + Backbone.Agave.instance.token().get('access_token')
                },
                type: 'GET',
                url: Backbone.Agave.apiRoot + '/files/v2/media/system/data.vdjserver.org//projects/' + '0001398998029905-5056a550b8-0001-012' + '/files/' + name,
            });
            this.name = name;
            return jxhr;
        }    
    });

    Backbone.Agave.Model.File = File;
    return File;
});
