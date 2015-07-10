define(
    [
        'backbone',
        'environment-config',
        'underscore.string',
    ],
function(Backbone, EnvironmentConfig, _string) {

    'use strict';

    var Files = {};

    Files = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.File,
        comparator: 'name',
        url: function() {
            return '/files/v2/listings/system/' + EnvironmentConfig.agave.storageSystems.corral;
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

    Files.Metadata = Backbone.Agave.MetadataCollection.extend(
        {
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
            getQualAssociableFastaCollection: function() {

                var models = _.filter(this.models, function(model) {

                    return (
                            model.getFileType() === 2
                                ||
                            model.getFileType() === 4
                           )
                           &&
                           model.getFileExtension() !== 'fastq'
                           ;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(models);

                newCollection.sortBy(this._sortAlphabetical());

                return newCollection;
            },
            getCombinationCollection: function() {

                var combinationModels = _.filter(this.models, function(model) {
                    return model.getFileType() === 3;
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

            /**
                Returns arrays of deep copied paired reads.

                Qual files are not included.
            */
            getOrganizedPairedReads: function() {

                var pairedReads = [];
                var set = new Set();

                var that = this;
                this.each(function(model) {

                    if (set.has(model) === false) {

                        var pairArray = [];

                        var pairUuid = model.getPairedReadMetadataUuid();
                        var pairedModel = that.get(pairUuid);

                        pairArray.push(model);
                        pairArray.push(pairedModel);
                        set.add(model);
                        set.add(pairedModel);

                        pairedReads.push(pairArray);
                    }
                });

                return pairedReads;
            },

            /**
                Returns arrays of shallow copied paired reads.

                Qual files are not included.
            */
            getSerializableOrganizedPairedReads: function() {

                var pairedReads = [];
                var set = new Set();

                var that = this;
                this.each(function(model) {

                    if (set.has(model) === false) {

                        var pairArray = [];

                        var pairUuid = model.getPairedReadMetadataUuid();
                        var pairedModel = that.get(pairUuid);

                        if (pairedModel) {

                            pairArray.push(model.toJSON());
                            pairArray.push(pairedModel.toJSON());
                            set.add(model);
                            set.add(pairedModel);

                            pairedReads.push(pairArray);
                        }
                    }
                });

                return pairedReads;
            },

            /**
                Adds a shallow copy of qual models from |allFiles| to project files in |this|.

                It is important for the copy to be shallow in order for JSON
                serialization to work properly when model.toJSON() is called.
            */
            embedQualModels: function(allFiles) {

                var models = [];

                this.each(function(model) {

                    if (model.getQualityScoreMetadataUuid()) {
                        var qualModel = allFiles.get(model.getQualityScoreMetadataUuid());
                        qualModel.set('linkedFastaUuid', model.get('uuid'));

                        model.set('qualModel', qualModel.toJSON());

                        models.push(model);
                    }
                });

                this.add(models);

                return this;
            },

            /**
                Returns an array of all embedded qual models and read-level models
                in deep copy format.

                Embedded qual models are read from |this|, and deep copies are
                taken from |allFiles|.
            */
            getAllEmbeddedQualModels: function(allFiles) {

                var models = [];

                this.each(function(model) {

                    models.push(model);

                    if (model.get('qualModel')) {
                        var shallowQualModel = model.get('qualModel');

                        var fullQualModel = allFiles.get(shallowQualModel['uuid']);

                        models.push(fullQualModel);
                    }
                });

                return models;
            },

            /**
                Returns an array of all embedded qual models in deep copy format.

                Embedded qual models are read from |this|, and deep copies are
                taken from |allFiles|.
            */
            getEmbeddedQualModels: function(allFiles) {

                var models = [];

                this.each(function(model) {

                    if (model.get('qualModel')) {
                        var shallowQualModel = model.get('qualModel');

                        var fullQualModel = allFiles.get(shallowQualModel['uuid']);

                        models.push(fullQualModel);
                    }
                });

                return models;
            },

            search: function(searchString) {
                var generalSearchTerm = searchString;

                // Split into decorators
                var nameDecoratorValue = false;
                var nameDecorator = 'name:';
                if (searchString.indexOf(nameDecorator) > -1) {
                    nameDecoratorValue = this._searchGetDecoratorValue(searchString, nameDecorator);

                    // prune from general search
                    generalSearchTerm = generalSearchTerm.replace(nameDecorator + nameDecoratorValue, '');
                }

                var tagDecoratorValue = false;
                var tagDecorator = 'tag:';
                if (searchString.indexOf(tagDecorator) > -1) {
                    tagDecoratorValue = this._searchGetDecoratorValue(searchString, tagDecorator);

                    // prune from general search
                    generalSearchTerm = generalSearchTerm.replace(tagDecorator + tagDecoratorValue, '');
                }

                // clean up general search whitespace
                generalSearchTerm = generalSearchTerm.trim();

                var that = this;
                var filteredModels = _.filter(this.models, function(data) {

                    var shouldIncludeNameDecorator = false;
                    var shouldIncludeTagDecorator  = false;
                    var shouldIncludeGeneralSearch = false;

                    if (nameDecoratorValue) {
                        if (that._searchModelNameMatch(data, nameDecoratorValue)) {
                            shouldIncludeNameDecorator = true;
                        }
                        else {
                            shouldIncludeNameDecorator = false;
                        }
                    }
                    else {
                        shouldIncludeNameDecorator = true;
                    }

                    if (tagDecoratorValue) {
                        if (that._searchModelTagMatch(data, tagDecoratorValue)) {
                            shouldIncludeTagDecorator = true;
                        }
                        else {
                            shouldIncludeTagDecorator = false;
                        }
                    }
                    else {
                        shouldIncludeTagDecorator = true;
                    }

                    if (generalSearchTerm.length > 0) {
                        if (that._searchModelNameMatch(data, generalSearchTerm)) {
                            return true;
                        }

                        if (that._searchModelTagMatch(data, generalSearchTerm)) {
                            return true;
                        }
                    }
                    else {
                        shouldIncludeGeneralSearch = true;
                    }

                    // Evaluate Truth Table
                    return shouldIncludeNameDecorator && shouldIncludeTagDecorator && shouldIncludeGeneralSearch;
                });

                var searchCollection = new Files.Metadata(filteredModels);

                // Add in fasta/qual models
                searchCollection = this._searchResultRestoreQualAssociable(filteredModels, searchCollection);

                // Add in paired read models
                searchCollection = this._searchResultRestorePairedReads(filteredModels, searchCollection);

                return searchCollection;
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
            _searchGetDecoratorValue: function(searchString, decorator) {
                // Separate decorator from value
                var decoratorSplit = _string.strRight(searchString, decorator);

                // Get rid of any spaces between decorator and value
                //decoratorSplit = _string.ltrim(decoratorSplit);

                // Split value from rest of string if a space exists
                var decoratorValue = _string.strLeftBack(decoratorSplit, ' ');

                return decoratorValue;
            },
            _searchModelNameMatch: function(model, searchValue) {

                var matchFound = false;

                if (model.get('value').name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
                    matchFound = true;
                }

                return matchFound;
            },
            _searchModelTagMatch: function(model, searchValue) {

                var matchFound = false;

                if (
                    model.get('value')
                    &&
                    model.get('value').publicAttributes
                    &&
                    model.get('value').publicAttributes.tags
                        .toString()
                        .toLowerCase()
                        .indexOf(searchValue.toLowerCase()) > -1
                ) {
                    return true;
                }

                return matchFound;
            },
            _searchResultRestoreQualAssociable: function(filteredModels, searchCollection) {
                for (var i = 0; i < filteredModels.length; i++) {

                    if (filteredModels[i].getQualityScoreMetadataUuid()) {
                        var qualModel = this.get(filteredModels[i].getQualityScoreMetadataUuid());
                        searchCollection.add(qualModel);
                    }
                    else if (filteredModels[i].get('linkedFastaUuid')) {

                        var fastaModel = this.get(filteredModels[i].get('linkedFastaUuid'));
                        searchCollection.add(fastaModel);
                    }
                }

                return searchCollection;
            },
            _searchResultRestorePairedReads: function(filteredModels, searchCollection) {
                for (var j = 0; j < filteredModels.length; j++) {

                    if (filteredModels[j].getPairedReadMetadataUuid()) {
                        var pairModel = this.get(filteredModels[j].getPairedReadMetadataUuid());
                        searchCollection.add(pairModel);
                    }
                }

                return searchCollection;
            },
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
        },
        {
            disassociatePairedReads: function(modelA, modelB) {
                var disassociatePairedReadPromises = [];

                var createDisassociatePairedReadPromise = function(model) {
                    model.removePairedReadMetadataUuid();
                };

                disassociatePairedReadPromises.push(createDisassociatePairedReadPromise(modelA));

                disassociatePairedReadPromises.push(createDisassociatePairedReadPromise(modelB));

                return $.when.apply($, disassociatePairedReadPromises);
            },
        }
    );

    Backbone.Agave.Collection.Files = Files;
    return Files;
});
