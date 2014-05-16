define(['backbone'], function(Backbone) {

    'use strict';

    var FileMetadatas = {};

    FileMetadatas = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.FileMetadata,
        initialize: function(parameters) {

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function(fileCategory) {

            if (fileCategory) {

                switch(fileCategory) {
                    case 'uploaded':
                        return '/meta/v2/data?q='
                            + encodeURIComponent('{'
                                + '"name":"projectFile",'
                                + '"value.projectUuid":"' + this.projectUuid + '",'
                                + '"value.fileCategory":"uploaded",'
                                + '"value.isDeleted":false'
                            + '}');

                    case 'preprocessed':
                        return '/meta/v2/data?q='
                            + encodeURIComponent('{'
                                + '"name":"projectFile",'
                                + '"value.projectUuid":"' + this.projectUuid + '",'
                                + '"value.fileCategory":"preprocessed",'
                                + '"value.isDeleted":false'
                            + '}');
                        //break;

                    case 'aligned':
                        return '/meta/v2/data?q='
                            + encodeURIComponent('{'
                                + '"name":"projectFile",'
                                + '"value.projectUuid":"' + this.projectUuid + '",'
                                + '"value.fileCategory":"aligned",'
                                + '"value.isDeleted":false'
                            + '}');
                        //break;

                    default:
                        break;
                }
            }

            return '/meta/v2/data?q='
                   + encodeURIComponent('{'
                       + '"name":"projectFile",'
                       + '"value.projectUuid":"' + this.projectUuid + '",'
                       + '"value.isDeleted":false'
                   + '}');
        },
        getFileCount: function() {
            if (this.length > 0) {
                return this.length;
            }
            else {
                return 0;
            }
        },
        getNewCollectionForUuids: function(uuids) {

            var newCollection = this.clone();
            newCollection.reset();

            for (var i = 0; i < uuids.length; i++) {
                var model = this.get(uuids[i]);
                newCollection.add(model);
            }

            return newCollection;
        },
    });

    Backbone.Agave.Collection.FileMetadatas = FileMetadatas;
    return FileMetadatas;
});
