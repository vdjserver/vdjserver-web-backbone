define([
    'backbone',
    'environment-config',
], function(
    Backbone,
    EnvironmentConfig
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

    Agave.apiRoot     = EnvironmentConfig.agaveRoot;
    Agave.vdjauthRoot = EnvironmentConfig.vdjauthRoot;

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
        apiRoot: Agave.apiRoot,
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
        apiRoot: Agave.apiRoot,
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
        apiRoot: Agave.vdjauthRoot,
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

            options.url = Backbone.Agave.vdjauthRoot + '/token',

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
        expiresIn: function() {
            return Math.max(0, this.get('expires') - (Date.now() / 1000));
        }
    }),

    Backbone.Agave = Agave;
    return Agave;
});
