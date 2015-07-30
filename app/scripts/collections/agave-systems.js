define(['backbone'], function(Backbone) {

    'use strict';

    var Systems = {};

    Systems = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.System,
        url: function() {
            return '/systems/v2/';
        },
    });

    Backbone.Agave.Collection.Systems = Systems;
    return Systems;
});
