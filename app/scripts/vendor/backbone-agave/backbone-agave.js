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
                'internalUsername': window.AGAVE_USERNAME
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

    Agave.agaveApiRoot = 'https://iplant-dev.tacc.utexas.edu/v2';
    Agave.vdjApiRoot   = 'http://localhost:8443';

    // Custom sync function to handle Agave token auth
    Agave.sync = function(method, model, options) {
        options.url = Agave.agaveApiRoot + (options.url || _.result(model, 'url'));

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

    // Agave extension of default Backbone.Model that uses Agave sync
    Agave.Model = Backbone.Model.extend({
        constructor: function(attributes, options) {
            if (options && options.agaveToken) {
                this.agaveToken = options.agaveToken;
            }
            Backbone.Model.apply(this, arguments);
        },
        sync: Agave.sync,
        requiresAuth: true,
        parse: function(resp) {
            if (resp.result) {
                return resp.result;
            }
            return resp;
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
        sync: Agave.sync,
        requiresAuth: true,
        parse: function(resp) {
            if (resp.result) {
                return resp.result;
            }
            return resp;
        }
    });

    // Required Auth package
    var Auth = Agave.Auth = {};

    Auth.Token = Backbone.Model.extend({
        defaults: {
            'token':    null,
            'username': null,
            'created':  null,
            'expires':  null,
            'renewed':  null,
            'internalUsername': null,
            'remainingUses':    null
        },
        idAttribute: 'token',

        sync: function(method, model, options) {

            // Credentials for Basic Authentication
            var username;
            var password;

            console.log('syncing agave token model');

            if (method === 'create') {

                console.log('method is create');
                options.url = Agave.vdjApiRoot + '/token';

                username = model.get('internalUsername');
                password = options.password;
            }
            else if (method === 'update') {

                console.log('method is update');
                options.url = Agave.vdjApiRoot + '/token'
                                               + '/' + model.get('token');

                username = model.get('internalUsername');
                password = options.password;
            }
            else {

                console.log('method is other');
                options.url = Agave.agaveApiRoot + '/auth'
                                                 + '/tokens'
                                                 + '/' + model.get('token');

                username = model.get('username');
                password = model.get('token');
            }

            options.beforeSend = function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password));
            };


            console.log('method is: '   + JSON.stringify(method));
            console.log('model is: '    + JSON.stringify(model));
            console.log('options are: '  + JSON.stringify(model));

            // Call default sync
            return Backbone.sync(method, model, options);
        },
        parse: function(response) {

            console.log('response is: ' + JSON.stringify(response));

            if (response && response.status === 'success') {

                // Convert human readable dates to unix time
                response.result.expires = moment(response.result.expires).unix();
                response.result.created = moment(response.result.created).unix();
                response.result.renewed = moment(response.result.renewed).unix();

                return response.result;
            }
        },
        validate: function(attrs, options) {

            var errors = {};
            options = _.extend({}, options);


            if (! attrs.internalUsername) {
                console.log('token expire 1');
                errors.username = 'Username is required';
            }
            if (!(attrs.token || options.token || options.password)) {
                console.log('token expire 2');
                errors.token = 'A Token or Password is required';
            }
            if (attrs.expires && (attrs.expires * 1000 - Date.now() <= 0))
            {
                console.log('token expire 3');
                errors.expires = 'Token is expired';
            }

            if (! _.isEmpty(errors)) {
                console.log('token expire 4');
                return errors;
            }

        },
        expiresIn: function() {
            return Math.max(0, this.get('expires') * 1000 - Date.now());
        },
        getBase64: function() {
            return btoa(this.get('username') + ':' + this.id);
        }
    }),
/*
    Auth.ActiveTokens = Agave.Collection.extend({
        model: Auth.Token,
        url: '/auth-v1/list',
        comparator: function(token) {
                return -token.get('created');
        }
    });
*/
    Backbone.Agave = Agave;

    return Agave;
})(this);
