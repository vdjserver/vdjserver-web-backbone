
'use strict';

//
// agave-job.js
// Job models
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
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
import _string from 'underscore.string';
import Chance from 'chance';
import moment from 'moment';

// AIRR Schema
import { airr } from 'airr-js';
import { vdj_schema } from 'vdjserver-schema';

// export var Job = Agave.Model.extend({
//     defaults: {
//         id: '',
//     },
//     url: function() {
//         return '/jobs/v2/' + this.get('id');
//     },
// });
// 
// export var ProjectJob = Agave.MetadataModel.extend({
//     defaults: function() {
//         return _.extend(
//             {},
//             Agave.MetadataModel.prototype.defaults,
//             {
//                 name: 'projectJob',
//                 owner: '',
//                 value: {
//                     'projectUuid': '',
//                     'jobUuid': '',
//                 },
//             }
//         );
//     },
//     url: function() {
//         return '/meta/v2/data?q='
//             + encodeURIComponent('{'
//                 + '"name":"projectJob",'
//                 + '"associationIds":"' + this.get('jobId') + '"'
//             + '}')
//             + '&limit=1';
//     },
// });

var vdjpipeParameterSchema = null;
export var VDJPipeParameters = Agave.MetadataModel.extend({
    defaults: function() {
        // Use VDJ schema VDJPipeParameters object as basis
        if(!vdjpipeParameterSchema) vdjpipeParameterSchema = new vdj_schema.SchemaDefinition('VDJPipeParameters');
        this.schema = vdjpipeParameterSchema;
        // make a deep copy from the template
        var blankEntry = vdjpipeParameterSchema.template();

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'vdjpipe_parameters',
                owner: '',
                value: blankEntry,
            }
        );
    },

    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if(!vdjpipeParameterSchema) vdjpipeParameterSchema = new vdj_schema.SchemaDefinition('VDJPipeParameters');
        this.schema = vdjpipeParameterSchema;
    },

    validate: function(attrs, options) {
        let errors = [];

        // AIRR schema validation
        let value = this.get('value');
        let valid = this.schema.validate_object(value);
        if (valid) {
            for (let i = 0; i < valid.length; ++i) {
                errors.push({ field: valid[i]['instancePath'].replace('/',''), message: valid[i]['message'], schema: valid[i]});
            }
        }
    }
});

