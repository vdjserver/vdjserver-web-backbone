(function (window) {

    'use strict';

    var Backbone = window.Backbone;

    var JobListing = {};

    JobListing = Backbone.Agave.Model.extend({
        defaults: {
            appId: '',
            endTime: '',
            executionSystem: '',
            id: 0,
            name: '',
            owner: '',
            startTime: '',
            status: ''
        },
        url: function() {
            return '/jobs/v2/' + this.get('id');
        }
    });

    Backbone.Agave.Model.JobListing = JobListing;
    return JobListing;
})(this);
