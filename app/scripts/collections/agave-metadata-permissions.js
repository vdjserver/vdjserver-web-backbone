(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var MetadataPermissions = {};

    MetadataPermissions = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.MetadataPermission,
        url: function() {
            //return '/meta/v2/data?q=' + encodeURIComponent('{"owner":' + '"' + this.agaveToken.get('username') + '","name":"project"}');
        }
    });

    Backbone.Agave.Collection.MetadataPermissions = MetadataPermissions;
    return MetadataPermissions;
})(this);
