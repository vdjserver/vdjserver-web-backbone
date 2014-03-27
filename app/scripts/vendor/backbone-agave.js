/**
  * Backbone Agave
  * Version 0.1
  *
  */
(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    var _ = window._;

    var Agave = function(options) {

        var defaults = _.extend({primary: true}, options),
            token = this._token = new Agave.Auth.Token({});

        this.listenTo(token, 'change', function() {
            this.trigger('Agave:tokenChanged');
        }, this);

        this.listenTo(token, 'destroy', function() {
            this.token().clear();
            this.trigger('Agave:tokenDestroy');
        });

        if (defaults.token) {
            this.token(defaults.token);
        }

        // look for token in global variable
        else if (window.AGAVE_TOKEN && window.AGAVE_USERNAME) {
            this.setToken({
                'token': window.AGAVE_TOKEN,
                'username': window.AGAVE_USERNAME
            });
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
        }
    });

    Agave.apiRoot     = EnvironmentConfig.agaveRoot;
    Agave.vdjauthRoot = EnvironmentConfig.vdjauthRoot;

    Agave.sync = function(method, model, options) {
        
        var apiRoot = model.apiRoot
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

        // Call default sync
        return Backbone.sync(method, model, options);
    };


    // This is a complete replacement for backbone.sync
    // and is mostly the same as that whenever possible
    Agave.MetadataSync = function(method, model, options) {

        if (method === 'update') {
            method = 'create';
        }

        return Agave.sync(method, model, options);
    };

    Agave.fileSync = function(method, model, options) {

        if (method !== 'create' && method !== 'update') {
            return Agave.sync(method, model, options);
        }
        else {
            var url = model.apiRoot + (options.url || _.result(model, 'url'));
            var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();

            var formData = new FormData();
            formData.append('fileToUpload', model.get('fileReference'));

            var xhr = options.xhr || new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Authorization', 'Bearer ' + agaveToken.get('access_token'));


            // Listen to the upload progress.
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    var uploadProgress = (e.loaded / e.total) * 100;
                    model.trigger('uploadProgress', uploadProgress);
                }
            };

/*
            xhr.upload.addEventListener('error', function(e) {
                console.log("file error");
            });

            xhr.upload.addEventListener('abort', function(e) {
                console.log("file aborted");
            });

            xhr.upload.addEventListener('load', function(e) {
                console.log("file complete");
            });
*/

            xhr.upload.addEventListener('loadend', function(e) {
                model.trigger('uploadComplete');
            });

            xhr.send(formData);
            return xhr;
        }
    };

    // Agave extension of default Backbone.Model that uses Agave sync
    Agave.Model = Backbone.Model.extend({
        constructor: function(attributes, options) {
            if (options && options.agaveToken) {
                this.agaveToken = options.agaveToken;
            }
            Backbone.Model.apply(this, arguments);
        },
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
        constructor: function(attributes, options) {
            if (options && options.agaveToken) {
                this.agaveToken = options.agaveToken;
            }
            Backbone.Collection.apply(this, arguments);
        },
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

    Agave.FileModel = Agave.Model.extend({
        sync: Agave.fileSync
    });

    Agave.MetadataModel = Agave.Model.extend({
        constructor: function(attributes, options) {
            if (options && options.agaveToken) {
                this.agaveToken = options.agaveToken;
            }
            else {
                this.agaveToken = Agave.instance.token();
            }

            Backbone.Model.apply(this, arguments);
        },
        idAttribute: 'uuid',
        defaults: {
            uuid: '',
            name: '',
            value: {},
            created: '',
            lastUpdated: ''
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
            };

            return result;
        }
    });

    // Agave extension of default Backbone.Model that uses Agave sync
    Agave.MetadataCollection = Agave.Collection.extend({
        constructor: function(attributes, options) {
            if (options && options.agaveToken) {
                this.agaveToken = options.agaveToken;
            }
            else {
                this.agaveToken = Agave.instance.token();
            }

            Backbone.Collection.apply(this, arguments);
        },
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


    // Required Auth package
    var Auth = Agave.Auth = {};

    Auth.Token = Agave.Model.extend({
        idAttribute: 'refresh_token',
        defaults: {
            'token_type': null,
            'expires_in': null,
            'expires':    0,
            'refresh_token': null,
            'access_token':  null,
        },
        apiRoot: Agave.vdjauthRoot,
        url: '/token',
        sync: function(method, model, options) {

            options.url = model.apiRoot + (options.url || _.result(model, 'url'));
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
                    options.url = model.url + '/' + model.get('refresh_token');
                    options.type = 'PUT';
                    password = agaveToken.get('refresh_token');
                    break;

                case 'delete':
                    options.url = model.url + '/' + model.get('access_token');
                    options.type = 'DELETE';
                    password = agaveToken.get('access_token');
                    break;
            }

            // Allow user-provided before send, but protect ours, too.
            if (options.beforeSend) {
                options._beforeSend = options.beforeSend;
            }

            options.beforeSend = function(xhr) {
                if (options._beforeSend) {
                    options._beforeSend(xhr);
                }
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
            };

            // Call default sync
            return Backbone.sync(method, model, options);
        },
        parse: function(response) {

            if (response && response.status === 'success') {

                // Convert human readable dates to unix time

                this.isFetched = true;

                response.result.expires = response.result.expires_in + (Date.now() / 1000);
                return response.result;
            }

            return;
        },
        isActive: function() {

            var expires = this.get('expires');
            var errors = {};

            if (!expires) {
                errors.expires = true;
            }
            else if (expires && (expires - (Date.now() / 1000) <= 0)) {
                errors.expires = true;
            }

            if (! _.isEmpty(errors)) {
                console.log('token expired');
                return false;
            }
            else {
                return true;
            }
        },
        expiresIn: function() {
            console.log("expiresIn check 1 is: " + this.get('expires'));
            console.log("expiresIn check is: " + Math.max(0, this.get('expires') - (Date.now() / 1000)));
            return Math.max(0, this.get('expires') - (Date.now() / 1000));
        },
        getBase64: function() {
            return btoa(this.get('username') + ':' + this.token);
        }
    }),

    Backbone.Agave = Agave;
    return Agave;

})(this);
