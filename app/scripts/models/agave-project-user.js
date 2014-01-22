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

    Backbone.Agave.Model.ProjectUser = ProjectUser;
    return ProjectUser;
})(this);
