(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Vdj = Backbone.Vdj;

    var Projects = Vdj.Projects = {};

    Projects.Project = Vdj.Model.extend({
        defaults: {
            id:         '',
            name:       '',
            members:    []
            /*
            categories: [],
            created:    '',
            modified:   ''
            */
        },
        url: function() {
            return '/project';
        }
    });

    Projects.UserProjects = Vdj.Collection.extend({
        url: function() {
            return '/user/projects';
        }
    });

    return Projects;

})(this);
