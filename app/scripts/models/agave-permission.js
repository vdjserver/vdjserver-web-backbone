(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var Permission = {};

    Permission = Backbone.Agave.Model.extend({
        defaults: {
            username:   '',
            permission: ''
        },
        idAttribute: 'username',
        initialize: function(attributes) {

            if (this.attributes.uuid) {
                console.log("past if ok");
                this.uuid = this.attributes.uuid;
                delete this.attributes.uuid;
            }

            return attributes;
        },
        setUuid: function(uuid) {
            this.uuid = uuid;
        },
        url: function() {
            return '/meta/v2/data/' + this.uuid + '/pems/' + this.get('username');
        },
        sync: function(method, model, options) {

            switch (method) {

                case 'create':
                    options.type = 'POST';
                    break;

                case 'update':
                    options.type = 'POST';
                    break;

            }

            return Backbone.Agave.sync(method, model, options);
        }
    });

    Backbone.Agave.Model.Permission = Permission;
    return Permission;
})(this);
