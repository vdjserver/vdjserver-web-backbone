
'use strict';

//
// backbone-agave.js
// Core Agave (Tapis) objects for Backbone
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

import Backbone from 'backbone';
//import RetrySync from 'backbone-retry-sync';
import moment from 'moment';
import { vdj_schema } from 'vdjserver-schema';

// The core agave object
export var Agave = function(options) {

    var defaults = _.extend({primary: true}, options);
    this._token = new Agave.Auth.Token({});

    if (defaults.token) {
        this.token(defaults.token);
    }

    if (defaults.primary) {
        Agave.instance = this;
    }

};

_.extend(Agave.prototype, Backbone.Events, {

    constructor: Agave,

    token: function(options) {
        if (options) {
            this._token.set(options);
        }
        return this._token;
    },

    destroyToken: function() {
        this._token.destroy();
    },

});

Agave.ajax = function(config) {

    var jqxhr = $.ajax(config);

    return jqxhr
        .fail(function(response) {

            if (response.status === 401) {
                Agave.instance.destroyToken();
            }

        })
        ;
};

Agave.oauthHeader = function() {
    return {
        'Authorization': 'Bearer ' + Agave.instance.token().get('access_token'),
    };
};

Agave.jwtHeader = function() {
    return {
        'X-Tapis-Token': Agave.instance.token().get('access_token'),
    };
};

Agave.sync = function(method, model, options) {

    var apiHost = model.apiHost;
    if (options.apiHost) {
        apiHost = options.apiHost;
    }

    options.url = apiHost + (options.url || _.result(model, 'url'));

    if (model.requiresAuth) {
        var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();
        var authType = model.authType;
        if (options.authType) authType = options.authType;

        // Allow user-provided before send, but protect ours, too.
        if (options.beforeSend) {
            options._beforeSend = options.beforeSend;
        }
        options.beforeSend = function(xhr) {
            if (options._beforeSend) {
                //console.log("xhr is: " + JSON.stringify(xhr));
                //options._beforeSend(xhr);
            }

            if (_.has(xhr, 'setRequestHeader')) {
                if (authType === 'oauth') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + agaveToken.get('access_token'));
                }
                if (authType === 'jwt') {
                    xhr.setRequestHeader('X-Tapis-Token', agaveToken.get('access_token'));
                }
            }
        };

    }

    if (!model.requiresAuth) {
        return Backbone.sync(method, model, options);
    }
    else {
        /*
            Choose your own adventure:

            A.) Call default sync if token is ok
            B.) Try to refresh the token and then continue as usual
            C.) Abandon ship
        */
        if (Agave.instance.token().isActive()) {

            return Backbone.sync(method, model, options)
                .fail(function(response) {

                    if (response.status === 401) {
                        Agave.instance.destroyToken();
                    }

                })
                ;
        }
        else if (!Agave.instance.token().isActive() && Agave.instance.token().get('refresh_token')) {

            return Agave.instance.token()
                .save()
                .then(function() {
                    return Backbone.sync(method, model, options);
                })
                .fail(function() {
                    Agave.instance.destroyToken();
                })
                ;
        }
        else {
            Agave.instance.destroyToken();

            var deferred = $.Deferred();
            deferred.reject();

            return deferred;
        }
    }
};

// This is a complete replacement for backbone.sync
// and is mostly the same as that whenever possible
Agave.PutOverrideSync = function(method, model, options) {

    if (method === 'update') {
        method = 'create';
    }

    return Agave.sync(method, model, options);
};

