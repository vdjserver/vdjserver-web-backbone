(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var ProjectFile = Backbone.Agave.FileModel.extend({
        defaults: {
            name: '',
            size: '',
            fileReference: ''
        },
        url: '/files/v2/'
    });

    Backbone.Agave.Model.ProjectFile = ProjectFile;
    return ProjectFile;
})(this);
