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
        prepareFiles: function(allFiles) {
            this.barcodeFiles = this.allFiles.getBarcodeCollection();
        },
        serialize: function() {

            return {
                title: this.title,
                barcodeFiles: this.barcodeFiles.toJSON(),
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
        events: {
            'change #umi-consensus': 'swapFields',
            'click #umi-consensus': 'swapFields',
        },
		    swapFields: function(e){
		        if (e.target.checked) {
                $('#umi-max-error').prop('disabled', false);
                $('#umi-max-gap').prop('disabled', false);
                $('#umi-min-frequency').prop('disabled', false);
            } else {
                $('#umi-max-error').prop('disabled', true);
                $('#umi-max-gap').prop('disabled', true);
                $('#umi-min-frequency').prop('disabled', true);
            }
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
        prepareFiles: function() {
            this.primerFiles = this.allFiles.getPrimerCollection();
        },
        serialize: function() {
            return {
                title: this.title,
                primerFiles: this.primerFiles.toJSON(),
            };
        },
        events: {
            'change .j-primer-type': 'swapPrimerFields',
        },
		    swapPrimerFields: function(e){
		        if (e.target.value == 'align') {
                $('.j-align-fields').prop('disabled', false);
                $('.j-score-fields').prop('disabled', true);
            } else {
                $('.j-align-fields').prop('disabled', true);
                $('.j-score-fields').prop('disabled', false);
            }
		    },
    });

    App.Views.RepCalc = RepCalc;
    return RepCalc;
});
