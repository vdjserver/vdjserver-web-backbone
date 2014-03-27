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
            projectId: '',
            system: '',
            type: ''
        },
        url: function() {
            return '/files/v2/media/system/vdjIrods7/' + this.get('projectId') + '/files/';
        }
    });

    Backbone.Agave.Model.File = File;
    return File;
})(this);
