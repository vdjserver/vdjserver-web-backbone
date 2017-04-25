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

    Comparators.Name = {};
    Comparators.Name.comparator = function(modelA, modelB) {
        var modelAValue = modelA.get('value');
        var modelBValue = modelB.get('value');

        if (modelAValue && modelAValue.name && modelBValue && modelBValue.name) {
            if (modelAValue.name < modelBValue.name) {
                return -1;
            }
            if (modelBValue.name < modelAValue.name) {
                return 1;
            }
        }

        // Equal
        return 0;
    };

    App.Mixins.Comparators = Comparators;
    return Comparators;
});
