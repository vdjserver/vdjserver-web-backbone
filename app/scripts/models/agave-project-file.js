(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var ProjectFile = Backbone.Agave.Model.extend({
        defaults: {
            name: '',
            length: ''
        }
    });

    Backbone.Agave.Model.ProjectFile = ProjectFile;
    return ProjectFile;
})(this);
