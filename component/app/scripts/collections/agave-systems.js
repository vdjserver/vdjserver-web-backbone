define(['backbone'], function(Backbone) {

    'use strict';

    var Systems = {};

    Systems = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.System,
        url: function() {
            return '/systems/v2/';
        },
        largeExecutionSystemAvailable: function() {

            var ls5 = this.get(EnvironmentConfig.agave.executionSystems.ls5);
            var stampede = this.get(EnvironmentConfig.agave.executionSystems.stampede);

            if (ls5.get('status') === 'UP' || stampede.get('status') === 'UP') {
                return true;
            }
            else {
                return false;
            }
        },
        getLargeExecutionSystem: function() {
            var ls5 = this.get(EnvironmentConfig.agave.executionSystems.ls5);
            var stampede = this.get(EnvironmentConfig.agave.executionSystems.stampede);

            if (ls5.get('status') === 'UP') {
                return EnvironmentConfig.agave.executionSystems.ls5;
            }
            else if (stampede.get('status') === 'UP') {
                return EnvironmentConfig.agave.executionSystems.stampede;
            }

            // default to ls5 if unsure
            return EnvironmentConfig.agave.executionSystems.ls5;
        },
    });

    Backbone.Agave.Collection.Systems = Systems;
    return Systems;
});
