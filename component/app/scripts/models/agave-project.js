
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
import AIRRSchema from 'airr-schema';
import repertoire_template from 'airr-repertoire-template';

export default Agave.MetadataModel.extend({
    defaults: function() {

        // Use AIRR schema Study object as basis
        this.airr_schema = AIRRSchema['Study'];

        // make a deep copy of study object from the template
        var value = JSON.parse(JSON.stringify(repertoire_template['study']));
        value['study_type'] = null;
        //console.log(value);

        // add VDJServer specific fields
        value['showArchivedJobs'] = false;

        return _.extend(
            {},
            Agave.MetadataModel.prototype.defaults,
            {
                name: 'private_project',
                owner: '',
                value: value
            }
        );
    },
    url: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    sync: function(method, model, options) {

        // if uuid is not set, then we are creating a new project
        if (this.get('uuid') === '') {
            options.apiHost = EnvironmentConfig.vdjApi.hostname;
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

    // archiving is a hard delete
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
        if (! load_meta) return;
        var postData = { 'load_id': load_meta.get('uuid') };
        var jqxhr = $.ajax({
            contentType: 'application/json',
            headers: Agave.oauthHeader(),
            type: 'POST',
            data: JSON.stringify(postData),
            url: EnvironmentConfig.vdjApi.hostname + '/project/' + this.get('uuid') + '/reload',
        });

        return jqxhr;
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

    var Project = {};

    Project = Backbone.Agave.MetadataModel.extend({
        defaults: function() {
            return _.extend(
                {},
                Backbone.Agave.MetadataModel.prototype.defaults,
                {
                    name: 'project',
                    owner: '',
                    value: {
                        'name':  '',
                        'project_title': '',
                        'description': '',
                        'project_type': '',
                        'inclusion_exclusion_criteria': '',
                        'grant_agency': '',
                        'grants': '',
                        'pi_name': '',
                        'pi_institution': '',
                        'pi_email': '',
                        'contact_name': '',
                        'contact_institution': '',
                        'contact_email': '',
                        'biomaterial_provider': '',
                        'collected_by': '',
                        'uploaded_by': '',
                        'publications': '',
                        'pub_ids': '',
                        'ncbi_bioproject': '',
                        'showArchivedJobs': false
                    }
                }
            );
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        sync: function(method, model, options) {

            if (this.get('uuid') === '') {
                options.apiHost = EnvironmentConfig.vdjApi.hostname;
                options.url = '/projects';
                options.authType = 'basic';

                var value = this.get('value');
                var projectName = value.name;
                var username = Backbone.Agave.instance.token().get('username');

                this.clear();
                this.set({
                    username: username,
                    projectName: projectName
                });
            }

            return Backbone.Agave.PutOverrideSync(method, this, options);
        },
        setAttributesFromFormData: function(formData) {
            this.set('value', formData);
        },

        publishProject: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'PUT',
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.get('uuid') + '/publish'
            });

            return jqxhr;
        },

        unpublishProject: function() {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'PUT',
                url: EnvironmentConfig.vdjApi.hostname
                    + '/projects/' + this.get('uuid') + '/unpublish'
            });

            return jqxhr;
        },

        addUserToProject: function(username) {

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: this.get('uuid'),
                    username: username
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            });

            return jqxhr;
        },

        // don't actually delete, just rename metadata item
        deleteProject: function() {
            this.set('name', 'deletedProject');
            return this.save();
        },
    });

    Backbone.Agave.Model.Project = Project;
    return Project;
});
*/
