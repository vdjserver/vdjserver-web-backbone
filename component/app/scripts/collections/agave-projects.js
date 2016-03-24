define([
    'backbone',
    'comparators-mixin',
], function(Backbone, ComparatorsMixin) {

    'use strict';

    var Projects = {};

    Projects = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, {
            model: Backbone.Agave.Model.Project,
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"project"}')
                       + '&limit=5000'
                       ;
            },
        })
    );

    Backbone.Agave.Collection.Projects = Projects;
    return Projects;
});
