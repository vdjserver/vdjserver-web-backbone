define([
    'backbone',
    'comparators-mixin',
], function(Backbone, ComparatorsMixin) {

    'use strict';

    var SubjectsMetadata = {};

    SubjectsMetadata = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, {
            model: Backbone.Agave.Model.SubjectMetadata,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"subject","value.project_uuid":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },
        })
    );

    Backbone.Agave.Collection.SubjectsMetadata = SubjectsMetadata;
    return SubjectsMetadata;
});
