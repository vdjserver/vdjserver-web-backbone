define([
    'backbone',
    'comparators-mixin',
    'file-transfer-mixins',
], function(Backbone, ComparatorsMixin, FileTransferMixins) {

    'use strict';

    var BioProcessesMetadata = {};

    BioProcessesMetadata = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.BioProcessingMetadata,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"bioProcessing","associationIds":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },

            createExportFile: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'GET',
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/bio_processing/export'
                        + '?format=JSON',
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
                        + '//projects/' + this.projectUuid + '/deleted/bio_processing_metadata.tsv'
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
                        operation: op
                    }),
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/bio_processing/import'
                });

                return jqxhr;
            },

        })
    );

    Backbone.Agave.Collection.BioProcessesMetadata = BioProcessesMetadata;
    return BioProcessesMetadata;
});
