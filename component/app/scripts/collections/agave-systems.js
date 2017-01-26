define(['backbone'], function(Backbone) {

    'use strict';

    var Systems = {};

    Systems = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.System,
        url: function() {
            return '/systems/v2/';
        },
        isSmallExecutionSystem: function(hostname) {
            var keys = Object.keys(EnvironmentConfig.agave.systems.execution);

            var isSmallSystem = keys.some(function(key) {
                var systemConfig = EnvironmentConfig.agave.systems.execution[key];

                if (systemConfig.hostname === hostname && systemConfig.type === 'small') {
                    return true;
                }
                else {
                    return false;
                }
            });

            return isSmallSystem;
        },
        largeExecutionSystemAvailable: function() {

            var that = this;

            var keys = Object.keys(EnvironmentConfig.agave.systems.execution);

            var upStatus = keys.some(function(key) {

                var systemConfig = EnvironmentConfig.agave.systems.execution[key];
                var system = that.get(systemConfig.hostname);

                if (systemConfig.type === 'large' && system.get('status') === 'UP') {
                    return true;
                }
                else {
                    return false;
                }
            });

            return upStatus;
        },
        getLargeExecutionSystem: function() {
            var that = this;

            var systemName;
            for (var i = 0; i < EnvironmentConfig.agave.systems.executionSystemPreference.length; ++i) {
                var name = EnvironmentConfig.agave.systems.executionSystemPreference[i];
                var systemConfig = EnvironmentConfig.agave.systems.execution[name];
                var system = that.get(systemConfig.hostname);

                if (system.get('status') === 'UP') {
                    systemName = name;
                    break;
                }
            }

            // default to first preferred system if unsure
            if (systemName === undefined) {
                systemName = EnvironmentConfig.agave.systems.executionSystemPreference[0];
            }

            return systemName;
        },
    });

    Backbone.Agave.Collection.Systems = Systems;
    return Systems;
});
