/**
  * Backbone VDJ
  * Version 0.1
  *
  */
define(['app'], function(App){
    
    var Vdj = {};

    console.log("backbone vdj is included");

    Vdj.password = '';

    // Custom sync function for Vdj auth
    Vdj.sync = function(method, model, options) {
        options.url = Backbone.Agave.vdjApiRoot + (options.url || _.result(model, 'url'));

        if (model.requiresAuth) {
            var agaveToken = options.agaveToken || model.agaveToken || App.Agave.token();

            // Credentials for Basic Authentication
            // Use credentials provided in options first; otherwise used current session creds.
            var username = options.username || (agaveToken ? agaveToken.get('internalUsername') : '');
            var password = options.password || Vdj.password;

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
    Vdj.Model = Backbone.Model.extend({
        /*
        constructor: function(attributes, options) {
            if (options && options.agaveToken) {
                this.agaveToken = options.agaveToken;
            }
            Backbone.Model.apply(this, arguments);
        },
        */
        sync: Vdj.sync,
        requiresAuth: true,
        parse: function(resp) {
            if (resp.result) {
                return resp.result;
            }
            return resp;
        }
    });

    // Agave extension of default Backbone.Collection that uses Agave sync
    Vdj.Collection = Backbone.Collection.extend({
        constructor: function(attributes, options) {
            if (options && options.agaveToken) {
                this.agaveToken = options.agaveToken;
            }
            Backbone.Collection.apply(this, arguments);
        },
        sync: Vdj.sync,
        requiresAuth: true,
        parse: function(resp) {
            if (resp.result) {
                return resp.result;
            }
            return resp;
        }
    });

    App.Vdj = Vdj;
    return Vdj;
});
