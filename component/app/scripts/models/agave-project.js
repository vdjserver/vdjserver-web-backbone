
'use strict';

//
// agave-project.js
// Project model
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
import { File, ProjectFile, ProjectFileMetadata } from 'Scripts/models/agave-file';

// AIRR Schema
import { airr } from 'airr-js';
import { vdj_schema } from 'vdjserver-schema';

var studySchema = null;
export default Agave.MetadataModel.extend({
    defaults: function() {

        // VDJServer schema Study object as basis
        if (! studySchema) studySchema = new vdj_schema.SchemaDefinition('Study');
        this.schema = studySchema;
        var blankEntry = studySchema.template();

        // TODO: what is this?
        //value['study_type'] = null;

        // add VDJServer specific fields
        //value['showArchivedJobs'] = false;

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'private_project',
                owner: '',
                value: blankEntry
            }
        );
    },
    initialize: function(parameters) {
        Agave.MetadataModel.prototype.initialize.apply(this, [parameters]);

        if (! studySchema) studySchema = new vdj_schema.SchemaDefinition('Study');
        this.schema = studySchema;
    },
    url: function() {
        return '/project/' + this.get('uuid') + '/metadata/uuid/' + this.get('uuid');
    },
    sync: function(method, model, options) {
        // if uuid is the cid then blank it
        if (this.get('uuid') == this.cid) this.set('uuid', '');

        // if uuid is not set, then we are creating a new project
        var uuid = this.get('uuid');
        if (!uuid || uuid == '') {
            options.url = '/project';
            options.authType = 'oauth';

            // we send just the project info when creating
            // the response will be the Tapis metadata object
            var value = this.get('value');
            this.clear();
            this.set({ project: value });
        }

        return Agave.PutOverrideSync(method, this, options);
    },

    setAttributesFromData: function(data) {
        // call default function
        Agave.MetadataModel.prototype.setAttributesFromData.apply(this, [data]);

        // then handle special fields
        var value = this.get('value');
        var keywords = [];
        if (data.contains_ig) keywords.push('contains_ig');
        if (data.contains_tr) keywords.push('contains_tr');
        if (data.contains_single_cell) keywords.push('contains_single_cell');
        if (data.contains_paired_chain) keywords.push('contains_paired_chain');
        value.keywords_study = keywords;
        keywords = [];
        if (data.is_10x_genomics) keywords.push('is_10x_genomics');
        if (keywords.length > 0) value.vdjserver_keywords = keywords;
        this.set('value', value);
    },

    addUserToProject: function(username) {

        var jqxhr = $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                project_uuid: this.get('uuid'),
                username: username
            }),
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/permission/user',
        });

        return jqxhr;
    },

    deleteUserFromProject: function(username) {

        var jqxhr = $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                project_uuid: this.get('uuid'),
                username: username
            }),
            headers: Agave.oauthHeader(),
            type: 'DELETE',
            url: EnvironmentConfig.vdjApi.hostname + '/permission/user',
        });

        return jqxhr;
    },

    generateVisualization: async function(name, repertoire_id, repertoire_group_id, processing_stage) {
        var schema = new vdj_schema.SchemaDefinition('VisualizationRequest');
        var doc = schema.template();
        doc['visualization']['name'] = name;
        doc['visualization']['repertoire_id'] = repertoire_id;
        doc['visualization']['repertoire_group_id'] = repertoire_group_id;
        doc['visualization']['processing_stage'] = processing_stage;

        var jqxhr = $.ajax({
            contentType: 'application/json',
            data: JSON.stringify(doc),
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/visualize',
        });

        return jqxhr;
    },

    // archiving is a soft delete
    archiveProject: function() {
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/archive',
        });

        return jqxhr;
    },

    unarchiveProject: function() {
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/unarchive',
        });

        return jqxhr;
    },

    // purging is a hard delete
    purgeProject: function() {
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'DELETE',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/purge',
        });

        return jqxhr;
    },

    importMetadataFromFile: function(project_file, operation) {
        var value = project_file.get('value');
        var jqxhr = $.ajax({
            contentType: 'application/json',
            data: JSON.stringify({
                filename: value['name'],
                operation: operation
            }),
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/metadata/import',
        });

        return jqxhr;
    },

    exportMetadataToDisk: function() {
        var that = this;

        // export to temporary file
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'GET',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/metadata/export',
        });

        return jqxhr.then(function(res) {
            console.log(res);
            var pf = new ProjectFile({path: '/projects/' + that.get('uuid') + '/deleted/' + res['result']['file']});
            return pf.downloadFileToDisk();
        });
    },

    exportTableToDisk: function(table) {
        var that = this;

        // export to temporary file
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'GET',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/' + table + '/export',
        });

        return jqxhr.then(function(res) {
            console.log(res);
            var pf = new ProjectFile({path: '/projects/' + that.get('uuid') + '/deleted/' + res['result']['file']});
            return pf.downloadFileToDisk();
        });
    },

    //
    // Publishing and ADC Repository
    //
    validateProject: function() {
        // TODO: not implemented yet
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/validate',
        });

        return jqxhr;
    },

    publishProject: function() {
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/publish',
        });

        return jqxhr;
    },

    unpublishProject: function() {
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/unpublish',
        });

        return jqxhr;
    },

    loadProject: function() {
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/load',
        });

        return jqxhr;
    },

    unloadProject: function(load_meta) {
        if (! load_meta) return;
        var postData = { 'load_id': load_meta['uuid'] };
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            data: JSON.stringify(postData),
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/unload',
        });

        return jqxhr;
    },

    reloadProject: function(load_meta) {
        if (!load_meta) return Promise.reject(new Error('Missing load metadata.'));

        var postData = { 'load_id': load_meta.get('uuid') };
        return new Promise((resolve, reject) => {
            $.ajax({
                headers: Agave.oauthHeader(),
                url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/reload',
                type: 'POST',
                data: JSON.stringify(postData),
                processData: false,
                contentType: 'application/json',
                success: function (data) {
                    resolve(data)
                },
                error: function (error) {
                    reject(error)
                },
            })
        });
    },

});
