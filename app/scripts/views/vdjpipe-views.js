define([
    'app',
    'vdjpipe-utilities',
], function(App) {

    'use strict';

    var Vdjpipe = {};

    Vdjpipe.AmbiguousWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-ambiguous-nucleotide-window-filter',
    });

    Vdjpipe.AverageQualityWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-average-quality-window-filter',
    });

    Vdjpipe.FindSequencesFromMultipleGroups = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-find-sequences-from-multiple-groups',
        afterRender: function() {
            this.updateUIForWorkflowOptions();
        },
        updateUIForWorkflowOptions: function() {
            if (this.options && this.options.fraction_match) {
                this.setFractionMatch();
                $('.' + this.parameterType + '-fraction-match input').val(this.options.fraction_match);
            }
            else if (this.options && this.options.ignore_ends) {
                this.setIgnoreEnds();
                $('.' + this.parameterType + '-ignore-ends input').val(this.options.ignore_ends);
            }
        },
        events: function() {
            var events = {};
            events['click #' + this.parameterType + '-ignore-ends-button'] = 'setIgnoreEnds';
            events['click #' + this.parameterType + '-fraction-match-button'] = 'setFractionMatch';

            return events;
        },
        resetOptionalFormElementState: function() {
            // Hide all
            $('.' + this.parameterType + '-filter-param').addClass('hidden');

            // Clear out other input values
            $('.' + this.parameterType + '-filter-param input').val('');

            // Reset all button states
            $('.' + this.parameterType + '-filter-button').removeClass('btn-success');
            $('.' + this.parameterType + '-filter-button').addClass('btn-default');
        },
        setIgnoreEnds: function(e) {
            if (e) {
                e.preventDefault();
            }

            this.resetOptionalFormElementState();

            // Show this input
            $('.' + this.parameterType + '-ignore-ends').removeClass('hidden');

            // Highlight selected button
            $('#' + this.parameterType + '-ignore-ends-button').removeClass('btn-default');
            $('#' + this.parameterType + '-ignore-ends-button').addClass('btn-success');
        },
        setFractionMatch: function(e) {
            if (e) {
                e.preventDefault();
            }

            this.resetOptionalFormElementState();

            // Show this input
            $('.' + this.parameterType + '-fraction-match').removeClass('hidden');

            // Highlight selected button
            $('#' + this.parameterType + '-fraction-match-button').removeClass('btn-default');
            $('#' + this.parameterType + '-fraction-match-button').addClass('btn-success');
        },
    });

    Vdjpipe.FindUniqueSequences = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-find-unique-sequences',
        afterRender: function() {
            this.updateUIForWorkflowOptions();
        },
        updateUIForWorkflowOptions: function() {
            if (this.options && this.options.fraction_match) {
                this.setFractionMatch();
                $('.' + this.parameterType + '-fraction-match input').val(this.options.fraction_match);
            }
            else if (this.options && this.options.ignore_ends) {
                this.setIgnoreEnds();
                $('.' + this.parameterType + '-ignore-ends input').val(this.options.ignore_ends);
            }
        },
        events: function() {
            var events = {};
            events['click #' + this.parameterType + '-ignore-ends-button'] = 'setIgnoreEnds';
            events['click #' + this.parameterType + '-fraction-match-button'] = 'setFractionMatch';

            return events;
        },
        resetOptionalFormElementState: function() {
            // Hide all
            $('.' + this.parameterType + '-filter-param').addClass('hidden');

            // Clear out other input values
            $('.' + this.parameterType + '-filter-param input').val('');

            // Reset all button states
            $('.' + this.parameterType + '-filter-button').removeClass('btn-success');
            $('.' + this.parameterType + '-filter-button').addClass('btn-default');
        },
        setIgnoreEnds: function(e) {
            if (e) {
                e.preventDefault();
            }

            this.resetOptionalFormElementState();

            // Show this input
            $('.' + this.parameterType + '-ignore-ends').removeClass('hidden');

            // Highlight selected button
            $('#' + this.parameterType + '-ignore-ends-button').removeClass('btn-default');
            $('#' + this.parameterType + '-ignore-ends-button').addClass('btn-success');
        },
        setFractionMatch: function(e) {
            if (e) {
                e.preventDefault();
            }

            this.resetOptionalFormElementState();

            // Show this input
            $('.' + this.parameterType + '-fraction-match').removeClass('hidden');

            // Highlight selected button
            $('#' + this.parameterType + '-fraction-match-button').removeClass('btn-default');
            $('#' + this.parameterType + '-fraction-match-button').addClass('btn-success');
        },
    });

    Vdjpipe.Histogram = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-histogram',
    });

    Vdjpipe.HomopolymerFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-homopolymer-filter',
    });

    Vdjpipe.LengthFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-length-filter',
    });

    Vdjpipe.MatchSequenceElement = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-match-sequence-element',
        initialize: function() {
            this.elementCount = 0;
            this.objectCount  = 0;
        },
        events: {
            'click .add-element-button': 'addElement',
            'click .add-combination-object-button': 'addCombinationObject',
        },
        addElement: function(e) {
            e.preventDefault();

            //var fileName = $('.add-element-select').val();
            this.elementCount = this.elementCount + 1;

            var elementView = new Vdjpipe.MatchSequenceElementConfig({
                isEditable: this.isEditable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                elementCount: this.elementCount,
                //fileName: fileName,
            });

            this.insertView('.added-element-subviews', elementView);
            elementView.render();
        },
        addCombinationObject: function(e) {
            e.preventDefault();

            console.log("options are: " + JSON.stringify(this.options));

            this.objectCount = this.objectCount + 1;

            var combinationObjectView = new Vdjpipe.MatchSequenceElementCombinationObjectConfig({
                isEditable: this.isEditable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                objectCount: this.objectCount,
                files: this.files,
            });

            this.insertView('.added-combination-object-subviews', combinationObjectView);
            combinationObjectView.render();
        },
    });

    Vdjpipe.MatchSequenceElementConfig = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-match-sequence-element-config',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    elementCount: this.elementCount,
                    //fileName: this.fileName,
                    options: this.options,
                };
            }
        },
        events: {
            'click .remove-match-sequence-element': 'removeElement',
        },
        removeElement: function(e){
            e.preventDefault();
            this.remove();
        },
    });

    Vdjpipe.MatchSequenceElementCombinationObjectConfig = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-match-sequence-element-combination-object-config',
        serialize: function() {
            if (this.parameterType) {

                var files = {};

                if (this.files && this.files.toJSON()) {
                    files = this.files.toJSON();
                }

                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    objectCount: this.objectCount,
                    files: this.files,
                    options: this.options,
                };
            }
        },
        events: {
            'click .remove-match-sequence-combination-object': 'removeCombinationObject',
        },
        removeCombinationObject: function(e){
            e.preventDefault();
            this.remove();
        },
    });

    Vdjpipe.MatchExternalMolecularIdentifier = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-match-external-molecular-identifier',
    });

    Vdjpipe.MergePairedReads = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-merge-paired-reads',
    });

    Vdjpipe.MinimalAverageQualityFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-min-average-quality-filter',
    });

    Vdjpipe.MinimalQualityFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-min-quality-filter',
    });

    Vdjpipe.MinimalQualityWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-min-quality-window-filter',
    });

    Vdjpipe.NucleotideFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-nucleotide-filter',
        events: {
            'click #toggleCharacterLegend': 'toggleCharacterLegend'
        },
        toggleCharacterLegend: function() {
            if ($('#characterLegend').hasClass('hidden')) {
                $('#characterLegend').removeClass('hidden');
            }
            else {
                $('#characterLegend').addClass('hidden');
            }
        },
    });

    Vdjpipe.TextImmutable = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-text-immutable',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    options: this.options,
                };
            }
        },
    });

    Vdjpipe.WriteSequence = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-write-sequences',
    });

    Vdjpipe.WriteValue = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-write-values',
    });

    App.Views.Vdjpipe = Vdjpipe;
    return Vdjpipe;
});
