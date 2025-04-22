
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

export var Job = Agave.Model.extend({
    defaults: {
        id: '',
    },
    url: function() {
        return '/jobs/v2/' + this.get('id');
    },
});

export var ProjectJob = Agave.MetadataModel.extend({
    defaults: function() {
        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'projectJob',
                owner: '',
                value: {
                    'projectUuid': '',
                    'jobUuid': '',
                },
            }
        );
    },
    url: function() {
        return '/meta/v2/data?q='
            + encodeURIComponent('{'
                + '"name":"projectJob",'
                + '"associationIds":"' + this.get('jobId') + '"'
            + '}')
            + '&limit=1';
    },
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
    },
    getWorkflowTCRPresto: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:presto'] =  {
            "vdjserver:activity:presto": {
                "vdjserver:app:name": "presto-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "TCR-Presto Workflow";
        this.set('value', value);
    },
    getWorkflowTCRVDJPipe: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:vdjpipe'] =  {
            "vdjserver:activity:vdjpipe": {
                "vdjserver:app:name": "vdjpipe-ls6",
                "vdjserver:app:version": "0.1"
            }
        };
        value['workflow_mode'] = "TCR-VDJPipe Workflow";
        this.set('value', value);

        this.VDJPipeParameters = new VDJPipeParameters();
    },
    getWorkflowIgBlast: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:igblast'] =  {
            "vdjserver:activity:igblast": {
                "vdjserver:app:name": "igblast-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "IgBlast Workflow";
        this.set('value', value);
    },
    getWorkflow10X: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:cellranger'] =  {
            "vdjserver:activity:cellranger": {
                "vdjserver:app:name": "cellranger-ls6",
                "vdjserver:app:version": "9.0.1"
            }
        };
        value['workflow_mode'] = "10X Workflow";
        this.set('value', value);
    },
    getWorkflowComparative: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:vdjpipe'] =  {
            "vdjserver:activity:vdjpipe": {
                "vdjserver:app:name": "vdjpipe-ls6",
                "vdjserver:app:version": "0.1"
            }
        };
        value['workflow_mode'] = "Comparative Workflow";
        this.set('value', value);
    },
    getToolPresto: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:presto'] =  {
            "vdjserver:activity:presto": {
                "vdjserver:app:name": "presto-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "Presto Single-Tool";
        this.set('value', value);
    },
    getToolVDJPipe: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:vdjpipe'] =  {
            "vdjserver:activity:vdjpipe": {
                "vdjserver:app:name": "vdjpipe-ls6",
                "vdjserver:app:version": "0.1"
            }
        };
        value['workflow_mode'] = "VDJPipe Single-Tool";
        this.set('value', value);
        
        this.VDJPipeParameters = new VDJPipeParameters();
    },
    getToolIgBlast: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:igblast'] =  {
            "vdjserver:activity:igblast": {
                "vdjserver:app:name": "igblast-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "IgBlast Single-Tool";
        this.set('value', value);
    },
    getToolRepCalc: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:repcalc'] =  {
            "vdjserver:activity:repcalc": {
                "vdjserver:app:name": "repcalc-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "RepCalc Single-Tool";
        this.set('value', value);
    },
    getToolStatistics: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:statistics'] =  {
            "vdjserver:activity:statistics": {
                "vdjserver:app:name": "statistics-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "Statistics Single-Tool";
        this.set('value', value);
    },
    getToolCellranger: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:cellranger'] =  {
            "vdjserver:activity:cellranger": {
                "vdjserver:app:name": "cellranger-ls6",
                "vdjserver:app:version": "9.0.1"
            }
        };
        value['workflow_mode'] = "Cellranger Single-Tool";
        this.set('value', value);
    },
    getToolTCRMatch: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:tcrmatch'] =  {
            "vdjserver:activity:tcrmatch": {
                "vdjserver:app:name": "tcrmatch-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "TCRMatch Single-Tool";
        this.set('value', value);
    },
    getToolTRUST4: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:trust4'] =  {
            "vdjserver:activity:trust4": {
                "vdjserver:app:name": "trust4-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "TRUST4 Single-Tool";
        this.set('value', value);
    },
    getToolCompAIRR: function() {
        let value = this.get('value')
        if (!value['activity']) {
            value['activity'] = {};
        }
        value['activity']['vdjserver:activity:compairr'] =  {
            "vdjserver:activity:compairr": {
                "vdjserver:app:name": "compairr-ls6",
                "vdjserver:app:version": "xxx"
            }
        };
        value['workflow_mode'] = "CompAIRR Single-Tool";
        this.set('value', value);
    },
    // url: function() {
    //     return '/meta/v2/data?q='
    //         + encodeURIComponent('{'
    //             + '"name":"projectJob",'
    //             + '"associationIds":"' + this.get('jobId') + '"'
    //         + '}')
    //         + '&limit=1';
    // },
});

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
