
'use strict';

//
// agave-metadata.js
// AIRR Repertoire metadata models
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

// AIRR Schema
import AIRRSchema from 'airr-schema';
import repertoire_template from 'airr-repertoire-template';
import { airr } from 'airr-js';

// Subject model based upon AIRR Subject, held as singleton object
var subjectSchema = null;
var diagnosisSchema = null;
export var Subject = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Subject object as basis
        if (! subjectSchema) subjectSchema = new airr.SchemaDefinition('Subject');
        if (! diagnosisSchema) diagnosisSchema = new airr.SchemaDefinition('Diagnosis');
        this.schema = subjectSchema;
        this.diagnosis_schema = diagnosisSchema;
        // make a deep copy from the template
        var blankEntry = subjectSchema.template();

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'subject',
                owner: '',
                value: blankEntry
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }

        if (! subjectSchema) subjectSchema = new airr.SchemaDefinition('Subject');
        if (! diagnosisSchema) diagnosisSchema = new airr.SchemaDefinition('Diagnosis');
        this.schema = subjectSchema;
        this.diagnosis_schema = diagnosisSchema;
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },

    updateField: function(name, new_value) {
        // handle point age specially
        if (name == 'age_point') {
            Agave.MetadataModel.prototype.updateField.call(this, 'age_min', new_value);
            Agave.MetadataModel.prototype.updateField.call(this, 'age_max', new_value);
        } else {
            Agave.MetadataModel.prototype.updateField.call(this, name, new_value);
        }
    },

    // handle diagnosis fields specially as internal array in subject
    updateDiagnosisField: function(index, name, new_value) {
        let value = this.get('value');
        let newval = new_value;

        // treat blank string as null otherwise leave untouched
        if (typeof new_value === 'string' || new_value instanceof String) {
            newval = new_value.trim();
            if (newval.length == 0) newval = null;
        }

        // check bounds for index
        if (!value['diagnosis']) return;
        if (index < 0) return;
        if (index >= value['diagnosis'].length) return;

        // is it ontology
        if (this.diagnosis_schema.is_ontology(name)) {
            if (newval && (newval.id.trim().length == 0)) newval = null;
            if (!newval) value['diagnosis'][index][name] = null;
            else value['diagnosis'][index][name] = { id: newval.id, label: newval.label };
            this.set('value', value);
            return;
        }

        // cast to appropriate type before setting
        let type = this.diagnosis_schema.type(name);
        if (type == 'boolean') {
            if (newval == null) value['diagnosis'][index][name] = null;
            if (newval == "true") value['diagnosis'][index][name] = true;
            if (newval == "false") value['diagnosis'][index][name] = false;
            this.set('value', value);
            return;
        }
        if (type == 'number') {
            if (newval) newval = parseFloat(newval);
            value['diagnosis'][index][name] = newval;
            this.set('value', value);
            return;
        }
        if (type == 'string') {
            value['diagnosis'][index][name] = newval;
            this.set('value', value);
            return;
        }
    },

    validate: function(attrs, options) {
        // AIRR schema validation
        //console.log(subjectSchema['definition']);
        let value = this.get('value');
        let valid = subjectSchema.validate_object(value);

        // TODO: VDJServer additional validation

        return valid;
    },

    // this assumes the sub-objects have already been denormalized from their uuid
    getValuesForField(field) {
        var value = this.get('value');
        var paths = field.split('.');
        if (paths.length == 1) return value[paths[0]];
        else {
            switch(paths[0]) {
                case 'diagnosis':
                    var diagnosis = value['diagnosis'];
                    if (! diagnosis) return null;
                    if (diagnosis.length == 0) return null;
                    var values = [];
                    for (var d = 0; d < diagnosis.length; ++d) {
                        var obj = diagnosis[d][paths[1]];
                        if (obj == null) continue;
                        if (typeof obj === 'object') {
                            // assume it is an ontology field
                            if (obj['id'] == null) continue;
                            let found = false;
                            for (var k = 0; k < values.length; ++k) {
                                if (values[k]['id'] == obj['id']) {
                                    found = true;
                                    break;
                                }
                            }
                            if (! found) values.push(obj);
                        } else {
                            // plain value
                            if (values.indexOf(obj) < 0) values.push(obj);
                        }
                    }
                    if (values.length == 0) return null;
                    return values;
                default:
                    return null;
            }
        }
    },

    getAgeDisplay: function() {
        var text = '';
        // TODO: check schema version
        var value = this.get('value');
        // age point or range
        if (value['age_min'] == value['age_max']) text += value['age_min'];
        else text += value['age_min'] + '-' + value['age_max'];
        // TODO: some old metadata is using value instead of label
        if (value['age_unit'] && value['age_unit']['label'])
            text += ' ' + value['age_unit']['label'] + '(s)'
        else
            if (value['age_unit'] && value['age_unit']['value'])
                text += ' ' + value['age_unit']['value'] + '(s)'

        return text;
    },

    getSpeciesDisplay: function() {
        var text = '';
        // TODO: check schema version
        var value = this.get('value');
        // TODO: some old metadata is using value instead of label
        if (value['species']['label'])
            text += value['species']['label']
        else
            if (value['species']['value'])
                text += value['species']['value']

        return text;
    }
});

