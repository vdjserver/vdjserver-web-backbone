define(['backbone'], function(Backbone) {

    'use strict';

    var Projects = {};

    Projects = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.Project,
        url: function() {
            return '/meta/v2/data?q=' + encodeURIComponent('{"name":"project"}');
        }
    });

    Backbone.Agave.Collection.Projects = Projects;
    return Projects;
});
