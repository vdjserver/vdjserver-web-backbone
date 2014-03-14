(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var ProjectFile = Backbone.Agave.FileModel.extend({
        defaults: {
            // TODO: need to replace this object w/ a real file output object from Agave!
            id: null,
            name: '',
            size: '',
            fileReference: ''
        },
        url: '/files/v2/media/system/vdjRodeo2'
    });

    Backbone.Agave.Model.ProjectFile = ProjectFile;
    return ProjectFile;
})(this);