// Diagnosis model based upon AIRR Diagnosis
export var Diagnosis = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Diagnosis object as basis
        this.airr_schema = AIRRSchema['Diagnosis'];

        // make a deep copy from the template
        var value = JSON.parse(JSON.stringify(repertoire_template['subject']['diagnosis'][0]));
        //console.log(value);

        // add VDJServer specific fields
        //value['showArchivedJobs'] = false;

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'diagnosis',
                owner: '',
                value: value
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },
});

// Sample model based upon AIRR Sample Processing
// which is a composite object
export var SampleProcessing = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Subject object as basis
        this.airr_schema = AIRRSchema['SampleProcessing'];

        // make a deep copy from the template
        var value = JSON.parse(JSON.stringify(repertoire_template['sample'][0]));
        //console.log(value);

        // add VDJServer specific fields
        //value['showArchivedJobs'] = false;

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'sample_processing',
                owner: '',
                value: value
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },
});

// DataProcessing model based upon AIRR Data Processing
// which is a composite object
export var DataProcessing = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Subject object as basis
        this.airr_schema = AIRRSchema['DataProcessing'];

        // make a deep copy from the template
        var value = JSON.parse(JSON.stringify(repertoire_template['data_processing'][0]));
        //console.log(value);

        // add VDJServer specific fields
        //value['showArchivedJobs'] = false;

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'data_processing',
                owner: '',
                value: value
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },
});

// Repertoire model based upon AIRR Repertoire
//
// We store the repertoire in normal-form versus
// the denormalized version in AIRR. This is to prevent
// duplicate data that may not get updated properly.
//
// Only the identifiers are stored and those objects
// need to be fetched in separate requests.
//
export var Repertoire = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Repertoire object as basis
        this.airr_schema = AIRRSchema['Repertoire'];

        // make a deep copy from the template
        var value = JSON.parse(JSON.stringify(repertoire_template));
        //console.log(value);

        // add VDJServer specific fields
        //value['showArchivedJobs'] = false;

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'repertoire',
                owner: '',
                value: value
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },

    // this is not generic but customized for our objects
    // this assumes the sub-objects have already been denormalized from their uuid
    getValuesForField(field) {
        var value = this.get('value');
        var paths = field.split('.');
        if (paths.length == 1) return value[paths[0]];
        else {
            switch(paths[0]) {
                case 'study':
                    return value['study'].get('value')[paths[1]];
                case 'subject':
                    return value['subject'].get('value')[paths[1]];
                case 'diagnosis':
                    var subject = value['subject'].get('value');
                    var diagnosis = subject['diagnosis'];
                    if (! diagnosis) return null;
                    if (diagnosis.length == 0) return null;
                    var values = [];
                    for (var d = 0; d < diagnosis.length; ++d) {
                        var obj = diagnosis[d][paths[1]];
                        if (obj == null) continue;
                        if (typeof obj === 'object') {
                            // assume it is an ontology field
                            if (obj['id'] == null) continue;
                            let found = false;
                            for (var k = 0; k < values.length; ++k) {
                                if (values[k]['id'] == obj['id']) {
                                    found = true;
                                    break;
                                }
                            }
                            if (! found) values.push(obj);
                        } else {
                            // plain value
                            if (values.indexOf(obj) < 0) values.push(obj);
                        }
                    }
                    if (values.length == 0) return null;
                    return values;
                case 'sample': {
                    let sample = value['sample'];
                    if (!sample) return null
                    if (sample.length == 0) return null;
                    var values = [];
                    if (values.length == 0) return null;
                    return values;
                }
                case 'data_processing':
                    return null;
                case 'repertoire':
                    return null;
                default:
                    return null;
            }
        }
    },
});

/*
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
                        'sample_type',
                        'tissue',
                        'anatomic_site',
                        'disease_state_sample',
                        'collection_time_point_relative',
                        'collection_time_point_reference',
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
                        'template_class',
                        'template_quality',
                        'template_amount',
                        'library_generation_method',
                        'library_generation_protocol',
                        'library_generation_kit_version',
                        'pcr_target_locus',
                        'forward_pcr_primer_target_location',
                        'reverse_pcr_primer_target_location',
                        'complete_sequences',
                        'physical_linkage',
                        'total_reads_passing_qc_filter',
                        'sequencing_platform',
                        'read_length',
                        'sequencing_facility',
                        'sequencing_run_id',
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
*/
