(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var File = {};

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
            return '/files/v2/media/system/vdjIrods9/' + this.get('projectUuid') + '/files/';
        },
        getAssociationId: function() {

            if (this.has('_links')) {
                var links = this.get('_links');


                var metadataReference = links['metadata'];

                console.log("metadataRef is: " + JSON.stringify(metadataReference));
                var href = metadataReference['href'];
                console.log("href is: " + href);

                var split = href.split('"');
                console.log("split is: " + JSON.stringify(split));

                var associationId = split[3];

                return associationId;
            }
        },
        syncFilePermissionsWithProjectPermissions: function() {

            console.log("path is: " + this.get('path'));

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
        }
    });

    Backbone.Agave.Model.File = File;
    return File;
})(this);
