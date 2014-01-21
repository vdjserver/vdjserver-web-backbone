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
        url: function() {
            return '/meta/v2/data/' + this.get('uuid') + '/pems/' + this.get('username');
        },
        sync: function(method, model, options) {
            
            options.emulateHTTP = true;
            return Backbone.Agave.sync(method, model, options);
        }
    });

    Backbone.Agave.Model.ProjectUser = ProjectUser;
    return ProjectUser;
})(this);
