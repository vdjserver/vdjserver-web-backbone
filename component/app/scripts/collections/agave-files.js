
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
        return '/v3/files/ops/'
            + EnvironmentConfig.agave.systems.storage.corral.hostname
            + this.relativeUrl
            ;
/*        return '/files/v2/listings/system'
            + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
            + this.relativeUrl
            ; */
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

    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/project/' + this.projectUuid + '/metadata/name/project_file';
/*        if (this.includeJobFiles) {
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
        } */
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
                    if (fileType != File.fileTypeCodes.FILE_TYPE_FASTQ_READ)
                        continue;
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
                    if (fileType != File.fileTypeCodes.FILE_TYPE_FASTQ_READ)
                        continue;
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
                    if (fileType != File.fileTypeCodes.FILE_TYPE_FASTA_READ)
                        continue;
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
    getSequencingFiles: function() {
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
        return '/project/' + this.projectUuid + '/file/name/' + encodeURIComponent(this.name);
    },

});

