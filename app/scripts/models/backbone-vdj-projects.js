(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Vdj = Backbone.Vdj;

    var Projects = Vdj.Projects = {};

    Projects.Project = Vdj.Model.extend({
        idAttribute: '_id',
        defaults: {
            name:       '',
            members:    []
            /*
            categories: [],
            created:    '',
            modified:   ''
            */
        },
        url: function() {
            if (this.id) {
                console.log("url scenario A. this is: " + JSON.stringify(this));
                return '/project/' + this.id;
            }
            console.log("url scenario B. self is: " + JSON.stringify(this));
            return '/project';
        }
    });

    Projects.UserProjects = Vdj.Collection.extend({
        model: Projects.Project,
        url: function() {
            return '/user/projects';
        }
    });

    return Projects;

})(this);
