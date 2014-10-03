define(['app'], function(App) {

    'use strict';

    var Utilities = {};

    Utilities.IfCond = function(variable1, variable2, options) {

        if (variable1 === variable2) {
            return options.fn(this);
        }

        return options.inverse(this);
    };

    App.Views.HandlebarsHelpers.Utilities = Utilities;
    return Utilities;
});
