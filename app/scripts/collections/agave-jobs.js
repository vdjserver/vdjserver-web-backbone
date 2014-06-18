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

    Jobs.OutputFiles = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.Job.OutputFile,
        initialize: function(parameters) {
            if (parameters.jobId) {
                this.jobId = parameters.jobId;
            }
        },
        comparator: 'name',
        url: function() {
            return '/jobs/v2/' + this.jobId + '/outputs/listings';
        },
    });

    Jobs.Listings = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.Job.Listing,
        initialize: function(parameters) {
            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"projectJob",'
                    + '"value.projectUuid":"' + this.projectUuid + '"'
                + '}');
        },
    });

    Backbone.Agave.Collection.Jobs = Jobs;
    return Jobs;
});
