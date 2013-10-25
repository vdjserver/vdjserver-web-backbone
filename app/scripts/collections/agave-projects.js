(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var Projects = {};

    Projects = Agave.Collection.extend({
        model: Agave.Model.Project,
        url: function() {
            return '/user/projects';
        }
    });

    Backbone.Agave.Collection.Projects = Projects;
    return Projects;
})(this);
