
'use strict';

//
// agave-metadata-collections.js
// AIRR Repertoire metadata collections
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
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

import { Repertoire, Subject, Diagnosis, Sample } from 'Scripts/models/agave-metadata';

import { Comparators } from 'Scripts/collections/mixins/comparators-mixin';
import { FileTransfers } from 'Scripts/models/mixins/file-transfer-mixins';

// AIRR Schema
import AIRRSchema from 'airr-schema';
import repertoire_template from 'airr-repertoire-template';

export var RepertoireCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, FileTransfers, {
        model: Repertoire,
        initialize: function(parameters) {
            Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"repertoire","associationIds":"' + this.projectUuid + '"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },

/*
        createExportFile: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'GET',
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.projectUuid + '/metadata/export'
                    + '?format=JSON&type=subject',
            });

            return jqxhr;
        },

        downloadExportFileToDisk: function() {
            var url = EnvironmentConfig.agave.hostname
                    + '/files'
                    + '/v2'
                    + '/media'
                    + '/system'
                    + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                    + '//projects/' + this.projectUuid + '/deleted/subject_metadata.tsv'
                    ;

            var jqxhr = this.downloadUrlByPostit(url);

            return jqxhr;
        },

        importFromFile: function(file, op) {
            var value = file.get('value');

            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    fileUuid: file.get('uuid'),
                    fileName: value.name,
                    operation: op,
                    type: 'subject'
                }),
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.projectUuid + '/metadata/import'
            });

            return jqxhr;
        }, */
    })
);

export var SubjectCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, FileTransfers, {
        model: Subject,
        initialize: function(parameters) {
            Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"subject","associationIds":"' + this.projectUuid + '"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },
    })
);


export var DiagnosisCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, FileTransfers, {
        model: Diagnosis,
        initialize: function(parameters) {
            Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"diagnosis","associationIds":"' + this.projectUuid + '"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },
    })
);

export var SampleCollection = Agave.MetadataCollection.extend(
    _.extend({}, Comparators.reverseChronologicalCreatedTime, FileTransfers, {
        model: Sample,
        initialize: function(parameters) {
            Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"sample","associationIds":"' + this.projectUuid + '"}')
                   + '&limit=' + this.limit
                   + '&offset=' + this.offset
                   ;
        },
    })
);

/*
define([
    'backbone',
    'comparators-mixin',
    'file-transfer-mixins',
], function(Backbone, ComparatorsMixin, FileTransferMixins) {

    'use strict';

    var Metadata = {};

    Metadata.Subject = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.Metadata.Subject,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"subject","associationIds":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },

            createExportFile: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'GET',
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/export'
                        + '?format=JSON&type=subject',
                });

                return jqxhr;
            },

            downloadExportFileToDisk: function() {
                var url = EnvironmentConfig.agave.hostname
                        + '/files'
                        + '/v2'
                        + '/media'
                        + '/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + this.projectUuid + '/deleted/subject_metadata.tsv'
                        ;

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },

            importFromFile: function(file, op) {
                var value = file.get('value');

                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fileUuid: file.get('uuid'),
                        fileName: value.name,
                        operation: op,
                        type: 'subject'
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/import'
                });

                return jqxhr;
            },
        })
    );

    Metadata.Diagnosis = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.Metadata.Diagnosis,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"diagnosis","associationIds":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },

            createExportFile: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'GET',
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/export'
                        + '?format=JSON&type=diagnosis',
                });

                return jqxhr;
            },

            downloadExportFileToDisk: function() {
                var url = EnvironmentConfig.agave.hostname
                        + '/files'
                        + '/v2'
                        + '/media'
                        + '/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + this.projectUuid + '/deleted/diagnosis_metadata.tsv'
                        ;

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },

            importFromFile: function(file, op) {
                var value = file.get('value');

                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fileUuid: file.get('uuid'),
                        fileName: value.name,
                        operation: op,
                        type: 'diagnosis'
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/import'
                });

                return jqxhr;
            },
        })
    );

    Metadata.Sample = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.Metadata.Sample,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"sample","associationIds":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },

            createExportFile: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'GET',
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/export'
                        + '?format=JSON&type=sample',
                });

                return jqxhr;
            },

            downloadExportFileToDisk: function() {
                var url = EnvironmentConfig.agave.hostname
                        + '/files'
                        + '/v2'
                        + '/media'
                        + '/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + this.projectUuid + '/deleted/sample_metadata.tsv'
                        ;

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },

            importFromFile: function(file, op) {
                var value = file.get('value');

                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fileUuid: file.get('uuid'),
                        fileName: value.name,
                        operation: op,
                        type: 'sample'
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/import'
                });

                return jqxhr;
            },
        })
    );

    Metadata.CellProcessing = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.Metadata.CellProcessing,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"cellProcessing","associationIds":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },

            createExportFile: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'GET',
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/export'
                        + '?format=JSON&type=cellProcessing',
                });

                return jqxhr;
            },

            downloadExportFileToDisk: function() {
                var url = EnvironmentConfig.agave.hostname
                        + '/files'
                        + '/v2'
                        + '/media'
                        + '/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + this.projectUuid + '/deleted/cellProcessing_metadata.tsv'
                        ;

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },

            importFromFile: function(file, op) {
                var value = file.get('value');

                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fileUuid: file.get('uuid'),
                        fileName: value.name,
                        operation: op,
                        type: 'cellProcessing'
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/import'
                });

                return jqxhr;
            },
        })
    );

    Metadata.NucleicAcidProcessing = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.Metadata.NucleicAcidProcessing,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"nucleicAcidProcessing","associationIds":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },

            createExportFile: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'GET',
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/export'
                        + '?format=JSON&type=nucleicAcidProcessing',
                });

                return jqxhr;
            },

            downloadExportFileToDisk: function() {
                var url = EnvironmentConfig.agave.hostname
                        + '/files'
                        + '/v2'
                        + '/media'
                        + '/system'
                        + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                        + '//projects/' + this.projectUuid + '/deleted/nucleicAcidProcessing_metadata.tsv'
                        ;

                var jqxhr = this.downloadUrlByPostit(url);

                return jqxhr;
            },

            importFromFile: function(file, op) {
                var value = file.get('value');

                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fileUuid: file.get('uuid'),
                        fileName: value.name,
                        operation: op,
                        type: 'nucleicAcidProcessing'
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/import'
                });

                return jqxhr;
            },
        })
    );

    Metadata.SampleGroup = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.Metadata.SampleGroup,
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

    Backbone.Agave.Collection.Metadata = Metadata;
    return Metadata;
});
*/
