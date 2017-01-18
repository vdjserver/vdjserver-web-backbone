define([
    'app',
    'handlebars-utilities',
    'handlebars',
    'serialization-tools',
], function(App, HandlebarsUtilities, Handlebars, SerializationTools) {

    'use strict';

    HandlebarsUtilities.registerRawPartial(
        'jobs/repcalc/fragments/repcalc-base-view-top',
        'repcalc-base-view-top'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/repcalc/fragments/repcalc-base-view-bottom',
        'repcalc-base-view-bottom'
    );

    var RepCalc = {};

    RepCalc.GeneSegmentUsage = Backbone.View.extend({
        template: 'jobs/repcalc/repcalc-gene-segment',
        initialize: function(options) {
            this.title = 'Gene Segment Usage';
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    RepCalc.CDR3 = Backbone.View.extend({
        template: 'jobs/repcalc/repcalc-cdr3',
        initialize: function(options) {
            this.title = 'CDR3 Analysis';
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    RepCalc.Diversity = Backbone.View.extend({
        template: 'jobs/repcalc/repcalc-diversity',
        initialize: function(options) {
            this.title = 'Diversity';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    RepCalc.MutationalAnalysis = Backbone.View.extend({
        template: 'jobs/repcalc/repcalc-mutations',
        initialize: function(options) {
            this.title = 'Mutational Analysis';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    RepCalc.ClonalAnalysis = Backbone.View.extend({
        template: 'jobs/repcalc/repcalc-clones',
        initialize: function(options) {
            this.title = 'Clonal Analysis';
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    App.Views.RepCalc = RepCalc;
    return RepCalc;
});
