(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var JobListings = {};

    JobListings = Backbone.Agave.MetadataCollection.extend({
        model: Backbone.Agave.Model.JobListing,
        initialize: function(parameters) {

            console.log("params are: " + JSON.stringify(parameters));
            if (parameters && parameters.projectUuid) {
                this.projectUuid = parameters.projectUuid;
            }
        },
        url: function() {
            console.log("url is: " + this.projectUuid);
            return '/meta/v2/data?q='
                + encodeURIComponent('{'
                    + '"name":"projectJob",'
                    + '"value.projectUuid":"' + this.projectUuid + '"'
                + '}');
        }
    });

    Backbone.Agave.Collection.JobListings = JobListings;
    return JobListings;
})(this);
