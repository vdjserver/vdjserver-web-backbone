
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
import { airr } from 'airr-js';
import { vdj_schema } from 'vdjserver-schema';

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
        let errors = [];

        // AIRR schema validation
        let value = this.get('value');
        let valid = subjectSchema.validate_object(value);
        if (valid) {
            for (let i = 0; i < valid.length; ++i) {
                errors.push({ field: valid[i]['instancePath'].replace('/',''), message: valid[i]['message'], schema: valid[i]});
            }
        }

        // TODO: VDJServer additional validation

        // age validation
        if ((value['age_min'] == null) && (value['age_max'] != null)) {
            errors.push({ field: 'age_min', message: 'age_min is null'});
        }
        if ((value['age_max'] == null) && (value['age_min'] != null)) {
            errors.push({ field: 'age_max', message: 'age_max is null'});
        }
        if ((value['age_max'] != null) && (value['age_min'] != null)) {
            if (value['age_min'] > value['age_max']) {
                errors.push({ field: 'age_min', message: 'age_min is greater than age_max'});
                errors.push({ field: 'age_max', message: 'age_max is less than age_min'});
            }
            if (!value['age_unit']) errors.push({ field: 'age_unit', message: 'missing age unit'});
        }
        // special virtual age_point field
        for (let i = 0; i < errors.length; ++i) {
            if ((errors[i]['field'] == 'age_min') || (errors[i]['field'] == 'age_min')) {
                errors.push({ field: 'age_point', message: errors[i]['message']});
                break;
            }
        }

        if (errors.length == 0) return null;
        else return errors;
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

// Sample model based upon AIRR Sample Processing
// which is a composite object
var sampleProcessingSchema = null;
export var SampleProcessing = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Subject object as basis
        if (! sampleProcessingSchema) sampleProcessingSchema = new airr.SchemaDefinition('SampleProcessing');
        this.schema = sampleProcessingSchema;
        var blankEntry = sampleProcessingSchema.template();

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'sample_processing',
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

        if (! sampleProcessingSchema) sampleProcessingSchema = new airr.SchemaDefinition('SampleProcessing');
        this.schema = sampleProcessingSchema;
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
var dataProcessingSchema = null;
export var DataProcessing = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Subject object as basis
        if (! dataProcessingSchema) dataProcessingSchema = new airr.SchemaDefinition('DataProcessing');
        this.schema = dataProcessingSchema;
        var blankEntry = dataProcessingSchema.template();

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'data_processing',
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

        if (! dataProcessingSchema) dataProcessingSchema = new airr.SchemaDefinition('DataProcessing');
        this.schema = dataProcessingSchema;
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
var repertoireSchema = null;
export var Repertoire = Agave.MetadataModel.extend({
    defaults: function() {
        // TODO: this is wrong schema/template to use, we want the normal-form version
        if (! repertoireSchema) repertoireSchema = new airr.SchemaDefinition('Repertoire');
        this.schema = repertoireSchema;
        var blankEntry = repertoireSchema.template();

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'repertoire',
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

        // TODO: this is wrong schema to use, we want the normal-form version
        if (! repertoireSchema) repertoireSchema = new airr.SchemaDefinition('Repertoire');
        this.schema = repertoireSchema;
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
                    if (! value['subject']) return null;
                    return value['subject'].get('value')[paths[1]];
                case 'diagnosis':
                    if (! value['subject']) return null;
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

