define([
    'backbone',
    'comparators-mixin',
    'file-transfer-mixins',
], function(Backbone, ComparatorsMixin, FileTransferMixins) {

    'use strict';

    var SamplesMetadata = {};

    SamplesMetadata = Backbone.Agave.MetadataCollection.extend(
        _.extend({}, ComparatorsMixin.reverseChronologicalCreatedTime, FileTransferMixins, {
            model: Backbone.Agave.Model.SampleMetadata,
            initialize: function(parameters) {
                Backbone.Agave.MetadataCollection.prototype.initialize.apply(this, [parameters]);

                if (parameters && parameters.projectUuid) {
                    this.projectUuid = parameters.projectUuid;
                }
            },
            url: function() {
                return '/meta/v2/data?q='
                       + encodeURIComponent('{"name":"sample","value.project_uuid":"' + this.projectUuid + '"}')
                       + '&limit=' + this.limit
                       + '&offset=' + this.offset
                       ;
            },

            createExportFile: function() {
                var jqxhr = $.ajax({
                    headers: Backbone.Agave.basicAuthHeader(),
                    type: 'GET',
                    url: EnvironmentConfig.vdjApi.hostname
                        + '/projects/' + this.projectUuid + '/metadata/sample/export'
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
                        + '//projects/' + this.projectUuid + '/files/sample_metadata.json'
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
                        + '/projects/' + this.projectUuid + '/metadata/sample/import'
                });

                return jqxhr;
            },
        })
    );

    Backbone.Agave.Collection.SamplesMetadata = SamplesMetadata;
    return SamplesMetadata;
});
