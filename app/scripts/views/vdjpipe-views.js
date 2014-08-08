define([
    'app',
    'vdjpipe-utilities',
], function(App) {

    'use strict';

    var Vdjpipe = {};

    Vdjpipe.VdjpipeNucleotideFilter = App.Views.Generic.VdjpipeOptionView.extend({
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

    Vdjpipe.VdjpipeFindUniqueSequences = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-find-unique-sequences',
        events: {
            'click .filter-button': 'changeFilterOptions',
        },
        changeFilterOptions: function(e) {
            e.preventDefault();

            // Hide all params
            $('.filter-param').addClass('hidden');

            // Reset buttons to default state
            $('.filter-button').removeClass('btn-success');
            $('.filter-button').addClass('btn-default');

            // Highlight selected button
            $('#' + e.target.id).removeClass('btn-default');
            $('#' + e.target.id).addClass('btn-success');

            // Clear out other input values
            $('.filter-param input').val('');

            if (e.target.id === 'ignore-ends-button') {
                // Show Ignore Ends
                $('.ignore-ends').removeClass('hidden');
            }
            else {
                // Show Fraction Match
                $('.fraction-match').removeClass('hidden');
            }
        },
    });

    Vdjpipe.VdjpipeAmbiguousWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-ambiguous-nucleotide-window-filter',
    });

    Vdjpipe.VdjpipeAverageQualityWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-average-quality-window-filter',
    });

    Vdjpipe.VdjpipeMinimalQualityWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-minimal-quality-window-filter',
    });

    Vdjpipe.VdjpipeMinAverageQualityFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-min-average-quality-filter',
    });

    Vdjpipe.VdjpipeLengthFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-length-filter',
    });

    Vdjpipe.VdjpipeNumberMutable = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-number-mutable',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterName: this.parameterName,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    inputLabel: this.inputLabel,
                    options: this.options,
                };
            }
        },
    });

    Vdjpipe.VdjpipeHistogram = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-histogram',
    });

    Vdjpipe.VdjpipeTextImmutable = App.Views.Generic.VdjpipeOptionView.extend({
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

    Vdjpipe.VdjpipeMatchSequenceElement = App.Views.Generic.VdjpipeOptionView.extend({
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

            var elementView = new Vdjpipe.VdjpipeMatchSequenceElementConfig({
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

            this.objectCount = this.objectCount + 1;

            var combinationObjectView = new Vdjpipe.VdjpipeMatchSequenceCombinationObjectConfig({
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                objectCount: this.objectCount,
                files: this.files.toJSON(),
            });

            this.insertView('.added-combination-object-subviews', combinationObjectView);
            combinationObjectView.render();
        },
    });

    Vdjpipe.VdjpipeMatchSequenceElementConfig = App.Views.Generic.VdjpipeOptionView.extend({
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

    Vdjpipe.VdjpipeMatchSequenceCombinationObjectConfig = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-match-sequence-combination-object-config',
        serialize: function() {
            if (this.parameterType) {
                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    objectCount: this.objectCount,
                    files: this.files.toJSON(),
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

    Vdjpipe.VdjpipeMatchExternalMolecularIdentifier = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-match-external-molecular-identifier',
    });

    Vdjpipe.VdjpipeWriteSequence = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-write-sequences',
    });

    Vdjpipe.VdjpipeWriteValue = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-write-values',
    });

    Vdjpipe.VdjpipeFindSequencesFromMultipleGroups = App.Views.Generic.VdjpipeOptionView.extend({
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

    App.Views.Vdjpipe = Vdjpipe;
    return Vdjpipe;
});
