(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var MetadataPermission = {};

    MetadataPermission = Agave.Model.extend({
        defaults: {
            uuid: '',
            permission: {
                read:  false,
                write: false
            },
            username: ''
        },
        url: function() {
            return '/meta/2.0/data/' + this.get('uuid') + '/pems/' + this.get('username');
        }
    });

    Backbone.Agave.Model.MetadataPermission = MetadataPermission;
    return MetadataPermission;
})(this);
