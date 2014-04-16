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

            var jxhr = $.ajax({
                data: {
                    projectUuid: this.uuid,
                    username: this.get('username')
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + Backbone.Agave.instance.token().get('access_token'))
                },
                type: 'POST',
                url: Backbone.Agave.vdjauthRoot + '/permissions/username'
            });

            return jxhr;
        },
        removeUserFromProject: function() {

            var jxhr = $.ajax({
                data: {
                    projectUuid: this.uuid,
                    username: this.get('username')
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(Backbone.Agave.instance.token().get('username') + ':' + Backbone.Agave.instance.token().get('access_token'))
                },
                type: 'DELETE',
                url: Backbone.Agave.vdjauthRoot + '/permissions/username'
            });

            return jxhr;
        }
    });

    Backbone.Agave.Model.Permission = Permission;
    return Permission;
})(this);
