define([
    'backbone',
    'comparators-mixin',
], function(Backbone, ComparatorsMixin) {

    'use strict';

    var SampleGroups = {};

    SampleGroups = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, {
            model: Backbone.Agave.Model.SampleGroup,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"sampleGroup","associationIds":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },
        })
    );

    Backbone.Agave.Collection.SampleGroups = SampleGroups;
    return SampleGroups;
});
