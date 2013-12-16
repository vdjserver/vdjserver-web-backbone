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

    Agave.apiRoot    = 'https://agave.iplantc.org';
    Agave.authRoot   = 'http://localhost:8443';
    Agave.vdjApiRoot = 'http://localhost:8443';

    // Custom sync function to handle Agave token auth
    Agave.tokenSync = function(method, model, options) {
        options.url = model.apiRoot + (options.url || _.result(model, 'url'));

        if (model.requiresAuth) {
            var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();

            // Credentials for Basic Authentication
            // Use credentials provided in options first; otherwise used current session creds.
            var username = options.username || (agaveToken ? agaveToken.get('username') : '');
            var password = options.password || (agaveToken ? agaveToken.id : '');

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
        }

        // Call default sync
        return Backbone.sync(method, model, options);
    };

    Agave.sync = function(method, model, options) {
        options.url = model.apiRoot + (options.url || _.result(model, 'url'));

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
    Agave.metadataSync = function(method, model, options) {

        options.url = model.apiRoot + (options.url || _.result(model, 'url'));

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




        options.emulateJSON = true;


        // Begin mostly original backbone sync method


        // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
        var methodMap = {
            //'create': 'POST',
            //'update': 'PUT',
            //'patch':  'PATCH',
            //'delete': 'DELETE',
            //'read':   'GET'

            'create': 'POST',
            'update': 'POST',
            'patch':  'PATCH',
            'delete': 'DELETE',
            'read':   'GET'
        };

        var type = methodMap[method];

        // Default options, unless specified.
        _.defaults(options || (options = {}), {
            emulateHTTP: Backbone.emulateHTTP,
            emulateJSON: Backbone.emulateJSON
        });

        // Default JSON-request options.
        var params = {type: type, dataType: 'json'};

        // Ensure that we have a URL.
        if (!options.url) {
            params.url = _.result(model, 'url');
        }

        // Ensure that we have the appropriate request data.
        if (options.data === (null || undefined) && model && (method === 'create' || method === 'update' || method === 'patch')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(options.attrs || model.toJSON(options));
        }

        if (type === 'GET') {

            if (params.data) {
                params.data = JSON.parse(params.data);
                params.data = {
                    'uuid': params.data.uuid,
                    'name': params.data.name,
                    'value': JSON.stringify(params.data.value)
                };
            }
        }
        else if (type === 'POST') {

            if (params.data) {
                params.data = JSON.parse(params.data);
                params.data = {
                    'name': params.data.name,
                    'value': JSON.stringify(params.data.value)
                };
            }
        }




        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (options.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? params.data : {}; // AGAVE NOTE TO SELF: change this line
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {

            params.type = 'POST';

            if (options.emulateJSON) {
                params.data._method = type;
            }

            var beforeSend = options.beforeSend;
            options.beforeSend = function(xhr) {
                xhr.setRequestHeader('X-HTTP-Method-Override', type);
                if (beforeSend) {
                    return beforeSend.apply(this, arguments);
                }
            };
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !options.emulateJSON) {
            params.processData = false;
        }


        // Make the request, allowing the user to override any Ajax options.
        var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
        model.trigger('request', model, xhr, options);
        return xhr;
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
        defaults: {
            uuid: '',
            name: '',
            value: {},
            created: '',
            lastUpdated: ''
        },
        sync: Agave.metadataSync,
        getSaveUrl: function() {
            return '/meta/2.0/data/' + this.get('uuid');
        },
        getCreateUrl: function() {
            return '/meta/2.0/data';
        },
        parse: function(response) {

            console.log('model parse running');

            if (response.status === 'success' && response.result) {

                //console.log("result is: " + JSON.stringify(response));

                response.result = this.parseDate(response.result);
                console.log("result after is: " + JSON.stringify(response));

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

                console.log("loop running: " + result[i].lastModified);
            };

            console.log("parseDate result is: " + JSON.stringify(result));

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
        sync: Agave.metadataSync,
        getSaveUrl: function() {
            return '/meta/2.0/data/' + this.get('uuid');
        },
        parse: function(response) {
            if (response.status === 'success' && response.result) {
                return response.result;
            }
            return response;
        }
    });

console.log("date is: " + Date.now());

    // Required Auth package
    var Auth = Agave.Auth = {};

    Auth.Token = Agave.Model.extend({
        defaults: {
            'token_type': null,
            'expires_in': null,
            'expires':    0,
            'refresh_token': null,
            'access_token':  null,
        },
        idAttribute: 'refresh_token',
        apiRoot: Agave.authRoot,
        url: '/token',
        requiresAuth: true,
        sync: function(method, model, options) {

            switch (method) {

                case 'create':
                    //options.url = model.url;
                    options.type = 'POST';
                    break;

                case 'update':
                    options.url = model.url + '/' + model.get('refresh_token');
                    options.type = 'PUT';
                    break;

                case 'delete':
                    options.url = model.url + '/' + model.get('refresh_token');
                    options.type = 'DELETE';
                    break;
            }

            // Call default sync
            return Agave.tokenSync(method, model, options);
        },
        parse: function(response) {

            console.log("response is: " + JSON.stringify(response));
            if (response && response.status === 'success') {

                // Convert human readable dates to unix time
                //response.result.expires = moment(response.result.expires).unix();
                //response.result.created = moment(response.result.created).unix();
                //response.result.renewed = moment(response.result.renewed).unix();

                response.result.expires = response.result.expires_in + (Date.now() / 1000);
                console.log("resp result exp is: " + response.result.expires);
                return response.result;
            }

            return;
        },
        validate: function(attrs, options) {

            var errors = {};
            options = _.extend({}, options);

            if (attrs.expires && attrs.expires - (Date.now() / 1000) <= 0) {
                console.log('token expire 3 and attrs is: ' + JSON.stringify(attrs));
                errors.expires = 'Token is expired';
            }

            if (! _.isEmpty(errors)) {
                console.log('token expire 4');
                return errors;
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
