
'use strict';

//
// agave-files.js
// File collections
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2021 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import { Agave } from 'Scripts/backbone/backbone-agave';
import { File, ProjectFileMetadata } from 'Scripts/models/agave-file';

// collection of raw files within the Tapis Files API
export var FilesCollection = Agave.Collection.extend({
    model: File,
    comparator: 'name',
    initialize: function(models, parameters) {
        Agave.Collection.prototype.initialize.apply(this, [models, parameters]);

        this.relativeUrl = '';

        if (_.isObject(parameters) && parameters.hasOwnProperty('relativeUrl')) {
            this.relativeUrl = parameters.relativeUrl;
        }
    },
    url: function() {
        return '/files/v2/listings/system'
            + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
            + this.relativeUrl
            ;
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

// collection of project files
export var ProjectFilesCollection = Agave.MetadataCollection.extend({
    model: ProjectFileMetadata,

    initialize: function(models, parameters) {
        Agave.MetadataCollection.prototype.initialize.apply(this, [models, parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
        }
        this.sort_by = 'name';
        this.comparator = this.collectionSortBy;

        this.includeJobFiles = false;
        //if (parameters && parameters.includeJobFiles) this.includeJobFiles = true;
    },

    url: function() {
        if (this.includeJobFiles) {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{'
                       + '"name": { $in: ["projectFile", "projectJobFile"] },'
                       + '"value.projectUuid":"' + this.projectUuid + '",'
                       + '"value.isDeleted":false'
                   + '}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        } else {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{'
                       + '"name": "projectFile",'
                       + '"value.projectUuid":"' + this.projectUuid + '",'
                       + '"value.isDeleted":false'
                   + '}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        }
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

    // sort comparator for the collection
    collectionSortBy(modela, modelb) {
        if (!this.sort_by) this.sort_by = 'name';

        // we have a pre-defined set of sorts
        switch (this.sort_by) {
            case 'name': {
                let va = modela.get('value').name;
                let vb = modelb.get('value').name;
                if (va.toLowerCase() > vb.toLowerCase()) return 1;
                if (va.toLowerCase() < vb.toLowerCase()) return -1;
                return 0;
            }
            case 'size': {
                let ma = modela.get('value');
                let mb = modelb.get('value');
                if (ma.length > mb.length) return -1;
                if (ma.length < mb.length) return 1;
                return 0;
            }
            case 'newest': {
                let da = modela.get('lastUpdated');
                let db = modelb.get('lastUpdated');

                // nulls always at the back of the line
                if (!da && !db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                let nda = new Date(da);
                let ndb = new Date(db);
                return (ndb > nda) - (ndb < nda);
            }
            case 'oldest': {
                let da = modela.get('lastUpdated');
                let db = modelb.get('lastUpdated');

                // nulls always at the back of the line
                if (!da && !db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                let nda = new Date(da);
                let ndb = new Date(db);
                return (nda > ndb) - (nda < ndb);
            }
        }
    },

    // guess anchor
    guessAnchor: function() {
        let num_1 = 0;
        let num_2 = 0;
        let num_r1 = 0;
        let num_r2 = 0;
        for (let j = 0; j < this.models.length; j++) {
            let model = this.at([j]);
            let name = model.get('value').name;
            if (name.indexOf('_1') >= 0) ++num_1;
            if (name.indexOf('_2') >= 0) ++num_2;
            if (name.indexOf('_R1') >= 0) ++num_r1;
            if (name.indexOf('_R2') >= 0) ++num_r2;
        }
        if ((num_r1 + num_r2) > (num_1 + num_2)) return { forward: '_R1', reverse: '_R2' }
        else return { forward: '_1', reverse: '_2' }
    },

    // automatically pair files based upon given criteria
    pairFiles: function(data) {
        let mode = data['mode'];
        switch (mode) {
            case 'paired-end': {
                // we match on the prefix and suffix of the anchor
                // use a dictionary as a quick way to check for duplicates/matches
                let forward = data['forward'];
                let reverse = data['reverse'];
                let num_matched = 0;
                let forward_prefixes = {};
                let forward_suffixes = {};
                let forward_dups = {};
                let reverse_prefixes = {};
                let reverse_dups = {};
                let pairs = [];
                // collect the forward read files
                for (let j = 0; j < this.models.length; j++) {
                    let model = this.at([j]);
                    let fileType = model.get('value').fileType;
                    if (fileType != File.fileTypeCodes.FILE_TYPE_READ) continue;
                    let name = model.get('value').name;

                    let parse = name.split(forward);
                    if (parse.length == 2) {
                        if (forward_prefixes[parse[0]]) {
                            console.log('found a duplicate:', forward_prefixes[parse[0]]);
                            forward_dups[parse[0]] = model;
                        } else {
                            forward_prefixes[parse[0]] = model;
                            forward_suffixes[parse[0]] = parse[1];
                            ++num_matched;
                        }
                    }
                }
                console.log(forward_prefixes, forward_suffixes);
                // remove duplicates
                for (let i in forward_dups) delete forward_prefixes[i];

                // match with reverse read files
                for (let j = 0; j < this.models.length; j++) {
                    let model = this.at([j]);
                    let fileType = model.get('value').fileType;
                    if (fileType != File.fileTypeCodes.FILE_TYPE_READ) continue;
                    let name = model.get('value').name;

                    let parse = name.split(reverse);
                    if (parse.length == 2) {
                        console.log(parse);
                        ++num_matched;
                        if (forward_prefixes[parse[0]] && (forward_suffixes[parse[0]] == parse[1])) {
                            // got a match
                            pairs.push({ forward: forward_prefixes[parse[0]], reverse: model });
                        }
                    }
                }

                let num_paired = 2 * pairs.length;
                return { 'matched': num_matched, 'paired': num_paired, 'pairs': pairs };
            }

            case 'read-quality': {
                // we match on the prefix and suffix of the anchor
                // use a dictionary as a quick way to check for duplicates/matches
                let read = data['read'];
                let quality = data['quality'];
                let num_matched = 0;
                let read_prefixes = {};
                let read_dups = {};
                let pairs = [];
                // collect the read files
                for (var j = 0; j < this.models.length; j++) {
                    let model = this.at([j]);
                    let fileType = model.get('value').fileType;
                    if (fileType != File.fileTypeCodes.FILE_TYPE_READ) continue;
                    let name = model.get('value').name;

                    let parse = name.split(read);
                    console.log(parse);
                    if ((parse.length == 2) && (parse[1].length == 0)) {
                        if (read_prefixes[parse[0]]) {
                            console.log('found a duplicate:', read_prefixes[parse[0]]);
                            read_dups[parse[0]] = model;
                        } else {
                            read_prefixes[parse[0]] = model;
                            ++num_matched;
                        }
                    }
                }
                // remove duplicates
                for (let i in read_dups) delete read_prefixes[i];

                // match with quality files
                for (let j = 0; j < this.models.length; j++) {
                    let model = this.at([j]);
                    let fileType = model.get('value').fileType;
                    if (fileType != File.fileTypeCodes.FILE_TYPE_QUALITY) continue;
                    let name = model.get('value').name;

                    let parse = name.split(quality);
                    if ((parse.length == 2) && (parse[1].length == 0)) {
                        console.log(parse);
                        ++num_matched;
                        if (read_prefixes[parse[0]]) {
                            // got a match
                            pairs.push({ read: read_prefixes[parse[0]], quality: model });
                        }
                    }
                }

                let num_paired = 2 * pairs.length;
                return { 'matched': num_matched, 'paired': num_paired, 'pairs': pairs };
            }

            default:
                return null;
        }
    },

    //TODO add FASTA
    getSequencingFiles: function () {
        let sequencingFiles = this.clone();
        sequencingFiles.reset();
        sequencingFiles.add(this.getPairedCollection().models);
        sequencingFiles.add(this.getAIRRTSVCollection().models);
        return sequencingFiles;
    },

    getPairedCollection: function() {
        let pairedCollection = this.clone();
        pairedCollection.reset();
        for (let j = 0; j < this.models.length; j++) {
            let model = this.at([j]);
            let value = model.get('value');
            if (value['qualityScoreMetadataUuid']) {
                // fasta file of fasta/qual pair
                pairedCollection.add(model);
                continue;
            }
            if (value['readMetadataUuid']) {
                // qual file of fasta/qual pair
                continue;
            }
            if (value['pairedReadMetadataUuid']) {
                if (value['readDirection'] == 'F') {
                    // forward read file of paired-end reads
                    pairedCollection.add(model);
                }
                continue;
            }
        }
        return pairedCollection;
    },


    // we keep just the fasta file or forward read file for each pair
    getFilesWithCollapsedPairs: function() {
    //getPairedCollection: function() {
        let pairedCollection = this.clone();
        pairedCollection.reset();
        for (let j = 0; j < this.models.length; j++) {
            let model = this.at([j]);
            let value = model.get('value');
            if (value['qualityScoreMetadataUuid']) {
                // fasta file of fasta/qual pair
                pairedCollection.add(model);
                continue;
            }
            if (value['readMetadataUuid']) {
                // qual file of fasta/qual pair
                continue;
            }
            if (value['pairedReadMetadataUuid']) {
                if (value['readDirection'] == 'F') {
                    // forward read file of paired-end reads
                    pairedCollection.add(model);
                }
                continue;
            }
            // not paired
            pairedCollection.add(model);
        }
        return pairedCollection;
    },

    getUnpairedCollection: function() {
        let unpairedCollection = this.clone();
        unpairedCollection.reset();
        for (let j = 0; j < this.models.length; j++) {
            let model = this.at([j]);
            if (! model.isPaired()) unpairedCollection.add(model);
        }
        return unpairedCollection;
    },

    getAIRRTSVCollection: function() {
        var AirrTsvModels = _.filter(this.models, function(model) {
            return model.getFileType() === File.fileTypeCodes.FILE_TYPE_AIRR_TSV;
        });

        var newCollection = this.clone();
        newCollection.reset();
        newCollection.add(AirrTsvModels);

        return newCollection;
    },

    getTSVCollection: function() {
        var tsvModels = _.filter(this.models, function(model) {
            return model.getFileType() === File.fileTypeCodes.FILE_TYPE_TSV;
        });

        var newCollection = this.clone();
        newCollection.reset();
        newCollection.add(tsvModels);

        return newCollection;
    },

    getJSONCollection: function() {
        var tsvModels = _.filter(this.models, function(model) {
            return model.getFileType() === File.fileTypeCodes.FILE_TYPE_AIRR_JSON;
        });

        var newCollection = this.clone();
        newCollection.reset();
        newCollection.add(tsvModels);

        return newCollection;
    },

});

// query for a specific file
export var ProjectFileQuery = Agave.MetadataCollection.extend({
    model: ProjectFileMetadata,

    initialize: function(models, parameters) {
        Agave.MetadataCollection.prototype.initialize.apply(this, [models, parameters]);

        if (parameters) {
            if (parameters.projectUuid) this.projectUuid = parameters.projectUuid;
            if (parameters.name) this.name = parameters.name;
        }
    },

    url: function() {
        return '/meta/v2/data?q='
               + encodeURIComponent('{'
                   + '"name": "projectFile",'
                   + '"value.projectUuid":"' + this.projectUuid + '",'
                   + '"value.name":"' + this.name + '",'
                   + '"value.isDeleted":false'
               + '}')
               + '&limit=' + this.limit
               + '&offset=' + this.offset
               ;
    },

});

/*
define(
    [
        'backbone',
        'underscore.string',
        'comparators-mixin',
    ],
function(
    Backbone,
    _string,
    ComparatorsMixin
) {

    'use strict';

    var Files = {};

    Files = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.File,
        comparator: 'name',
        initialize: function(parameters) {
            Backbone.Agave.Collection.prototype.initialize.apply(this, [parameters]);

            this.relativeUrl = '';

            if (_.isObject(parameters) && parameters.hasOwnProperty('relativeUrl')) {
                this.relativeUrl = parameters.relativeUrl;
            }
        },
        url: function() {
            return '/files/v2/listings/system'
                + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                + this.relativeUrl
                ;
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
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
                this.includeJobFiles = false;
                //if (parameters && parameters.includeJobFiles) this.includeJobFiles = true;
            },
            url: function() {
                if (this.includeJobFiles) {
                    return '/meta/v2/data?q='
                           + encodeURIComponent('{'
                               + '"name": { $in: ["projectFile", "projectJobFile"] },'
                               + '"value.projectUuid":"' + this.projectUuid + '",'
                               + '"value.isDeleted":false'
                           + '}')
                           + '&limit=' + this.limit
                           + '&offset=' + this.offset
                           ;
                } else {
                    return '/meta/v2/data?q='
                           + encodeURIComponent('{'
                               + '"name": "projectFile",'
                               + '"value.projectUuid":"' + this.projectUuid + '",'
                               + '"value.isDeleted":false'
                           + '}')
                           + '&limit=' + this.limit
                           + '&offset=' + this.offset
                           ;
                }
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

                var barcodeModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_BARCODE
                           ;
                });

                var barcodeCollection = this.clone();
                barcodeCollection.reset();
                barcodeCollection.add(barcodeModels);

                barcodeCollection.sortBy(this._sortAlphabetical());

                return barcodeCollection;
            },
            getPrimerCollection: function() {

                var primerModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_PRIMER;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(primerModels);

                return newCollection;
            },
            getTSVCollection: function() {

                var tsvModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_TSV;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(tsvModels);

                return newCollection;
            },
            getQualCollection: function() {

                var qualModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_QUALITY;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(qualModels);

                return newCollection;
            },
            getQualAssociableFastaCollection: function() {

                var models = _.filter(this.models, function(model) {

                    return (
                            model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ
                                ||
                            model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_QUALITY
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
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ
                           ;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(readLevelModels);

                return newCollection;
            },
            getForwardReadLevelCollection: function() {

                var forwardReadLevelModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ
                           && model.getReadDirection() === 'F'
                           ;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(forwardReadLevelModels);

                return newCollection;
            },
            getReverseReadLevelCollection: function() {

                var reverseReadLevelModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ
                           && model.getReadDirection() === 'R'
                           ;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(reverseReadLevelModels);

                return newCollection;
            },
            getPairedReadCollection: function() {

                var pairedReadModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ
                           &&
                           model.getPairedReadMetadataUuid() !== undefined
                           ;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(pairedReadModels);

                return newCollection;
            },
            getNonPairedReadCollection: function() {

                var pairedReadModels = _.filter(this.models, function(model) {
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ
                           &&
                           model.getPairedReadMetadataUuid() == undefined
                           &&
                           model.getQualityScoreMetadataUuid() == undefined
                           ;
                });

                var newCollection = this.clone();
                newCollection.reset();
                newCollection.add(pairedReadModels);

                return newCollection;
            },

            getOrganizedPairedReadCollection: function() {

                var pairedReads = [];
                var forwardCollection = this.clone();
                forwardCollection.reset();
                var reverseCollection = this.clone();
                reverseCollection.reset();

                var that = this;
                this.each(function(model) {

                    if (model.getReadDirection() == 'F') {
                        var pairUuid = model.getPairedReadMetadataUuid();

                        if (pairUuid !== undefined) {
                            var pairedModel = that.get(pairUuid);

                            forwardCollection.add(model);
                            reverseCollection.add(pairedModel);
                        }
                    }
                });

                if (forwardCollection.length > 0) {
                    pairedReads.push(forwardCollection);
                    pairedReads.push(reverseCollection);
                }

                return pairedReads;
            },

            serializedPairedReadCollection: function() {

                var pairedReads = [];

                var that = this;
                this.each(function(model) {

                    if (model.getReadDirection() == 'F') {
                        var pairUuid = model.getPairedReadMetadataUuid();

                        if (pairUuid !== undefined) {
                            var pairedModel = that.get(pairUuid);

                            pairedReads.push({forward: model.toJSON(), reverse: pairedModel.toJSON()});
                        }
                    }
                });

                return pairedReads;
            },

            serializedNonPairedReadCollection: function() {

                var pairedReads = [];

                var that = this;
                this.each(function(model) {
                    var pairUuid = model.getPairedReadMetadataUuid();
                    var qualUuid = model.getQualityScoreMetadataUuid();
                    if (model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_READ
                        && pairUuid == undefined && qualUuid == undefined) {
                        pairedReads.push({read: model.toJSON()});
                    }
                });

                return pairedReads;
            },

            serializedPairedQualityCollection: function() {

                var pairedReads = [];

                var that = this;
                this.each(function(model) {
                    var qualUuid = model.getQualityScoreMetadataUuid();
                    if (qualUuid !== undefined) {
                        var qualModel = that.get(qualUuid);

                        pairedReads.push({read: model.toJSON(), qual: qualModel.toJSON()});
                    }
                });

                return pairedReads;
            },

            getOrganizedPairedQualityCollection: function(allFileMetadatas) {

                var pairedReads = [];
                var seqCollection = this.clone();
                seqCollection.reset();
                var qualCollection = this.clone();
                qualCollection.reset();

                var that = this;
                this.each(function(model) {

                    var qualUuid = model.getQualityScoreMetadataUuid();
                    if (qualUuid !== undefined) {
                        var qualModel = allFileMetadatas.get(qualUuid);

                        seqCollection.add(model);
                        qualCollection.add(qualModel);
                    }
                });

                if (seqCollection.length > 0) {
                    pairedReads.push(seqCollection);
                    pairedReads.push(qualCollection);
                }

                return pairedReads;
            },

                //Returns arrays of deep copied paired reads.

                //Qual files are not included.
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

                //Returns arrays of shallow copied paired reads.

                //Qual files are not included.
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

                Adds a shallow copy of qual models from |allFiles| to project files in |this|.

                It is important for the copy to be shallow in order for JSON
                serialization to work properly when model.toJSON() is called.
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

                Returns an array of all embedded qual models and read-level models
                in deep copy format.

                Embedded qual models are read from |this|, and deep copies are
                taken from |allFiles|.
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

                Returns an array of all embedded qual models in deep copy format.

                Embedded qual models are read from |this|, and deep copies are
                taken from |allFiles|.
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

                var searchCollection = new this.constructor(filteredModels);

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
            getTotalFileSize: function() {

                var values = this.pluck('value');

                var totalSize = 0;

                for (var i = 0; i < values.length; i++) {
                    if (values[i].hasOwnProperty('length')) {
                        totalSize += values[i].length;
                    }
                };

                return totalSize;
            },
            hasPairedReads: function() {

                // check if collection contains paired reads
                var hasPairedReads = this.some(function(file) {

                    if (file.get('value').hasOwnProperty('pairedReadMetadataUuid') && file.get('value').pairedReadMetadataUuid.length > 0) {
                        return true;
                    }

                    return false;
                });

                return hasPairedReads;
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

                if (model.get('description')) {
                    if (model.get('description').toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
                        matchFound = true;
                    }
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
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_BARCODE
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
                    return model.getFileType() === Backbone.Agave.Model.File.fileTypeCodes.FILE_TYPE_UNSPECIFIED
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
                    return model.removePairedReadMetadataUuid();
                };

                disassociatePairedReadPromises.push(createDisassociatePairedReadPromise(modelA));

                disassociatePairedReadPromises.push(createDisassociatePairedReadPromise(modelB));

                return $.when.apply($, disassociatePairedReadPromises);
            },
        }
    );

    Files.ProjectJobFiles = Files.Metadata.extend({
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{'
                       + '"name": "projectJobFile",'
                       + '"value.projectUuid":"' + this.projectUuid + '",'
                       + '"value.isDeleted":false,"value.showInProjectData":true'
                   + '}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },

        getFilesForJobId: function(jobId) {

            // Filter down to files for the given job
            var fileModels = _.filter(this.models, function(model) {
                var value = model.get('value');
                return value.jobUuid === jobId;
            });

            var fileCollection = this.clone();
            fileCollection.reset();
            fileCollection.add(fileModels);

            return fileCollection;
        },

        getProjectFileOutput: function() {
            var filteredCollection = this.filter(function(model) {

                var value = model.get('value');
                if (value.name) {

                    var filename = value.name;

                    var fileNameSplit = filename.split('.');
                    var fileExtension = fileNameSplit[fileNameSplit.length - 1];

                    var doubleFileExtension = fileNameSplit[fileNameSplit.length - 2] + '.' + fileNameSplit[fileNameSplit.length - 1];

                    var test = fileNameSplit[fileNameSplit.length - 100];

                    // Whitelisted files
                    if (fileExtension === 'fasta'
                        ||
                        fileExtension === 'fastq'
                        ||
                        fileExtension === 'vdjml'
                        ||
                        fileExtension === 'zip'
                        ||
                        doubleFileExtension === 'rc_out.tsv'
                        ||
                        doubleFileExtension === 'duplicates.tsv'
                    ) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            });

            var newCollection = this.clone();
            newCollection.reset();
            newCollection.add(filteredCollection);

            return newCollection;
        },
    });

    Backbone.Agave.Collection.Files = Files;
    return Files;
});
*/
