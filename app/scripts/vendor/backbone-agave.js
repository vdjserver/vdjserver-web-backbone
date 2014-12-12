define([
    'backbone',
    'environment-config',
    'moment',
], function(
    Backbone,
    EnvironmentConfig,
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

        var apiRoot = model.apiRoot;
        if (options.apiRoot) {
            apiRoot = options.apiRoot;
        }

        options.url = apiRoot + (options.url || _.result(model, 'url'));

        if (model.requiresAuth) {
            var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();

            // Allow user-provided before send, but protect ours, too.
            if (options.beforeSend) {
                options._beforeSend = options.beforeSend;
            }
            options.beforeSend = function(xhr) {
                if (options._beforeSend) {
                    options._beforeSend(xhr);
                }
                xhr.setRequestHeader('Authorization', 'Bearer ' + agaveToken.get('access_token'));
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
                return Backbone.sync(method, model, options);
            }
            else if (! Agave.instance.token().isActive() && Agave.instance.token().get('refresh_token')) {

                return Agave.instance.token()
                    .save()
                    .then(function() {
                        return Backbone.sync(method, model, options);
                    })
                    .fail(function() {
                        Agave.instance.destroyToken();
                    });

            }
            else {
                var deferred = $.Deferred();

                deferred.reject(function() {
                    Agave.instance.destroyToken();
                });

                return deferred;
            }
        }
    };

    // This is a complete replacement for backbone.sync
    // and is mostly the same as that whenever possible
    Agave.MetadataSync = function(method, model, options) {

        if (method === 'update') {
            method = 'create';
        }

        return Agave.sync(method, model, options);
    };

    // Agave extension of default Backbone.Model that uses Agave sync
    Agave.Model = Backbone.Model.extend({
        apiRoot: EnvironmentConfig.agaveRoot,
        sync: Agave.sync,
        requiresAuth: true,
        parse: function(response) {
            if (response.result) {
                return response.result;
            }
            return response;
        }
    });

    // Agave extension of default Backbone.Collection that uses Agave sync
    Agave.Collection = Backbone.Collection.extend({
        apiRoot: EnvironmentConfig.agaveRoot,
        sync: Agave.sync,
        requiresAuth: true,
        parse: function(response) {
            if (response.result) {
                return response.result;
            }
            return response;
        }
    });

    Agave.MetadataModel = Agave.Model.extend({
        idAttribute: 'uuid',
        defaults: {
            uuid: '',
            name: '',
            value: {},
            created: '',
            lastUpdated: '',
        },
        sync: Agave.MetadataSync,
        getSaveUrl: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        getCreateUrl: function() {
            return '/meta/v2/data';
        },
        parse: function(response) {

            if (response.status === 'success' && response.result) {

                response.result = this.parseDate(response.result);

                if (response.result.length > 0) {

                    return response.result[0];
                }

                return response.result;
            }

            return response;
        },
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
        }
    });

    // Agave extension of default Backbone.Model that uses Agave sync
    Agave.MetadataCollection = Agave.Collection.extend({
        sync: Agave.MetadataSync,
        getSaveUrl: function() {
            return '/meta/v2/data/' + this.get('uuid');
        },
        parse: function(response) {
            if (response.status === 'success' && response.result) {
                return response.result;
            }
            return response;
        }
    });

    Agave.JobModel = Agave.Model.extend({
        defaults: {
            appId: '',
            archive: true,
            //archive: false,
            archivePath: '',
            archiveSystem: EnvironmentConfig.storageSystem,
            batchQueue: 'normal',
            //id: 0,
            inputs: {},
            maxRunTime: '24:00:00',
            //memoryPerNode: '1',
            outputPath: '',
            name: '',
            nodeCount: 1,
            //notifications: [],
            parameters: {},
            processorsPerNode: 12,
        },
        initialize: function() {
            this.archivePathDateFormat = 'YYYY-MM-DD-HH-mm-ss-SS';
            this.inputParameterName = 'files';
        },
        url: function() {
            return '/jobs/v2/';
        },
        sync: function(method, model, options) {

            switch (method) {
                case 'update':
                    options.type = 'POST';
                    break;
            }

            // Call Agave Model  sync
            return Agave.sync(method, model, options);
        },
        submitJob: function(projectUuid) {

            var that = this;

            return this._createArchivePathDirectory(projectUuid)
                .then(function() {
                    return that.save();
                })
                // Create metadata
                .then(function() {
                    return that._createJobMetadata(projectUuid);
                })
                // Share job w/ project members
                .then(function() {
                    return that._shareJobWithProjectMembers(projectUuid);
                })
                ;
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

            var jqxhr = $.ajax({
                data:   'action=mkdir&path=' + relativeArchivePath,
                headers: Backbone.Agave.oauthHeader(),
                type:   'PUT',
                url:    EnvironmentConfig.agaveRoot
                        + '/files/v2/media/system'
                        + '/' + EnvironmentConfig.storageSystem
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
                url: EnvironmentConfig.vdjauthRoot + '/jobs/metadata',
            });

            return jqxhr;
        },
        _shareJobWithProjectMembers: function(projectUuid) {
            var jqxhr = $.ajax({
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                data: JSON.stringify({
                    projectUuid: projectUuid,
                    jobUuid: this.get('id'),
                }),
                contentType: 'application/json',
                url: EnvironmentConfig.vdjauthRoot + '/permissions/jobs',
            });

            return jqxhr;
        },
        _setFilesParameter: function(fileMetadatas) {
            var tmpFileMetadatas = fileMetadatas.pluck('value');

            var filePaths = [];
            for (var i = 0; i < tmpFileMetadatas.length; i++) {
                filePaths.push(
                    'agave://' + EnvironmentConfig.storageSystem
                    + '//projects'
                    + '/' + tmpFileMetadatas[i].projectUuid
                    + '/files'
                    + '/' + tmpFileMetadatas[i].name
                );
            }

            filePaths = filePaths.join(';');

            var inputParameters = {};
            inputParameters[this.inputParameterName] = filePaths;

            this.set('inputs', inputParameters);
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
        apiRoot: EnvironmentConfig.vdjauthRoot,
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
                    password = options.password;
                    break;

                case 'update':
                    options.type = 'PUT';
                    password = agaveToken.get('refresh_token');
                    break;

                case 'delete':
                    return false;
                    break;
            }

            options.url = EnvironmentConfig.vdjauthRoot + '/token',

            options.headers = {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
            };

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

            if (! expires) {
                hasError = true;
            }

            if (expires && (Math.max(0, expires - (Date.now() / 1000)) <= 0)) {
                hasError = true;
            }

            if (! hasError) {
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
