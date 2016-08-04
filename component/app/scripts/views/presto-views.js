define([
    'app',
    'handlebars-utilities',
    'handlebars',
    'serialization-tools',
], function(App, HandlebarsUtilities, Handlebars, SerializationTools) {

    'use strict';

    HandlebarsUtilities.registerRawPartial(
        'jobs/presto/fragments/presto-base-view-top',
        'presto-base-view-top'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/presto/fragments/presto-base-view-bottom',
        'presto-base-view-bottom'
    );

    var Presto = {};

    Presto.Barcode = Backbone.View.extend({
        template: 'jobs/presto/presto-barcode',
        initialize: function(options) {
            this.title = 'Demultiplex Barcodes';
        },
        prepareFiles: function(allFiles) {
            this.barcodeFiles = this.allFiles.getBarcodeCollection();
        },
        serialize: function() {

            return {
                title: this.title,
                isRemovable: true,
                barcodeFiles: this.barcodeFiles.toJSON(),
            };
        },
    });

    Presto.UMI = Backbone.View.extend({
        template: 'jobs/presto/presto-umi',
        initialize: function(options) {
            this.title = 'Universal Molecular Identifiers (UMI)';
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

    Presto.FinalOutputFilename = Backbone.View.extend({
        template: 'jobs/presto/presto-final-output-filename',
        initialize: function(options) {
            this.title = 'Final Output Filename';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    Presto.FindUnique = Backbone.View.extend({
        template: 'jobs/presto/presto-find-unique',
        initialize: function(options) {
            this.title = 'Find Unique';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    Presto.JPrimer = Backbone.View.extend({
        template: 'jobs/presto/presto-reverse-primer',
        initialize: function(options) {
            this.title = 'Reverse Primer';
        },
        prepareFiles: function() {
            this.primerFiles = this.allFiles.getPrimerCollection();
        },
        serialize: function() {
            return {
                title: this.title,
                isRemovable: true,
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

    Presto.OutputFilePrefix = Backbone.View.extend({
        template: 'jobs/presto/presto-output-file-prefix',
        initialize: function(options) {
            this.title = 'Output File Prefix';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    Presto.QualityLengthFilter = Backbone.View.extend({
        template: 'jobs/presto/presto-quality-length-filter',
        initialize: function(options) {
            this.title = 'Length/Quality Filter';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    Presto.SequenceType = Backbone.View.extend({
        template: 'jobs/presto/presto-sequence-type',
        initialize: function(options) {
            this.title = 'Sequence Type';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    Presto.VPrimer = Backbone.View.extend({
        template: 'jobs/presto/presto-forward-primer',
        initialize: function(options) {
            this.title = 'Forward Primer';
        },
        prepareFiles: function() {
            this.primerFiles = this.allFiles.getPrimerCollection();
        },
        serialize: function() {
            return {
                title: this.title,
                isRemovable: true,
                primerFiles: this.primerFiles.toJSON(),
            };
        },
        events: {
            'change .v-primer-type': 'swapPrimerFields',
        },
		    swapPrimerFields: function(e){
		        if (e.target.value == 'align') {
                $('.v-align-fields').prop('disabled', false);
                $('.v-score-fields').prop('disabled', true);
            } else {
                $('.v-align-fields').prop('disabled', true);
                $('.v-score-fields').prop('disabled', false);
            }
		    },
    });

    App.Views.Presto = Presto;
    return Presto;
});
