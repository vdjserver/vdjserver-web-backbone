/**
  * Backbone VDJ
  * Version 0.0.1
  *
  */
(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    var Agave = Backbone.Agave;
    var $ = window.$;
    var _ = window._;
    var Vdj = {};


    // Custom sync function to handle Agave token auth
    Vdj.sync = function(method, model, options) {
        options.url = model.apiRoot + (options.url || _.result(model, 'url'));

        if (model.requiresAuth) {
            var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();

            // Credentials for Basic Authentication
            // Use credentials provided in options first; otherwise used current session creds.
            var username = options.username || (agaveToken ? agaveToken.get('internalUsername') : '');
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

    Vdj.Model = Agave.Model.extend({
        apiRoot: Agave.vdjApiRoot,
        sync: Vdj.sync
    });

    Vdj.Collection = Agave.Collection.extend({
        apiRoot: Agave.vdjApiRoot,
        sync: Vdj.sync
    });

    Backbone.Vdj = Vdj;
    return Vdj;

})(this);
