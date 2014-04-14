(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var JobListings = {};

    JobListings = Backbone.Agave.Collection.extend({
        model: Backbone.Agave.Model.JobListing,
        url: function() {
            return '/jobs/v2/';
        }
    });

    Backbone.Agave.Collection.JobListings = JobListings;
    return JobListings;
})(this);