// Agave extension of default Backbone.Model that uses Agave sync
Agave.Model = Backbone.Model.extend({
    initialize: function(parameters) {
        Backbone.Model.prototype.initialize.apply(this, [parameters]);

        this.communityMode = false;
        if (parameters && parameters.communityMode) {
            this.communityMode = parameters.communityMode;
        }
        if (this.communityMode) {
            this.apiHost = EnvironmentConfig.vdjGuest.hostname;
            this.requiresAuth = false;
        }
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    authType: 'oauth',
    sync: Agave.sync,
    requiresAuth: true,
    parse: function(response) {
        if (response.result) {
            if (_.isArray(response.result)) {
                return response.result[0];
            }

            return response.result;
        }
        return response;
    },
});

// Agave extension of default Backbone.Collection that uses Agave sync
Agave.Collection = Backbone.Collection.extend({
    initialize: function(models, parameters) {
        Backbone.Collection.prototype.initialize.apply(this, [models, parameters]);
        //this.retrySyncEngine = Agave.sync;
        //this.retrySyncLimit = 1;
        this.communityMode = false;
        if (parameters && parameters.communityMode) {
            this.communityMode = parameters.communityMode;
        }
        if (this.communityMode) {
            this.apiHost = EnvironmentConfig.vdjGuest.hostname;
            this.requiresAuth = false;
        }
    },
    //apiHost: EnvironmentConfig.agave.hostname,
    apiHost: EnvironmentConfig.vdjApi.hostname,
    authType: 'oauth',
    //sync: Backbone.RetrySync,
    sync: Agave.sync,
    requiresAuth: true,
    parse: function(response) {
        if (response.result) {
            return response.result;
        }
        return response;
    },
});

// Paginated version of Agave.Collection
Agave.PaginatedCollection = Agave.Collection.extend({
    initialize: function(models, parameters) {
        Agave.Collection.prototype.initialize.apply(this, [models, parameters]);

        this.offset = 0;
        this.limit = 1000;
    },
    /*
        Fetch data in multiple smaller sets instead of one giant collection.
        This fetch method will automatically fetch an entire collection by subsets.

        This will be useful to us as VDJServer grows because it will allow us to
        scale project and project file metadata requests. It could also be
        updated for lazy loading and/or user invoked pagination.
    */
    //sync: Backbone.RetrySync,
    sync: Agave.sync,

    fetch: function() {
        var that = this;

        var deferred = $.Deferred();

        var models = [];

        var offsetFetch = function() {
            // Reuse parent fetch/sync methods so we don't have to reconfigure everything all over again
            Agave.Collection.prototype.fetch.call(that, {})
            .then(function(response) {
                response = that.parse(response);

                return response;
            })
            .then(function(response) {

                // Response array has greater than 0 objects, so we'll need to fetch the next set too
                if (response.length > 0) {

                    that.offset += response.length;

                    models = models.concat(that.reset(response));

                    // BUG: doing this because of bug with Tapis list_profiles
                    if (response.length < that.limit) {
                        that.offset = 0;
                        that.reset(models);
                        deferred.resolve();
                    } else
                        offsetFetch();
                }
                // The most recent fetch had 0 objects, so we're done now
                // Put the collection in the correct state and exit the promise
                else {
                    that.offset = 0;
                    that.reset(models);
                    deferred.resolve();
                }
            })
            .fail(function(error) {
                deferred.reject(error);
            })
            ;
        };

        offsetFetch();

        return deferred;
    },
});

// Specifically for data that stored in the Tapis (Agave) metadata service
var metamodelSchema = null;
Agave.MetadataModel = Agave.Model.extend({
    idAttribute: 'uuid',
    defaults: function() {
        // Use VDJServer schema TapisMetaObject object as basis
        if (! metamodelSchema) metamodelSchema = new vdj_schema.SchemaDefinition('TapisMetaObject');
        this.schema = metamodelSchema;
        // make a deep copy from the template
        var blankEntry = metamodelSchema.template();

        return blankEntry;
    },
    initialize: function(parameters) {
        Agave.Model.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
            this.set('associationIds', [ parameters.projectUuid ]);
        }

        if (parameters && parameters.communityMode) {
            this.communityMode = parameters.communityMode;
        }
        if (this.communityMode) {
            this.apiHost = EnvironmentConfig.vdjGuest.hostname;
            this.requiresAuth = false;
        }
    },
    sync: function(method, model, options) {
        // if uuid is the cid then blank it
        if (this.get('uuid') == this.cid) this.set('uuid', '');

        // if uuid is not set, then we are creating a new object
        if (this.get('uuid') === '') {
            options.url = '/project/' + this.projectUuid + '/metadata/name/' + this.get('name');
            options.authType = 'oauth';
        }

        return Agave.PutOverrideSync(method, this, options);
    },
    url: function() {
        return '/project/' + this.projectUuid + '/metadata/uuid/' + this.get('uuid');
    },
    parse: function(response) {

        if (response.status === 'success' && response.result) {

            //response.result = this.parseDate(response.result);

            if (response.result.length > 0) {

                return response.result[0];
            }

            return response.result;
        }

        return response;
    },

    deepClone: function() {
        let m = this.clone();
        // deep copy of value
        let value = this.get('value');
        m.set('value', JSON.parse(JSON.stringify(value)));
        // local attributes that do not get saved to server
        let vdj = this.get('x-vdjserver');
        if (vdj) m.set('x-vdjserver', JSON.parse(JSON.stringify(vdj)));
        return m;
    },

    updateField: function(name, new_value) {
        let value = this.get('value');
        let newval = new_value;

        // treat blank string as null otherwise leave untouched
        if (typeof new_value === 'string' || new_value instanceof String) {
            newval = new_value.trim();
            if (newval.length == 0) newval = null;
        }

        // if no schema then cannot do type casting so just set
        if (!this.schema) {
            value[name] = newval;
            this.set('value', value);
            return;
        }

        // is it ontology
        if (this.schema.is_ontology(name)) {
            if (newval && (newval.id.trim().length == 0)) newval = null;
            if (!newval) value[name] = null;
            else value[name] = { id: new_value.id, label: new_value.label };
            this.set('value', value);
            return;
        }

        // cast to appropriate type from schema before setting
        let type = this.schema.type(name);
        if (!type) {
            console.log('Internal error: trying to update field (' + name + ') which is not in schema!');
            return;
        }
        if (type == 'boolean') {
            if (newval == null) value[name] = null;
            if (newval == "true") value[name] = true;
            if (newval == "false") value[name] = false;
            this.set('value', value);
            return;
        }
        if (type == 'number') {
            if (newval) newval = parseFloat(newval);
            value[name] = newval;
            this.set('value', value);
            return;
        }
        if (type == 'string') {
            value[name] = newval;
            this.set('value', value);
            return;
        }
    },


    // TODO: this should flow through updateField so type is used
    setAttributesFromData: function(data) {
        // we only pull values out of data for existing keys
        var value = this.get('value');
        for (var obj in value)
            if (data[obj] != undefined)
                value[obj] = data[obj];
        this.set('value', value);
    },

    // flatten all values into a single string for easy search
    generateFullText: function(context) {
        var text = '';
        if ((typeof context) == 'string') {
            text += ' ' + context;
            return text;
        }
        if (context instanceof Backbone.Model) {
            text += this.generateFullText(context['attributes']);
            return text;
        }
        if (context instanceof Backbone.Collection) {
            for (var i = 0; i < context.length; ++i) {
                let model = context.at(i);
                text += this.generateFullText(model['attributes']);
            }
            return text;
        }
        if ((typeof context) == 'object') {
            for (var o in context)
                text += this.generateFullText(context[o]);
            return text;
        }
        if (Array.isArray(context)) {
            for (var i = 0; i < context.length; ++i)
                text += this.generateFullText(context[i]);
            return text;
        }
    },

    // this is mainly to handle the different types of values
    // whether it be a string, an ontology id, or something else
    addUniqueValue: function(values, obj) {
        if (obj == null) return;
        if (typeof obj === 'object') {
            // assume it is an ontology field
            if (obj['id'] == null) return;
            let found = false;
            for (let k = 0; k < values.length; ++k) {
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
    },

    /*
    parseDate: function(result) {

        var dateFormat = 'YYYY-MM-DD HH:mm:ss.SSSZZ';

        for (var i = 0; i < result.length; i++) {
            var created = result[i].created;
            var createdUnixTime = moment(created, dateFormat);
            result[i].created = createdUnixTime;

            var lastModified = result[i].lastModified;
            var lastModifiedUnixTime = moment(lastModified, dateFormat);
            result[i].lastModified = lastModifiedUnixTime;
        }

        return result;
    },
    */
});

// Agave extension of default Backbone.Model that uses Agave sync
// Specifically for data stored with the Tapis (Agave) metadata API
// This uses the paginated collection so all records can be retrieved
//Agave.MetadataCollection = Agave.PaginatedCollection.extend({
Agave.MetadataCollection = Agave.Collection.extend({
    initialize: function(models, parameters) {
        Agave.Collection.prototype.initialize.apply(this, [models, parameters]);

        if (parameters && parameters.projectUuid) {
            this.projectUuid = parameters.projectUuid;
        }
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,

    //sync: Backbone.RetrySync,
    sync: Agave.sync,
    getSaveUrl: function() {
        return '/meta/v2/data/' + this.get('uuid');
    },
    parse: function(response) {
        if (response.status === 'success' && response.result) {
            // assign project uuid to objects
            if (this.projectUuid)
                for (let i = 0; i < response.result.length; ++i) {
                    let obj = response.result[i];
                    if (obj['associationIds'] && obj['associationIds'].includes(this.projectUuid))
                        obj.projectUuid = this.projectUuid;
                }
            return response.result;
        }
        return response;
    },

    // clones both the collection and the models within
    getClonedCollection: function() {

        var newCollection = this.clone();
        newCollection.reset();

        for (var i = 0; i < this.length; i++) {
            var model = this.at(i);
            var m = model.deepClone();
            newCollection.add(m);
        }

        return newCollection;
    },

    // models in this collection that do not exist in given collection
    getMissingModels: function(checkCollection) {

        var newCollection = [];

        for (var i = 0; i < this.length; i++) {
            var model = this.at(i);
            var m = checkCollection.get(model.get('uuid'));
            if (!m) newCollection.push(model);
        }

        return newCollection;
    },

    // unique values used by filters
    getAllUniqueValues(field) {
        let values = [];

        // loop through the models and collect unique values
        for (let i = 0; i < this.length; ++i) {
            var model = this.at(i);
            let obj = model.getValuesForField(field);
            if (!obj) continue;
            if (Array.isArray(obj))
                for (let j = 0; j < obj.length; ++j)
                    model.addUniqueValue(values, obj[j]);
            else
                model.addUniqueValue(values, obj);
        }
        return values;
    },

    // apply filters to generate a new collection
    filterCollection(filters) {
        var filtered = this.clone();
        filtered.reset();
//        var filtered = new RepertoireCollection({projectUuid: this.projectUuid});

        var fts_fields = [];
        if (filters['full_text_search']) fts_fields = filters['full_text_search'].toLowerCase().split(/\s+/);

        for (var i = 0; i < this.length; ++i) {
            var valid = true;
            var model = this.at(i);

            // apply full text search
            if (!model.get('full_text')) {
                var text = model.generateFullText(model['attributes']);
                model.set('full_text', text.toLowerCase());
            }
            for (var j = 0; j < fts_fields.length; ++j) {
                var result = model.get('full_text').indexOf(fts_fields[j]);
                if (result < 0) {
                    valid = false;
                    break;
                }
            }

            // apply individual filters
            for (var j = 0; j < filters['filters'].length; ++j) {
                var f = filters['filters'][j];
                var value = model.getValuesForField(f['field']);
                // handle ontologies versus regular values
                if (f['object']) {
                    if (f['object'] == 'null' && value == null) continue;
                    if (value == null) { valid = false; break; }
                    if (Array.isArray(value)) {
                        // if array then value only needs to be found once
                        let found = false;
                        for (let k = 0; k < value.length; ++k) {
                            if (value[k]['id'] == f['object']) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            valid = false;
                            break;
                        }
                    } else {
                        if (value['id'] != f['object']) {
                            valid = false;
                            break;
                        }
                    }
                } else {
                    // if filter value is null, skip
                    if (f['value'] == null) continue;

                    if (f['value'] == 'null' && value == null) continue;
                    if (value == null) { valid = false; break; }
                    if (Array.isArray(value)) {
                        // if array then value only needs to be found once
                        let found = false;
                        for (let k = 0; k < value.length; ++k) {
                            if (value[k] == f['value']) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            valid = false;
                            break;
                        }
                    } else {
                        if (value != f['value']) {
                            valid = false;
                            break;
                        }
                    }
                }
            }

            if (valid) filtered.add(model);
        }

        return filtered;
    },

});

// Job metadata for Tapis (Agave) is similar to the metadata API, but custom
// so create a custom model for it.
Agave.JobModel = Agave.Model.extend({
    defaults: {
        appId: '',
        archive: true,
        //archive: false,
        archivePath: '',
        archiveSystem: EnvironmentConfig.agave.systems.storage.corral.hostname,
        batchQueue: 'normal',
        executionSystem: EnvironmentConfig.agave.systems.execution.ls5.hostname,
        //id: 0,
        inputs: {},
        totalFileSize: 0,
        maxRunTime: '48:00:00',
        //memoryPerNode: '1',
        name: '',
        nodeCount: 1,
        //notifications: [],
        parameters: {},
        //processorsPerNode: 12,
    },
    initialize: function() {
        this.archivePathDateFormat = 'YYYY-MM-DD-HH-mm-ss-SS';
        this.inputParameterName = 'files';

        //this.retrySyncEngine = Agave.PutOverrideSync;
        //this.retrySyncLimit = 1;
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: function() {
        return '/jobs/queue';
    },
    submitJob: function(projectUuid) {

        var data = {};
        data.config = this.toJSON();
        data.projectUuid = projectUuid;

        // clean schema
        delete data.config.executionSystem;
        delete data.config.totalFileSize;
        delete data.config.appName;

        var jqxhr = $.ajax({
            headers: Backbone.Agave.basicAuthHeader(),
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: EnvironmentConfig.vdjApi.hostname + '/jobs/queue',
        });

        return jqxhr;
    },
    configureExecutionHost: function(systems) {

        this._configureExecutionHostForFileSize();

        var jobExecutionSystemHostname = this.get('executionSystem');
        var isSmallSystem = systems.isSmallExecutionSystem(jobExecutionSystemHostname);

        if (isSmallSystem) {
            // TODO: failover for small systems
            this.unset('maxRunTime');
            this.unset('nodeCount');
            this.unset('processorsPerNode');
        } else {
            // allow for failover for large systems
            var systemName = systems.getLargeExecutionSystem();
            var appName = this.get('appName');

            this.set({
                'appId': EnvironmentConfig.agave.systems.execution[systemName].apps[appName],
                'executionSystem': EnvironmentConfig.agave.systems.execution[systemName].hostname,
                'batchQueue': EnvironmentConfig.agave.systems.execution[systemName].batchQueue,
                'processorsPerNode': EnvironmentConfig.agave.systems.execution[systemName].maxProcessorsPerNode * this.get('nodeCount'),
            });
        }
    },

    // Private Methods
    _setArchivePath: function(projectUuid) {
        var archivePath = '/projects'
                        + '/' + projectUuid
                        + '/analyses'
                        + '/' + moment().format(this.archivePathDateFormat) + '-' + this._getDirectorySafeName(this.get('name'))
                        ;

        this.set('archivePath', archivePath);
    },
    _getDirectorySafeName: function(name) {
        return name.replace(/\s/g, '-').toLowerCase();
    },
    _getRelativeArchivePath: function() {
        var fullArchivePath = this.get('archivePath');
        var archivePathSplit = fullArchivePath.split('/');
        var relativeArchivePath = archivePathSplit.pop();

        return relativeArchivePath;
    },
    _createArchivePathDirectory: function(projectUuid) {

        var relativeArchivePath = this._getRelativeArchivePath();

        var jqxhr = Agave.ajax({
            data:   'action=mkdir&path=' + relativeArchivePath,
            headers: Backbone.Agave.oauthHeader(),
            type:   'PUT',
            url:    EnvironmentConfig.agave.hostname
                    + '/files/v2/media/system'
                    + '/' + EnvironmentConfig.agave.systems.storage.corral.hostname
                    + '//projects'
                    + '/' + projectUuid
                    + '/analyses',
        });

        return jqxhr;
    },
    _createJobMetadata: function(projectUuid) {
        var jqxhr = $.ajax({
            headers: Backbone.Agave.basicAuthHeader(),
            type: 'POST',
            data: JSON.stringify({
                projectUuid: projectUuid,
                jobUuid: this.get('id'),
            }),
            contentType: 'application/json',
            url: EnvironmentConfig.vdjApi.hostname + '/jobs/metadata',
        });

        return jqxhr;
    },
    /* not used
    _shareJobWithProjectMembers: function(projectUuid) {
        var jqxhr = $.ajax({
            headers: Backbone.Agave.basicAuthHeader(),
            type: 'POST',
            data: JSON.stringify({
                projectUuid: projectUuid,
                jobUuid: this.get('id'),
            }),
            contentType: 'application/json',
            url: EnvironmentConfig.vdjApi.hostname + '/permissions/jobs',
        });

        return jqxhr;
    }, */
    _setFilesParameter: function(fileMetadatas) {

        var filePaths = [];
        for (var i = 0; i < fileMetadatas.models.length; i++) {

            var fileMetadata = fileMetadatas.at(i);

            filePaths.push(
                'agave://' + EnvironmentConfig.agave.systems.storage.corral.hostname
                + '/' + fileMetadata.getFilePath()
            );
        }

        filePaths = filePaths.join(';');

        var inputParameters = {};
        inputParameters[this.inputParameterName] = filePaths;

        this.set('inputs', inputParameters);
    },
    _getTranslatedFilePaths: function(fileMetadatas) {

        var filePaths = [];
        for (var i = 0; i < fileMetadatas.models.length; i++) {

            var fileMetadata = fileMetadatas.at(i);

            filePaths.push(
                'agave://' + EnvironmentConfig.agave.systems.storage.corral.hostname
                + '/' + fileMetadata.getFilePath()
            );
        }

        return filePaths;
    },
    _getTranslatedFilePath: function(fileName, fileMetadatas) {

        var fileMeta = _.filter(fileMetadatas.models, function(fileMetadata) {
              return fileMetadata.get('value').name == fileName;
            });

        return 'agave://' + EnvironmentConfig.agave.systems.storage.corral.hostname
                + '/' + fileMeta[0].getFilePath();
    },
    _getProjectJobPaths: function(projectUuid, fileMetadatas) {

        var jobPaths = new Set();
        for (var i = 0; i < fileMetadatas.models.length; i++) {

            var fileMetadata = fileMetadatas.at(i);
            if (fileMetadata.get('name') == 'projectJobFile') {
                var value = fileMetadata.get('value');
                jobPaths.add(value['relativeArchivePath']);
            }
        }

        var jobForRelativePath = function(path) {
            for (var i = 0; i < fileMetadatas.models.length; i++) {
                var fileMetadata = fileMetadatas.at(i);
                if (fileMetadata.get('name') == 'projectJobFile') {
                    var value = fileMetadata.get('value');
                    if (value['relativeArchivePath'] == path)
                        return value['jobUuid'];
                }
            }
            return null;
        };

        var filePaths = [];
        jobPaths.forEach(function(entry) {
            filePaths.push(
                'agave://' + EnvironmentConfig.agave.systems.storage.corral.hostname
                + '//projects/' + projectUuid + '/analyses/' + entry
                + '/' + jobForRelativePath(entry) + '.zip'
            );
        });

        return filePaths;
    },
    _getProjectFilesPath: function(projectUuid) {

        return 'agave://' + EnvironmentConfig.agave.systems.storage.corral.hostname
                + '//projects/' + projectUuid + '/files';
    },
    _getTranslatedProjectFilePaths: function(fileMetadatas) {

        var filePaths = [];
        for (var i = 0; i < fileMetadatas.models.length; i++) {

            var fileMetadata = fileMetadatas.at(i);
            var value = fileMetadata.get('value');

            if (fileMetadata.get('name') == 'projectFile') {
                filePaths.push(
                    'files/' + encodeURIComponent(value['name'])
                );
            } else if (fileMetadata.get('name') == 'projectJobFile') {
                filePaths.push(
                    value['relativeArchivePath'] + '/' + encodeURIComponent(value['name'])
                );
            }
        }

        return filePaths;
    },
    _getTranslatedProjectFilePath: function(fileName, fileMetadatas) {

        var fileMeta = _.filter(fileMetadatas.models, function(fileMetadata) {
              return fileMetadata.get('value').name == fileName;
            });

        var value = fileMeta[0].get('value');
        if (fileMeta[0].get('name') == 'projectFile')
            return 'files/' + encodeURIComponent(value['name']);
        if (fileMeta[0].get('name') == 'projectJobFile')
            return value['relativeArchivePath'] + '/' + encodeURIComponent(value['name']);
        return undefined;
    },
    _getProjectFileUuids: function(fileMetadatas) {

        var filePaths = [];
        for (var i = 0; i < fileMetadatas.models.length; i++) {

            var fileMetadata = fileMetadatas.at(i);
            var value = fileMetadata.get('value');

            filePaths.push(fileMetadata.get('uuid'));
        }

        return filePaths;
    },
    _getProjectFileUuid: function(fileName, fileMetadatas) {

        var fileMeta = _.filter(fileMetadatas.models, function(fileMetadata) {
              return fileMetadata.get('value').name == fileName;
            });

        return fileMeta[0].get('uuid');
    },
    _configureExecutionHostForFileSize: function() {

        var fileSize = this.get('totalFileSize');
        var executionLevels = EnvironmentConfig.agave.systems.executionLevels;
        var appName = this.get('appName');

        // not defined, use the defaults
        if (fileSize === undefined) return;
        if (executionLevels === undefined) return;
        if (appName === undefined) return;
        if (EnvironmentConfig.agave.systems.nodeCount[appName])
            this.set('nodeCount', EnvironmentConfig.agave.systems.nodeCount[appName]);

        var levelList = executionLevels[appName];
        if (levelList === undefined) return;

        // find lowest level for the file sizes
        for (var i = 0; i < levelList.length; ++i) {
            var level = levelList[i];
            if (fileSize <= level['inputSize']) {
                var executionSystem = EnvironmentConfig.agave.systems.executionSystemPreference[0];
                if (level['system'] == 'small')
                    executionSystem = EnvironmentConfig.agave.systems.smallExecutionSystemPreference[0];

                this.set({
                    'appId': EnvironmentConfig.agave.systems.execution[executionSystem].apps[appName],
                    'executionSystem': EnvironmentConfig.agave.systems.execution[executionSystem].hostname,
                    'maxRunTime': level['time'],
                });
                if (level['nodeCount']) this.set('nodeCount', level['nodeCount']);

                break;
            }
        }
    },

});

// job history is not normal Agave metadata
Agave.JobHistory = Agave.Model.extend({
    initialize: function(parameters) {
        Backbone.Agave.Model.prototype.initialize.apply(this, [parameters]);

        if (parameters && parameters.jobUuid) {
            this.jobUuid = parameters.jobUuid;
        }

        //this.retrySyncEngine = Agave.sync;
        //this.retrySyncLimit = 1;
    },
    //apiHost: EnvironmentConfig.agave.hostname,
    authType: 'oauth',
    //sync: Backbone.RetrySync,
    sync: Agave.sync,
    requiresAuth: true,
    url: function() {
        return '/jobs/v2/' + this.jobUuid + '/history';
    },
    parse: function(response) {
        // override Backbone.Agave.Model to return full response
        return response;
    },
});

//
// Authentication token management
//
// We have this embedded here as the app will not normally
// create/manipulate this object. The authentication token is stored
// globally and managed automatically for web requests.
//

// Required Auth package
var Auth = Agave.Auth = {};

Auth.Token = Agave.Model.extend({
    idAttribute: 'refresh_token',
    defaults: {
        'token_type': null,
        'expires_in': 0,
        'expires':    0,
        'refresh_token': null,
        'access_token':  null,
    },
    apiHost: EnvironmentConfig.vdjApi.hostname,
    url: '/token',
    sync: function(method, model, options) {

        var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();

        // Credentials for Basic Authentication
        // Use credentials provided in options first; otherwise used current session creds.
        var username = options.username || (agaveToken ? agaveToken.get('username') : '');
        var password;

        switch (method) {

            case 'create':
                options.type = 'POST';
                password = encodeURIComponent(options.password);
                break;

            case 'update':
                options.type = 'PUT';
                password = agaveToken.get('refresh_token');
                break;

            case 'delete':
                return false;
        }

        options.url = EnvironmentConfig.vdjApi.hostname + '/token',

        options.headers = {
            'Authorization': 'Basic ' + btoa(username + ':' + password),
        };

        // Prevent backbone from adding the password to the url
        delete options.password;

        return Backbone.sync(method, model, options);
    },
    parse: function(response) {

        if (response && response.status === 'success') {

            // Convert human readable dates to unix time

            this.isFetched = true;

            response.result['access_token']['expires'] = response.result['access_token']['expires_in'] + (Date.now() / 1000);
            return response.result['access_token'];
        }

        return;
    },
    isActive: function() {

        var expires = this.get('expires');
        var hasError = false;

        if (!expires) {
            hasError = true;
        }

        if (expires && (Math.max(0, expires - (Date.now() / 1000)) <= 0)) {
            hasError = true;
        }

        if (!hasError) {
            return true;
        }
        else {
            return false;
        }
    },
    isAdmin: function(user_profile) {
        if (!user_profile) return false;
        if (user_profile.has_admin_role != null) return user_profile.has_admin_role;
        return false;
    },
    checkAdmin: async function(user_profile) {
        if (!user_profile) return Promise.reject(new Error('Missing user profile.'));

        return new Promise((resolve, reject) => {
            $.ajax({
                headers: Agave.oauthHeader(),
                url: EnvironmentConfig.vdjApi.hostname + '/user/has-admin-role',
                type: 'GET',
                processData: false,
                contentType: 'application/json',
                success: function (data) {
                    user_profile.has_admin_role = true;
                    resolve(data);
                },
                error: function (error) {
                    user_profile.has_admin_role = false;
                    resolve(error);
                },
            })
        });
    },
});

