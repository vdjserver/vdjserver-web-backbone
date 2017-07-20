define([
    'backbone',
    'moment',
    'backbone-retry-sync',
], function(
    Backbone,
    moment
) {

    'use strict';

    var Agave = function(options) {

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

    Agave.basicAuthHeader = function() {
        return {
            'Authorization': 'Basic ' + btoa(Agave.instance.token().get('username') + ':' + Agave.instance.token().get('access_token')),
        };
    };

    Agave.oauthHeader = function() {
        return {
            'Authorization': 'Bearer ' + Agave.instance.token().get('access_token'),
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
                    else {
                        xhr.setRequestHeader('Authorization', 'Basic ' + btoa(agaveToken.get('username') + ':' + agaveToken.get('access_token')));
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
            this.retrySyncEngine = Agave.sync;
            this.retrySyncLimit = 3;
            this.communityMode = false;
            if (parameters && parameters.communityMode) {
                this.communityMode = parameters.communityMode;
            }
            if (this.communityMode) {
                this.apiHost = EnvironmentConfig.vdjGuest.hostname;
                this.requiresAuth = false;
            }
        },
        apiHost: EnvironmentConfig.agave.hostname,
        authType: 'oauth',
        sync: Backbone.RetrySync,
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
        initialize: function(parameters) {
            this.retrySyncEngine = Agave.sync;
            this.retrySyncLimit = 3;
            this.communityMode = false;
            if (parameters && parameters.communityMode) {
                this.communityMode = parameters.communityMode;
            }
            if (this.communityMode) {
                this.apiHost = EnvironmentConfig.vdjGuest.hostname;
                this.requiresAuth = false;
            }
        },
        apiHost: EnvironmentConfig.agave.hostname,
        authType: 'oauth',
        sync: Backbone.RetrySync,
        requiresAuth: true,
        parse: function(response) {
            if (response.result) {
                return response.result;
            }
            return response;
        },
    });

    Agave.PaginatedCollection = Agave.Collection.extend({
        initialize: function(parameters) {
            Backbone.Agave.Collection.prototype.initialize.apply(this, [parameters]);

            this.offset = 0;
            this.limit = 100;
        },
        /*
            Fetch data in multiple smaller sets instead of one giant collection.
            This fetch method will automatically fetch an entire collection by subsets.

            This will be useful to us as VDJServer grows because it will allow us to
            scale project and project file metadata requests. It could also be
            updated for lazy loading and/or user invoked pagination.
        */
        fetch: function() {
            var that = this;

            var deferred = $.Deferred();

            var models = [];

            var offsetFetch = function() {
                // Reuse parent fetch/sync methods so we don't have to reconfigure everything all over again
                Backbone.Agave.Collection.prototype.fetch.call(that, {})
                .then(function(response) {
                    response = that.parse(response);

                    return response;
                })
                .then(function(response) {

                    // Response array has greater than 0 objects, so we'll need to fetch the next set too
                    if (response.length > 0) {

                        that.offset += response.length;

                        models = models.concat(that.reset(response));
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

    // Agave extension of default Backbone.Model that uses Agave sync
    Agave.MetadataModel = Agave.Model.extend({
        idAttribute: 'uuid',
        defaults: {
            uuid: '',
            name: '',
            value: {},
            created: '',
            lastUpdated: '',
        },
        initialize: function(parameters) {
            this.retrySyncEngine = Agave.PutOverrideSync;
            this.retrySyncLimit = 3;
            if (parameters && parameters.communityMode) {
                this.communityMode = parameters.communityMode;
            }
            if (this.communityMode) {
                this.apiHost = EnvironmentConfig.vdjGuest.hostname;
                this.requiresAuth = false;
            }
        },
        sync: Backbone.RetrySync,
        getSaveUrl: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        getCreateUrl: function() {
            return '/meta/v2/data';
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
        syncMetadataPermissionsWithProjectPermissions: function(projectUuid) {

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    uuid: this.get('uuid')
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/metadata'
            });

            return jqxhr;
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

    Agave.MetadataCollection = Agave.PaginatedCollection.extend({
        sync: Backbone.RetrySync,
        getSaveUrl: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        parse: function(response) {
            if (response.status === 'success' && response.result) {
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
                var m = model.clone();
                m.set('value', _.clone(model.get('value')));
                newCollection.add(m);
            }

            return newCollection;
        },

        // models in this collection that do not exist in given collection
        getMissingModels: function(checkCollection) {

            var newCollection = this.clone();
            newCollection.reset();

            for (var i = 0; i < this.length; i++) {
                var model = this.at(i);
                var m = checkCollection.get(model.get('uuid'));
                if (!m) newCollection.add(model);
            }

            return newCollection;
        },
    });

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
            outputPath: '',
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
            this.retrySyncLimit = 3;
        },
        apiHost: EnvironmentConfig.vdjApi.hostname,
        url: function() {
            return '/jobs/queue';
        },
        submitJob: function(projectUuid) {

            var data = {};
            data.config = this.toJSON();
            data.projectUuid = projectUuid;

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

            this.retrySyncEngine = Agave.sync;
            this.retrySyncLimit = 3;
        },
        apiHost: EnvironmentConfig.agave.hostname,
        authType: 'oauth',
        sync: Backbone.RetrySync,
        requiresAuth: true,
        url: function() {
            return '/jobs/v2/' + this.jobUuid + '/history';
        },
        parse: function(response) {
            // override Backbone.Agave.Model to return full response
            return response;
        },
    });

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
                    break;
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

                response.result.expires = response.result['expires_in'] + (Date.now() / 1000);
                return response.result;
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
    }),

    Backbone.Agave = Agave;
    return Agave;
});
