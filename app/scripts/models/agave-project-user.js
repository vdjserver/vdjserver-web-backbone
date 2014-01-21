(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var ProjectUser = {};

    ProjectUser = Backbone.Agave.Model.extend({
        defaults: {
            uuid: '',
            permission: {
                read:  false,
                write: false
            },
            username: ''
        },
        url: function() {
            return '/meta/v2/data/' + this.get('uuid') + '/pems/' + this.get('username');
        }
    });

    Backbone.Agave.Model.ProjectUser = ProjectUser;
    return ProjectUser;
})(this);