var analysisSchema = null;
export var AnalysisDocument = Agave.MetadataModel.extend({
    defaults: function() {
        // Use VDJ schema AnalysisDocument object as basis
        if(!analysisSchema) analysisSchema = new vdj_schema.SchemaDefinition('AnalysisDocument');
        this.schema = analysisSchema;
        // make a deep copy from the template
        var blankEntry = analysisSchema.template();

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'analysis_document',
                owner: '',
                value: blankEntry,
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if(!analysisSchema) analysisSchema = new vdj_schema.SchemaDefinition('AnalysisDocument');
        this.schema = analysisSchema;
        this.toolParameters = {};
    },
    url: function() {
        return '/project/' + this.projectUuid + '/execute';
    },

    setAnalysis: function(analysis_name) {
        // check if it is a single tool application
        if (EnvironmentConfig.apps[analysis_name]) {
            let value = this.get('value')
            value['workflow_mode'] = analysis_name;
            value['workflow_name'] = EnvironmentConfig.apps[analysis_name]['vdjserver:name'];
            value['activity'] = {};

            // add activity
            for (let a in EnvironmentConfig.apps[analysis_name]['activity']) {
                if (EnvironmentConfig.apps[analysis_name]['activity'][a]['vdjserver:app:default']) {
                    value['activity']["vdjserver:activity:" + analysis_name] = Object.assign({}, EnvironmentConfig.apps[analysis_name]['activity'][a]);
                }
            }

            // parameter objects are held in the object but not stored as attributes
            // they get transformed into a PROV entity when saved to backend
            let p = AnalysisDocument.toolParameterMap[analysis_name];
            if (p) this.toolParameters[analysis_name] = new p;

            this.set('value', value);
            return this;
        }

        // check if it is a workflow
        if (EnvironmentConfig.workflows[analysis_name]) {
            let value = this.get('value')
            value['workflow_mode'] = analysis_name;
            value['workflow_name'] = EnvironmentConfig.workflows[analysis_name]['vdjserver:name'];
            value['activity'] = {};

            // parameter objects are held in the object but not stored as attributes
            // they get transformed into a PROV entity when saved to backend
            // one for each tool in the workflow
            for (let i in EnvironmentConfig.workflows[analysis_name]['vdjserver:activity:pipeline']) {
                let tn = EnvironmentConfig.workflows[analysis_name]['vdjserver:activity:pipeline'][i];
                let p = AnalysisDocument.toolParameterMap[tn];
                if (p) this.toolParameters[tn] = new p;
                // add activities
                for (let a in EnvironmentConfig.apps[tn]['activity']) {
                    if (EnvironmentConfig.apps[tn]['activity'][a]['vdjserver:app:default']) {
                        value['activity']["vdjserver:activity:" + tn] = Object.assign({}, EnvironmentConfig.apps[tn]['activity'][a]);
                    }
                }
            }

            this.set('value', value);
            return this;
        }

        console.error('Unknown analysis:', analysis_name);
        return null;
    },

    setEntities: function(repertoires, groups) {
        let value = this.get('value')
        value['entity'] = {};

        if (repertoires) {
            for (let i in repertoires) {
                let rep = repertoires[i];
                value['entity']['airr:Repertoire:' + rep.get('uuid')] = {
                    "airr:type": "Repertoire",
                    "vdjserver:type": "app:inputs",
                    "vdjserver:uuid": rep.get('uuid')
                };
            }
        }

        if (groups) {
            for (let i in groups) {
                let g = groups[i];
                value['entity']['airr:RepertoireGroup:' + g.get('uuid')] = {
                    "airr:type": "RepertoireGroup",
                    "vdjserver:type": "app:inputs",
                    "vdjserver:uuid": g.get('uuid')
                };
            }
        }

        this.set('value', value);
        return this;
    },

    finalizeDocument: function(repertoires, groups) {
        let value = this.get('value');
        // TODO: we currently hard-code to max 3 steps for workflows
        // simplify the variables
        var step1 = null;
        var step2 = null;
        var step3 = null;
        if (EnvironmentConfig.apps[value['workflow_mode']]) {
            step1 = value['workflow_mode'];
        }
        if (EnvironmentConfig.workflows[value['workflow_mode']]) {
            step1 = EnvironmentConfig.workflows[value['workflow_mode']]['vdjserver:activity:pipeline'][0];
            if (EnvironmentConfig.workflows[value['workflow_mode']]['vdjserver:activity:pipeline'][1]) {
                step2 = EnvironmentConfig.workflows[value['workflow_mode']]['vdjserver:activity:pipeline'][1];
            }
            if (EnvironmentConfig.workflows[value['workflow_mode']]['vdjserver:activity:pipeline'][2]) {
                step3 = EnvironmentConfig.workflows[value['workflow_mode']]['vdjserver:activity:pipeline'][2];
            }
        }
        // prefixes
        value['prefix'] = {
            "airr": "https://airr-community.org/",
            "vdjserver": "https://vdjserver.org/"
        };

        // relations
        value['uses'] = {};
        value['isGeneratedBy'] = {};

        // add input entities

        // add parameter entities
        if (step1) {
            let param_entity = "vdjserver:app:parameters:" + step1;
            let activity_key = "vdjserver:activity:" + step1;
            let e1 = { "vdjserver:type": "app:parameters" };
            let pvalue = this.toolParameters[step1].get('value');
            e1 = Object.assign(e1, pvalue);
            value['entity'][param_entity] = e1;
            value['uses'][param_entity] = { "prov:activity": activity_key, "prov:entity": param_entity};
        }
        if (step2) {
            let param_entity = "vdjserver:app:parameters:" + step2;
            let activity_key = "vdjserver:activity:" + step2;
            let e2 = { "vdjserver:type": "app:parameters" };
            let pvalue = this.toolParameters[step2].get('value');
            e2 = Object.assign(e2, pvalue);
            value['entity'][param_entity] = e2;
            value['uses'][param_entity] = { "prov:activity": activity_key, "prov:entity": param_entity};
        }
        if (step3) {
            let param_entity = "vdjserver:app:parameters:" + step3;
            let activity_key = "vdjserver:activity:" + step3;
            let e3 = { "vdjserver:type": "app:parameters" };
            let pvalue = this.toolParameters[step3].get('value');
            e3 = Object.assign(e3, pvalue);
            value['entity'][param_entity] = e3;
            value['uses'][param_entity] = { "prov:activity": activity_key, "prov:entity": param_entity};
        }

        // add output entities
        // connect input/output for pipeline steps
        if (step1) {
            // output of step1
            let entity_key = "vdjserver:app:outputs:" + step1;
            let activity_key = "vdjserver:activity:" + step1;
            let e1 = { "vdjserver:type": "app:outputs" };
            value['entity'][entity_key] = e1;
            value['isGeneratedBy'][entity_key] = { "prov:activity": activity_key, "prov:entity": entity_key};
        }
        if (step2) {
            // output of step2
            let entity_key = "vdjserver:app:outputs:" + step2;
            let activity_key = "vdjserver:activity:" + step2;
            let e1 = { "vdjserver:type": "app:outputs" };
            value['entity'][entity_key] = e1;
            value['isGeneratedBy'][entity_key] = { "prov:activity": activity_key, "prov:entity": entity_key};

            // output of step1 is input to step2
            entity_key = "vdjserver:app:inputs:" + step2;
            let input_entity = "vdjserver:app:outputs:" + step1;
            value['uses'][input_entity] = { "prov:activity": activity_key, "prov:entity": entity_key};
        }
        if (step3) {
            // output of step3
            let entity_key = "vdjserver:app:outputs:" + step3;
            let activity_key = "vdjserver:activity:" + step3;
            let e1 = { "vdjserver:type": "app:outputs" };
            value['entity'][entity_key] = e1;
            value['isGeneratedBy'][entity_key] = { "prov:activity": activity_key, "prov:entity": entity_key};

            // output of step2 is input to step3
            entity_key = "vdjserver:app:inputs:" + step3;
            let input_entity = "vdjserver:app:outputs:" + step2;
            value['uses'][input_entity] = { "prov:activity": activity_key, "prov:entity": entity_key};
        }

    },

    validate: function(attrs, options) {
        let errors = [];

        // AIRR schema validation
        let value = this.get('value');
        let valid = this.schema.validate_object(value);
        if (valid) {
            for (let i = 0; i < valid.length; ++i) {
                errors.push({ field: valid[i]['instancePath'].replace('/',''), message: valid[i]['message'], schema: valid[i]});
            }
        }

        // VDJServer additional validation

        // need some repertoire or repertoire group entities
        if ((!value['entity']) || (Object.keys(value['entity']).length == 0)) {
            errors.push({ field: 'repertoire-analysis-select', message: 'Must select repertoires and/or repertoire groups'});
        }

        if (errors.length == 0) return null;
        else return errors;
    }
},
{
    //
    // class (global) variables and functions for AnalysisDocument
    //

    // mapping of tools to their parameter structures
    toolParameterMap: {
        vdjpipe: VDJPipeParameters,
        presto: null,
        igblast: null,
        repcalc: null,
        statistics: null,
        cellranger: null,
        tcrmatch: null,
        trust4: null,
        compairr: null
    },

});

