
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
        if (! subjectSchema) subjectSchema = new vdj_schema.SchemaDefinition('Subject');
        if (! diagnosisSchema) diagnosisSchema = new airr.SchemaDefinition('Diagnosis');
        this.schema = subjectSchema;
        this.diagnosis_schema = diagnosisSchema;
        // make a deep copy from the template
        var blankEntry = subjectSchema.template();
        // TODO: no genotype support
        blankEntry['genotype'] = null;

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

        if (! subjectSchema) subjectSchema = new vdj_schema.SchemaDefinition('Subject');
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

        // blank subject_id is not allowed
        let subject_id = "subject_id_" + this.cid;
        if ((value['subject_id'] == null)) {
            errors.push({ field: subject_id, message: 'Subject ID is blank'});
        }

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
            if (value['age_min'] < 0) {
                errors.push({ field: 'age_min', message: 'age_min is less than zero'});
            }
            if (value['age_max'] < 0) {
                errors.push({ field: 'age_max', message: 'age_max is less than zero'});
            }
            //if (!value['age_unit']) errors.push({ field: 'age_unit', message: 'missing age unit'});
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

    getDiagnosesDisplay: function() {
        var diagnosesSet = new Set();
        var value = this.get('value');
        var str = "";
        for(let i=0; i<value.diagnosis.length; i++) {
            str = "";
            if(value.diagnosis[i].disease_diagnosis.label != null) {
                str = value.diagnosis[i].disease_diagnosis.label;
                if(value.diagnosis[i].disease_diagnosis.id != null)
                    str = str + " " +  value.diagnosis[i].disease_diagnosis.id;
            } else if(value.diagnosis[i].disease_diagnosis.id != null)
                str = value.diagnosis[i].disease_diagnosis.id;

            if(value.diagnosis[i].study_group_description != null)
                if(str.length > 0) str = str + " (" + value.diagnosis[i].study_group_description + ")";
                else str = "(" + value.diagnosis[i].study_group_description + ")";

            diagnosesSet.add(str);
        }
        var setFormatted = Array.from(diagnosesSet.values()).join(", ");
        return setFormatted;
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
        if (! sampleProcessingSchema) sampleProcessingSchema = new vdj_schema.SchemaDefinition('SampleProcessing');
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

        if (! sampleProcessingSchema) sampleProcessingSchema = new vdj_schema.SchemaDefinition('SampleProcessing');
        this.schema = sampleProcessingSchema;
    },

    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },

    updatePCR: function(new_value) {
        let value = this.get('value');
        let pcr = value['pcr_target'][0];
        if(new_value != null) pcr.pcr_target_locus = new_value;
        else pcr.pcr_target_locus = null;
        this.set('value', value);
    },

    updateSequencingDataId: function(new_value) {
        let value = this.get('value');
        let s = value['sequencing_files'];
        if(new_value.length == 0) s.sequencing_data_id = null;
        else s.sequencing_data_id = new_value;
        this.set('value', value);
    },

    updateSequencingFiles: function(file, file_pair) {
        let value = this.get('value');

        // null everything out
        value['sequencing_files']['file_type'] =  null;
        value['sequencing_files']['filename'] = null;
        value['sequencing_files']['read_length'] = null;
        value['sequencing_files']['read_direction'] = null;
        value['sequencing_files']['paired_filename'] = null;
        value['sequencing_files']['paired_read_length'] = null;
        value['sequencing_files']['paired_read_direction'] = null;

        if(file) {
            let fValue = file.get('value');
            value['sequencing_files']['filename'] = fValue['name'];
            value['sequencing_files']['file_type'] =  file.getAIRRFileType();
            value['sequencing_files']['read_direction'] = file.getAIRRReadDirection();
            if(file_pair) {
                let fpValue = file_pair.get('value');
                value['sequencing_files']['paired_filename'] = fpValue['name'];
                value['sequencing_files']['paired_read_direction'] = file_pair.getAIRRReadDirection();
            }
        }
        this.set('value', value);
    },

    validate: function(attrs, options) {
        let errors = [];

        // AIRR schema validation
        let value = this.get('value');
        let valid = sampleProcessingSchema.validate_object(value);
        if (valid) {
            for (let i = 0; i < valid.length; ++i) {
                errors.push({ field: valid[i]['instancePath'].replace('/',''), message: valid[i]['message'], schema: valid[i]});
            }
        }

        // TODO: VDJServer additional validation

        // sample ID cannot be null or blank
        if (!value['sample_id']) errors.push({ field: 'sample_id', message: 'Sample ID cannot be blank'});
        else if (value['sample_id'].trim().length == 0) errors.push({ field: 'sample_id', message: 'Sample ID cannot be blank'});

        // a Repertoire must have either sequencing_data_id or a sequencing_file, and not both
        var sample = this.get('value');
        let s = sample['sequencing_files'];
        if(s.sequencing_data_id == null && s.filename == null)
            errors.push({ field: 'sequencing_files', message: 'Select either a sequencing file or a sequencing run ID.'});
        else if(s.sequencing_data_id != null && s.filename != null)
            errors.push({ field: 'sequencing_files', message: 'Cannot select both a sequencing file and a sequencing run ID.'});

        // collection_time_point_relative and collection_time_point_relative_unit must either both be defined or both be null
        var ctpr = sample['collection_time_point_relative'];
        if(sample['collection_time_point_relative_unit']) { var ctpru = sample['collection_time_point_relative_unit'].id; }

        if(ctpr != null && ctpru == null )
            errors.push({ field: 'collection_time_point_relative_unit', message: 'Unit cannot be null if Collection Time is defined.'});
        else if (ctpr == null && ctpru != null)
            errors.push({ field: 'collection_time_point_relative', message: 'Collection Time cannot be null if Unit is defined.'});

        // template_amount and template_amount_unit must either both be defined or both be null
        var ta = sample['template_amount'];
        if(sample['template_amount_unit']) { var tau = sample['template_amount_unit'].id; }

        if(ta && !tau)
            errors.push({ field: 'template_amount_unit', message: 'Unit cannot be null if Template Amount is defined.'});
        else if (!ta && tau)
            errors.push({ field: 'template_amount', message: 'Template Amount cannot be null if Unit is defined.'});

        // prc_target_locus cannot be null
        let pcr = sample['pcr_target'][0].pcr_target_locus;
        if(!pcr) errors.push({ field: 'pcr_target_locus', message: 'PCR Target Locus cannot be null.'});

        // add integer check for cell_number, cells_per_reaction, total_reads_passing_qc_filter
        // verify HTML checks for number work for collection_time_point_relative and template_amount
        // add checks for fields that cannot be blank

        if (errors.length == 0) return null;
        else return errors;
    },
});

