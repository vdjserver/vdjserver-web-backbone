(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Permissions = {};

    Permissions = Backbone.Agave.Collection.extend({
        initialize: function(parameters) {

            if (parameters && parameters.uuid) {
                this.uuid = parameters.uuid;
            }
        },
        comparator: 'username',
        model: Backbone.Agave.Model.Permission,
        url: function() {
            return '/meta/v2/data/' + this.uuid + '/pems';
        },
        parse: function(response) {

            var pems = [];

            if (response.result) {
                for (var i = 0; i < response.result.length; i++) {
                    
                    var userPems = {
                        username: response.result[i].username,
                        permission: response.result[i].permission,
                        uuid: this.uuid
                    };

                    pems.push(userPems);
                }
            }

            return pems;
        },
        getUserCount: function() {
            if (this.length === 1) {
                return 1;
            }
            else {
                return this.length - 1;
            }
        },
    });

    Backbone.Agave.Collection.Permissions = Permissions;
    return Permissions;
})(this);