export var ProcessMetadata = Agave.MetadataModel.extend({
    defaults: function() {
        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'processMetadata',
                owner: '',
                value: {
                },
            }
        );
    },
    url: function() {
        return '/meta/v2/data?q='
            + encodeURIComponent('{'
                + '"name":"processMetadata",'
                + '"associationIds":"' + this.get('jobId') + '"'
            + '}')
            + '&limit=1';
    },
    getDescriptionForFilename: function(filename) {
        var value = this.get('value');
        if (!value) return null;
        if (!value['files']) return null;

        var files = value['files'];
        for (var f in files) {
            for (var t in files[f]) {
                if (files[f][t]['value'] == filename) return files[f][t]['description'];
            }
        }
        return null;
    },

    getProjectFileOutputList: function() {
        var pmFiles = [];

        var processMetadata = this.get('value');
        if (!processMetadata) return pmFiles;
        if (!processMetadata.process) return pmFiles;

        for (var group in processMetadata.groups) {
            if (processMetadata.groups[group]['type'] == 'file') {
                if (processMetadata.groups[group][processMetadata.process.appName]) {
                    var fileKey = processMetadata.groups[group][processMetadata.process.appName]['files'];
                    for (var fileEntry in processMetadata.files[fileKey]) {
                        pmFiles.push(processMetadata.files[fileKey][fileEntry]['value']);
                    }
                }
            }
        }

        return pmFiles;
    },

    getLogAndMetadataFileList: function() {
        var pmFiles = [];

        var processMetadata = this.get('value');
        if (!processMetadata) return pmFiles;
        if (!processMetadata.process) return pmFiles;

        for (var groupEntry in processMetadata.groups) {
            if (processMetadata.groups[groupEntry]['log']) {
                var fileKey = processMetadata.groups[groupEntry]['log']['files'];
                for (var fileEntry in processMetadata.files[fileKey]) {
                    pmFiles.push(processMetadata.files[fileKey][fileEntry]);
                }
            }
        }

        if (processMetadata.files['metadata']) {
            for (var fileEntry in processMetadata.files['metadata']) {
                pmFiles.push(processMetadata.files['metadata'][fileEntry]);
            }
        }

        return pmFiles;
    },

    getSampleKeyNameFromUuid: function(sampleUuid) {
        var processMetadata = this.get('value');
        if (!processMetadata) return null;
        if (!processMetadata.process) return null;

        for (var group in processMetadata.groups) {
            if (processMetadata.groups[group]['type'] == 'sample') {
                for (var sample in processMetadata.groups[group]['samples'])
                    if (sample == sampleUuid) return group;
            }
        }
        return null;
    },
});
