define([
    'app',
    'backbone',
    'comparators-mixin',
], function(App, Backbone, ComparatorsMixin) {

    'use strict';

    var Projects = {};

    Projects.Private = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, {
            model: Backbone.Agave.Model.Project,
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"project"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },
        })
    );

    Projects.Public = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, {
            model: Backbone.Agave.Model.Project,
            apiHost: EnvironmentConfig.vdjGuest.hostname,
            requiresAuth: false,
            url: function() {
              return '/meta/v2/data?q='
                     + encodeURIComponent('{"name":"publicProject"}')
                     + '&limit=' + this.limit
                     + '&offset=' + this.offset
                     ;
            },
        })
    );

    Backbone.Agave.Collection.Projects = Projects;
    return Projects;
});
