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
            this.title = 'Barcodes';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
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
        template: 'jobs/presto/presto-j-primer',
        initialize: function(options) {
            this.title = 'J Primer';
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
        template: 'jobs/presto/presto-v-primer',
        initialize: function(options) {
            this.title = 'V Primer';
            this.render();
        },
        serialize: function() {
            return {
                title: this.title,
            };
        },
    });

    App.Views.Presto = Presto;
    return Presto;
});
