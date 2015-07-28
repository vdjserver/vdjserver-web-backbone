define(['backbone'], function(Backbone) {

    'use strict';

    var CommunityDatas = {};

    CommunityDatas = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.CommunityData,
        url: function() {
            return '/meta/v2/data?q='
               + encodeURIComponent(
                   '{'
                     + '"name":"communityDataSRA"'
                 + '}'
               );
        },
    });

    Backbone.Agave.Collection.CommunityDatas = CommunityDatas;
    return CommunityDatas;
});
