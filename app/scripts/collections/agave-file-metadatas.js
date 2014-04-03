(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var FileMetadatas = {};

    FileMetadatas = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.FileMetadata,
        initialize: function(parameters) {

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q=' 
                   + encodeURIComponent('{'
                       + '"name":"projectFile",'
                       + '"value.projectUuid":"' + this.projectUuid + '"'
                   + '}');
        }
    });

    Backbone.Agave.Collection.FileMetadatas = FileMetadatas;
    return FileMetadatas;
})(this);
