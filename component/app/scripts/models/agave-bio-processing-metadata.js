define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var BioProcessingMetadata = {};

    BioProcessingMetadata = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'bioProcessing',
                    owner: '',
                    value: {
                        // AIRR minimal standards
                        'tissue_processing': '',
                        'cell_subset': '',
                        'cell_subset_phenotype': '',
                        'single_or_bulk': '',
                        'cell_number': '',
                        'cells_per_reaction': '',
                        'cell_storage': '',
                        'cell_quality': '',
                        'cell_isolation': '',
                        'processing_protocol': '',
                        'library_source': '',
                        'target_substrate_quality': '',
                        'library_strategy': '',
                        'library_construction_protocol': '',
                        'target_locus_PCR': '',
                        'forward_PCR_primer_target_location': '',
                        'reverse_PCR_primer_target_location': '',
                        'whole_vs_partial_sequences': '',
                        'heavy_light_paired': '',
                        'ng_template': '',
                        'total_reads_passing_qc_filter': '',
                        'protocol': '',
                        'platform': '',
                        'read_length': '',
                        'sequencing_facility': '',
                        'batch_number': '',
                        'sequencing_run_date': '',
                        'sequencing_kit': '',
                        // other defaults
                        'name': '',
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
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        sync: function(method, model, options) {
            return Backbone.Agave.PutOverrideSync(method, this, options);
        },
        setAttributesFromFormData: function(formData) {
            this.set('value', formData);
        },
    });

    Backbone.Agave.Model.BioProcessingMetadata = BioProcessingMetadata;
    return BioProcessingMetadata;
});
