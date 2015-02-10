define(
    [
        'backbone',
        'environment-config',
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
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{'
                       + '"name": { $in: ["projectFile", "projectJobFile"] },'
                       + '"value.projectUuid":"' + this.projectUuid + '",'
                       + '"value.isDeleted":false'
                   + '}')
                   ;
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

        getQualAssociableFastaCollection: function() {

            var models = _.filter(this.models, function(model) {

                return (
                        model.getFileType() === 2
                            ||
                        model.getFileType() === 4
                       )
                       ;
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(models);

            newCollection.sortBy(this._sortAlphabetical());

            return newCollection;
        },
        getBarcodeCollection: function() {
            /*
                Get all known fasta files that have been categorized as either:
                *.) Barcode
                *.) Unspecified
            */

            var knownBarcodeCollection = this._getKnownBarcodeCollection();

            var possibleBarcodeCollection = this._getPossibleBarcodeCollection();

            // Merge sets together, and keep independent sorting
            var mergedCollection = this.clone();
            mergedCollection.reset();
            mergedCollection.add(knownBarcodeCollection.models);
            mergedCollection.add(possibleBarcodeCollection.models);

            return mergedCollection;
        },
        getPrimerCollection: function() {

            var primerModels = _.filter(this.models, function(model) {
                return model.getFileType() === 1;
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(primerModels);

            return newCollection;
        },
        getQualCollection: function() {

            var qualModels = _.filter(this.models, function(model) {
                return model.getFileExtension() === 'qual';
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(qualModels);

            return newCollection;
        },
        getCombinationCollection: function() {

            var combinationModels = _.filter(this.models, function(model) {
                return model.getFileExtension() === 'csv';
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(combinationModels);

            return newCollection;
        },
        getReadLevelCollection: function() {

            var readLevelModels = _.filter(this.models, function(model) {
                return model.getFileType() === 2
                       ;
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(readLevelModels);

            return newCollection;
        },
        getNonPairedCollection: function() {

            var readLevelModels = _.filter(this.models, function(model) {
                return model.getFileType() === 2
                       &&
                       model.getPairedReadMetadataUuid() !== undefined
                       ;
            });

            var newCollection = this.clone();
            newCollection.remove(readLevelModels);

            return newCollection;
        },
        getPairedReadCollection: function() {

            var pairedReadModels = _.filter(this.models, function(model) {
                return model.getFileType() === 2
                       &&
                       model.getPairedReadMetadataUuid() !== undefined
                       ;
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(pairedReadModels);

            return newCollection;
        },
        organizePairedReads: function() {

            var pairedReads = [];
            var set = new Set();

            var that = this;
            this.each(function(model) {

                if (set.has(model) === false) {

                    var pairArray = [];

                    var pairUuid = model.getPairedReadMetadataUuid();
                    var pairedModel = that.get(pairUuid);

                    pairArray.push(model.toJSON());
                    pairArray.push(pairedModel.toJSON());
                    set.add(model);
                    set.add(pairedModel);

                    pairedReads.push(pairArray);
                }
            });

            return pairedReads;
        },
        search: function(searchString) {

            var filteredModels = _.filter(this.models, function(data) {
                if (data.get('value').name.toLowerCase().indexOf(searchString.toLowerCase()) > -1) {
                    return true;
                }

                if (
                    data.get('value')
                    &&
                    data.get('value').tags
                    &&
                    data.get('value').tags
                        .toString()
                        .toLowerCase()
                        .indexOf(searchString.toLowerCase()) > -1
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

        // Private Methods
        _getKnownBarcodeCollection: function() {

            // Filter down to files that are known barcodes and have the .fasta extension
            var barcodeModels = _.filter(this.models, function(model) {
                return model.getFileType() === 0
                       ;
            });

            var barcodeCollection = this.clone();
            barcodeCollection.reset();
            barcodeCollection.add(barcodeModels);

            barcodeCollection.sortBy(this._sortAlphabetical());

            return barcodeCollection;
        },

        _getPossibleBarcodeCollection: function() {

            // Filter down to files that are unspecified and have the .fasta extension
            var barcodeModels = _.filter(this.models, function(model) {
                return model.getFileType() === 4
                       ;
            });

            var barcodeCollection = this.clone();
            barcodeCollection.reset();
            barcodeCollection.add(barcodeModels);

            barcodeCollection.sortBy(this._sortSize());

            return barcodeCollection;
        },
        _sortAlphabetical: function() {
            return function(model) {
                return model.get('value')['name'].toLowerCase();
            };
        },
        _sortSize: function() {
            return function(model) {
                return model.get('value')['length'];
            };
        },
    });

    Backbone.Agave.Collection.Files = Files;
    return Files;
});
