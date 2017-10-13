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
