define(
    [
        'backbone',
        'environment-config'
    ],
function(Backbone, EnvironmentConfig) {

    'use strict';

    var Files = {};

    Files = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.File,
        comparator: 'name',
        url: function() {
            return '/files/v2/listings/system/' + EnvironmentConfig.storageSystem;
        },
        parse: function(response) {
            if (response.result) {
                response = response.result;
            }

            // Remove those pesky folders from our file listing
            var finalData = [];

            for (var i = 0; i < response.length; i++) {
                if (response[i].format !== 'folder') {
                    finalData.push(response[i]);
                }
            }

            return finalData;
        },
    });

    Files.Metadata = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.File.Metadata,
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
        checkForDuplicateFilename: function(filename) {

            var isDuplicate = false;

            for (var j = 0; j < this.models.length; j++) {
                var model = this.at([j]);

                var modelName = model.get('value').name;

                if (modelName === filename) {
                    isDuplicate = true;
                    break;
                }
            }

            return isDuplicate;
        },
        getSortedBarcodeCollection: function() {

            var fileTypeMatches = _.filter(this.models, function(model) {
                return model.get('value')['name'].slice(-6) === '.fasta';
            });

            var sizeSortedMatches = _.sortBy(fileTypeMatches, function(model) {
                return model.get('value')['length'];
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(sizeSortedMatches);

            return newCollection;
        },
        getBarcodeCollection: function() {

            var fileTypeMatches = _.filter(this.models, function(model) {
                return model.get('value')['name'].slice(-6) === '.fasta';
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(fileTypeMatches);

            return newCollection;
        },
        getBarcodeQualityScoreCollection: function() {

            var fileTypeMatches = _.filter(this.models, function(model) {
                return model.get('value')['name'].slice(-5) === '.qual';
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(fileTypeMatches);

            return newCollection;
        },
        getCombinationCollection: function() {

            var fileTypeMatches = _.filter(this.models, function(model) {
                return model.get('value')['name'].slice(-4) === '.csv';
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(fileTypeMatches);

            return newCollection;
        },
        search: function(searchString) {

            var filteredModels = _.filter(this.models, function(data) {
                if (data.get('value').name.toLowerCase().indexOf(searchString.toLowerCase()) > -1) {
                    return true;
                }

                if (
                    data.get('value').privateAttributes
                    && data.get('value').privateAttributes['tags']
                    && data.get('value').privateAttributes['tags'].toString().toLowerCase().indexOf(searchString.toLowerCase()) > -1
                ) {
                    return true;
                }
            });

            var filteredFileListings = new Files.Metadata(filteredModels);

            return filteredFileListings;
        },
        getModelForName: function(name) {

            var filteredModels = _.filter(this.models, function(data) {
                if (data.get('value').name.toLowerCase().indexOf(name.toLowerCase()) > -1) {
                    return true;
                }
            });

            return filteredModels[0];
        },
    });

    Backbone.Agave.Collection.Files = Files;
    return Files;
});
