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
            system: '',
            type: ''
        },
        url: '/files/v2/media/system/vdjIrods6'
    });

    Backbone.Agave.Model.File = File;
    return File;
})(this);