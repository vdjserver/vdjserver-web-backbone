define(['backbone'], function(Backbone) {

    'use strict';

    var Jobs = {};

    Jobs = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.Detail,

        // Sort by reverse date order
        comparator: function(modelA, modelB) {
            var modelAEndDate = moment(modelA.get('submitTime'));
            var modelBEndDate = moment(modelB.get('submitTime'));

            if (modelAEndDate > modelBEndDate) {
                return -1;
            }
            else if (modelBEndDate > modelAEndDate) {
                return 1;
            }

            // Equal
            return 0;
        },
    });

    Backbone.Agave.Collection.Jobs = Jobs;
    return Jobs;
});
