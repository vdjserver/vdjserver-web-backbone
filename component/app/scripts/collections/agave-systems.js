define(['backbone'], function(Backbone) {

    'use strict';

    var Systems = {};

    Systems = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.System,
        url: function() {
            return '/systems/v2/';
        },
    },
    {
        checkSystemUpStatus: function(systems, systemId) {

            var systemUp = true;

            var filteredSystems = _.where(systems, {id: systemId});

            if (filteredSystems.length === 1) {
                if (filteredSystems[0].status !== 'UP') {
                    systemUp = false;
                }
            }

            return systemUp;
        },
    });

    Backbone.Agave.Collection.Systems = Systems;
    return Systems;
});
