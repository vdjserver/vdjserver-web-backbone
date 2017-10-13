define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var Metadata = {};

    Metadata.SubjectColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'subjectColumns',
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
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"subjectColumns","associationIds":"' + this.get('projectUuid') + '"}')
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
            var columnNames = _.clone(Metadata.SubjectColumns.defaultColumns);
            var value = this.get('value');
            for (var i = 0; i < value.columns.length; ++i) {
                if (columnNames.indexOf(value.columns[i]) < 0) columnNames.push(value.columns[i]);
            }
            return columnNames;
        }
    },
    {
        // AIRR minimal standards and other defaults
        defaultColumns: [
                        'subject_id',
                        'synthetic',
                        'organism',
                        'sex',
                        'age',
                        'age_event',
                        'ancestry_population',
                        'ethnicity',
                        'race',
                        'strain_name',
                        'linked_subjects',
                        'link_type'
                        ]
    });

    Metadata.Subject = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'subject',
                    owner: '',
                    value: {}
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

    Metadata.DiagnosisColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'diagnosisColumns',
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
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"diagnosisColumns","associationIds":"' + this.get('projectUuid') + '"}')
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
            var columnNames = _.clone(Metadata.DiagnosisColumns.defaultColumns);
            var value = this.get('value');
            for (var i = 0; i < value.columns.length; ++i) {
                if (columnNames.indexOf(value.columns[i]) < 0) columnNames.push(value.columns[i]);
            }
            return columnNames;
        }
    },
    {
        // AIRR minimal standards and other defaults
        defaultColumns: [
                        'subject_uuid',
                        'study_group_description',
                        'disease_diagnosis',
                        'disease_length',
                        'disease_stage',
                        'prior_therapies',
                        'immunogen',
                        'intervention',
                        'medical_history',
                        ]
    });

    Metadata.Diagnosis = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'diagnosis',
                    owner: '',
                    value: {}
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

    Metadata.SampleColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'sampleColumns',
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
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"sampleColumns","associationIds":"' + this.get('projectUuid') + '"}')
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
            var columnNames = _.clone(Metadata.SampleColumns.defaultColumns);
            var value = this.get('value');
            for (var i = 0; i < value.columns.length; ++i) {
                if (columnNames.indexOf(value.columns[i]) < 0) columnNames.push(value.columns[i]);
            }
            return columnNames;
        }
    },
    {
        // AIRR minimal standards and other defaults
        defaultColumns: [
                        'sample_id',
                        'subject_uuid',
                        'filename_uuid',
                        'sample_type',
                        'tissue',
                        'anatomic_site',
                        'disease_state_sample',
                        'collection_date',
                        'collection_time_event',
                        'biomaterial_provider',
                        ]
    });

    Metadata.Sample = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'sample',
                    owner: '',
                    value: {}
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

    Metadata.CellProcessingColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'cellProcessingColumns',
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
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"cellProcessingColumns","associationIds":"' + this.get('projectUuid') + '"}')
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
            var columnNames = _.clone(Metadata.CellProcessingColumns.defaultColumns);
            var value = this.get('value');
            for (var i = 0; i < value.columns.length; ++i) {
                if (columnNames.indexOf(value.columns[i]) < 0) columnNames.push(value.columns[i]);
            }
            return columnNames;
        }
    },
    {
        // AIRR minimal standards and other defaults
        defaultColumns: [
                        'cell_processing_id',
                        'sample_uuid',
                        'tissue_processing',
                        'cell_subset',
                        'cell_phenotype',
                        'single_cell',
                        'cell_number',
                        'cells_per_reaction',
                        'cell_storage',
                        'cell_quality',
                        'cell_isolation',
                        'cell_processing_protocol',
                        ]
    });

    Metadata.CellProcessing = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'cellProcessing',
                    owner: '',
                    value: {}
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

    Metadata.NucleicAcidProcessingColumns = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'nucleicAcidProcessingColumns',
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
        },
        url: function() {
            return '/meta/v2/data?q='
                   + encodeURIComponent('{"name":"nucleicAcidProcessingColumns","associationIds":"' + this.get('projectUuid') + '"}')
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
            var columnNames = _.clone(Metadata.NucleicAcidProcessingColumns.defaultColumns);
            var value = this.get('value');
            for (var i = 0; i < value.columns.length; ++i) {
                if (columnNames.indexOf(value.columns[i]) < 0) columnNames.push(value.columns[i]);
            }
            return columnNames;
        }
    },
    {
        // AIRR minimal standards and other defaults
        defaultColumns: [
                        'nucleic_acid_processing_id',
                        'cell_processing_uuid',
                        'filename_uuid',
                        'library_source',
                        'library_quality',
                        'library_construction_method',
                        'library_construction_protocol',
                        'target_locus_PCR',
                        'forward_PCR_primer_target_location',
                        'reverse_PCR_primer_target_location',
                        'complete_sequences',
                        'physical_linkage',
                        'template_amount',
                        'total_reads_passing_qc_filter',
                        'protocol_id',
                        'platform',
                        'read_length',
                        'sequencing_facility',
                        'batch_number',
                        'sequencing_run_date',
                        'sequencing_kit',
                        ]
    });

    Metadata.NucleicAcidProcessing = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'nucleicAcidProcessing',
                    owner: '',
                    value: {}
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

    Metadata.SampleGroup = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'sampleGroup',
                    owner: '',
                    value: {
                        'name': '',
                        'description': '',
                        'samples': [],
                        'category': '',
                        'logical_field': '',
                        'logical_operator': '',
                        'logical_value': '',
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

    Backbone.Agave.Model.Metadata = Metadata;
    return Metadata;
});
