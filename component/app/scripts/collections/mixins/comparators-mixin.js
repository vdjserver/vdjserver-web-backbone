define([
    'app',
    'moment',
], function(App, moment) {

    'use strict';

    var Comparators = {};

    Comparators.reverseChronologicalCreatedTime = {};
    Comparators.reverseChronologicalCreatedTime.comparator = function(modelA, modelB) {
        var modelAEndDate = moment(modelA.get('created'));
        var modelBEndDate = moment(modelB.get('created'));

        if (modelAEndDate > modelBEndDate) {
            return -1;
        }
        else if (modelBEndDate > modelAEndDate) {
            return 1;
        }

        // Equal
        return 0;
    };

    App.Mixins.Comparators = Comparators;
    return Comparators;
});
