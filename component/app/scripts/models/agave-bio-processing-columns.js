define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var BioProcessingColumns = {};

    BioProcessingColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'bioProcessingColumns',
                    owner: '',
                    value: {
                        'columns': []
                    }
                }
            );
        },
        initialize: function(parameters) {
            Backbone.Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
                this.set('associationIds', [ parameters.projectUuid ]);
            }

            // AIRR minimal standards and other defaults
            this.defaultColumns = ['name', 'tissue_processing', 'cell_subset', 'cell_subset_phenotype',
                                  'single_or_bulk', 'cell_number', 'cells_per_reaction', 'cell_storage',
                                  'cell_quality', 'cell_isolation', 'processing_protocol', 'library_source',
                                  'target_substrate_quality', 'library_strategy', 'library_construction_protocol',
                                  'target_locus_PCR', 'forward_PCR_primer_target_location',
                                  'reverse_PCR_primer_target_location', 'whole_vs_partial_sequences',
                                  'heavy_light_paired', 'ng_template', 'total_reads_passing_qc_filter',
                                  'protocol', 'platform', 'read_length', 'sequencing_facility',
                                  'batch_number', 'sequencing_run_date', 'sequencing_kit'];

        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"bioProcessingColumns","associationIds":"' + this.get('projectUuid') + '"}')
                   + '&limit=1'
                   + '&offset=0'
                   ;
        },
        sync: function(method, model, options) {
            return Backbone.Agave.PutOverrideSync(method, this, options);
        },
        setAttributesFromFormData: function(formData) {
            this.set('value', formData);
        },

        getColumnNames: function() {
            var columnNames = _.clone(this.defaultColumns);
            var value = this.get('value');
            for (var i = 0; i < value.columns.length; ++i) {
                if (columnNames.indexOf(value.columns[i]) < 0) columnNames.push(value.columns[i]);
            }
            return columnNames;
        }
    });

    Backbone.Agave.Model.BioProcessingColumns = BioProcessingColumns;
    return BioProcessingColumns;
});
