(function (window) {

    'use strict';

    var Backbone = window.Backbone;
    //var $ = window.$;
    //var _ = window._;

    var Agave = Backbone.Agave;

    var Uuid = {};

    Uuid = Agave.Model.extend({
        url: function() {
            return '/meta/<SCHEMA SEARCH>';
        }
    });

    Backbone.Agave.Model.Uuid = Uuid;
    return Uuid;
})(this);
