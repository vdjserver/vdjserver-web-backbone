(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var MetadataPermissions = {};

    MetadataPermissions = Agave.MetadataCollection.extend({
        model: Agave.Model.MetadataPermission,
        url: function() {
            //return '/meta/2.0/data?q=' + encodeURIComponent('{"owner":' + '"' + this.agaveToken.get('username') + '","name":"project"}');
        }
    });

    Backbone.Agave.Collection.MetadataPermissions = MetadataPermissions;
    return MetadataPermissions;
})(this);
