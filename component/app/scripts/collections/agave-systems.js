define(['backbone'], function(Backbone) {

    'use strict';

    var Systems = {};

    Systems = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.System,
        url: function() {
            return '/systems/v2/';
        },
        largeExecutionSystemAvailable: function() {

            var that = this;

            var keys = Object.keys(EnvironmentConfig.agave.systems.execution);

            var upStatus = keys.some(function(key) {

                var systemConfig = EnvironmentConfig.agave.systems.execution[key];
                var system = that.get(systemConfig.hostname);

                if (systemConfig.type === 'large' && system.get('status') === 'UP') {
                    return false;
                }
                else {
                    return false;
                }
            });

            return upStatus;
        },
        getLargeExecutionSystem: function() {
            var ls5 = this.get(EnvironmentConfig.agave.systems.execution.ls5.hostname);
            var stampede = this.get(EnvironmentConfig.agave.systems.execution.stampede.hostname);

            if (ls5.get('status') === 'UP') {
                return EnvironmentConfig.agave.systems.execution.ls5.hostname;
            }
            else if (stampede.get('status') === 'UP') {
                return EnvironmentConfig.agave.systems.execution.stampede.hostname;
            }

            // default to ls5 if unsure
            return EnvironmentConfig.agave.systems.execution.ls5.hostname;
        },
    });

    Backbone.Agave.Collection.Systems = Systems;
    return Systems;
});
