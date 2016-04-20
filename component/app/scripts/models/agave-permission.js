define(
    [
        'backbone',
    ],
function(
    Backbone
) {

    'use strict';

    var Permission = {};

    Permission = Backbone.Agave.Model.extend({
        defaults: {
            username:   '',
            permission: ''
        },
        idAttribute: 'username',
        initialize: function(attributes) {
            Backbone.Agave.Model.prototype.initialize.apply(this, [attributes]);

            if (this.attributes.uuid) {
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
        },
        addUserToProject: function() {

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: this.uuid,
                    username: this.get('username')
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'POST',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            });

            return jqxhr;
        },
        removeUserFromProject: function() {

            var jqxhr = $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    projectUuid: this.uuid,
                    username: this.get('username')
                }),
                headers: Backbone.Agave.basicAuthHeader(),
                type: 'DELETE',
                url: EnvironmentConfig.vdjApi.hostname + '/permissions/username',
            });

            return jqxhr;
        },
    });

    Backbone.Agave.Model.Permission = Permission;
    return Permission;
});
