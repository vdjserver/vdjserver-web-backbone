(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var ProjectUser = {};

    ProjectUser = Backbone.Agave.Model.extend({
        defaults: {
            uuid: '',
            username: '',
            permission: 'READ_WRITE'
        },
        idAttribute: 'username',
        url: function() {
            return '/meta/v2/data/' + this.get('uuid') + '/pems/' + this.get('username');
        },
        sync: function(method, model, options) {

/*
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
*/

            if (method !== 'delete') {
                options.emulateHTTP = true;
            }



            return Backbone.Agave.sync(method, model, options);
        }
    });

    Backbone.Agave.Model.ProjectUser = ProjectUser;
    return ProjectUser;
})(this);