// DataProcessing model based upon AIRR Data Processing
// which is a composite object
var dataProcessingSchema = null;
export var DataProcessing = Agave.MetadataModel.extend({
    defaults: function() {
        // Use AIRR schema Subject object as basis
        if (! dataProcessingSchema) dataProcessingSchema = new vdj_schema.SchemaDefinition('DataProcessing');
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

        if (! dataProcessingSchema) dataProcessingSchema = new vdj_schema.SchemaDefinition('DataProcessing');
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
        // this is the normal-form version
        if (! repertoireSchema) repertoireSchema = new vdj_schema.SchemaDefinition('Repertoire');
        this.schema = repertoireSchema;
        var blankEntry = repertoireSchema.template();

        // additional variables for models and collections for ease of GUI
        this.subject = null;
        this.sample = null;
        this.data_processing = null;

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

        if (parameters) {
            if (parameters.projectUuid) {
                let value = this.get('value');
                this.projectUuid = parameters.projectUuid;
                this.set('associationIds', [ parameters.projectUuid ]);
                value['study']['vdjserver_uuid'] = parameters.projectUuid;
                this.set('value', value);
            }
            if (parameters.subject) {
                this.setSubject(parameters.subject);
            }
            if (parameters.sample) {
                this.setSample(parameters.sample);
            }
        }
        if (! this.get('uuid')) this.set('uuid', this.cid);

        // this is the normal-form version
        if (! repertoireSchema) repertoireSchema = new vdj_schema.SchemaDefinition('Repertoire');
        this.schema = repertoireSchema;
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        return Agave.PutOverrideSync(method, this, options);
    },

    validate: function(attrs, options) {
        let errors = [];

        // AIRR schema validation
        let value = this.get('value');
        let valid = repertoireSchema.validate_object(value);
        if (valid) {
            for (let i = 0; i < valid.length; ++i) {
                errors.push({ field: valid[i]['instancePath'].replace('/',''), message: valid[i]['message'], schema: valid[i]});
            }
        }

        // TODO: VDJServer additional validation

        // repertoire needs at least one sample
        // TODO: not sure what field to highlight
        if ((!this.sample) || (this.sample.length == 0))
            errors.push({ field: 'sample', message: 'Repertoire requires at least one sample' });

        // a Repertoire must have a Subject
        if(value['subject'].vdjserver_uuid == null) errors.push({ field: 'subject', message: 'Subject ID must be defined'});

        // repertoire needs a subject assigned
        if (!this.subject)
            errors.push({ field: 'subject_id', message: 'Repertoire requires a subject'});

        // all samples within a repertoire should have unique ID
        if (this.sample) {
            let dups = this.sample.checkDuplicates();
            if (dups.length > 0) errors.push({ field: 'sample_id', message: 'Samples within repertoire must have unique IDs'});
        }

        // add integer check for cell_number, cells_per_reaction, total_reads_passing_qc_filter
        // verify HTML checks for number work for collection_time_point_relative and template_amount
        // add checks for fields that cannot be blank

        if (errors.length == 0) return null;
        else return errors;
    },

    // is model different from given model
    hasChangedFromModel: function(origModel) {
        // normal backbone hasChanged() will only check the model attributes
        // and not check any submodels.
        var changed = this.changedAttributes(origModel.attributes);
        if (changed) return true;

        // subject, should not be null
        // do not check content of subject, just if uuid has changed
        if ((!this.subject) || (!origModel.subject)) return true;
        let s = this.subject.get('uuid');
        let os = origModel.subject.get('uuid');
        if (s != os) return true;

        // samples, should not be null or empty
        if ((!this.sample) || (!origModel.sample)) return true;
        if ((this.sample.length == 0) || (origModel.sample.length == 0)) return true;
        if (this.sample.length != origModel.sample.length) return true;
        // do not check content of samples, just if uuids have changed
        for (let i = 0; i < this.sample.length; ++i) {
            let s = this.sample.at(i);
            let os = origModel.sample.get(s.get('uuid'));
            if (!os) return true;
        }

        // made it this far then everything is the same
        return false;
    },

    // repertoire contains sub-models and sub-collections so need handle it specially
    deepClone: function() {
        let m = Agave.MetadataModel.prototype.deepClone.apply(this, []);

        let value = this.get('value');

        // point to same study and subject
        let mv = m.get('value');
        mv['study'] = value['study'];
        m.set('value', mv);
        m.setSubject(this.subject);

        // clone the sample collection
        let samples = this.sample.getClonedCollection();
        m.setSample(samples);

        return m;
    },

    setSubject: function(subject) {
        let value = this.get('value');
        this.subject = subject;
        if (subject) value['subject']['vdjserver_uuid'] = this.subject.get('uuid');
        else value['subject']['vdjserver_uuid'] = null;
        this.set('value', value);
    },

    setSample: function(sample) {
        if (!sample) return;
        let value = this.get('value');
        this.sample = sample;
        if (this.sample.length > 0) {
            value['sample'] = [];
            for (let i = 0; i < this.sample.length; ++i) {
                value['sample'].push({ vdjserver_uuid: this.sample.at(i).get('uuid') });
            }
        } else {
            value['sample'] = [{ vdjserver_uuid: null }];
        }
        this.set('value', value);
    },

    // this is not generic but customized for our objects
    // this assumes the sub-objects have already been denormalized from their uuid
    getValuesForField(field) {
        var value = this.get('value');
        var paths = field.split('.');
        if (paths.length == 1) return value[paths[0]];
        else {
            switch(paths[0]) {
                case 'subject':
                    if (! this.subject) return null;
                    return this.subject.get('value')[paths[1]];
                case 'diagnosis':
                    if (! this.subject) return null;
                    var sv = this.subject.get('value');
                    var diagnosis = sv['diagnosis'];
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

