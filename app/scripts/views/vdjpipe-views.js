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

    Vdjpipe.AverageQualityWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-average-quality-window-filter',
    });

    Vdjpipe.CustomDemultiplex = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-custom-demultiplex',
        initialize: function() {
            this.elementCount = 0;
            this.objectCount  = 0;
        },
        afterRender: function() {
            if (this.options && this.options.elements) {

                // Setup barcode files
                this.barcodeFiles = {};
                if (this.allFiles) {
                    this.barcodeFiles = this.allFiles.getSortedBarcodeCollection();
                }

                // Restore any previously saved barcode elements
                for (var i = 0; i < this.options.elements.length; i++) {
                    var barcodeOptions = this.options.elements[i];

                    this.addBarcode(barcodeOptions);
                }

                // Set location HTML
                if (this.options.elements.length === 1) {
                    this.updateViewForSingleBarcodeLocation();
                }
                else {
                    this.updateViewForDoubleBarcodeLocation();
                }

                // Select correct location
                $('#' + this.inputCount + '-barcode-location').val(this.options['custom_location']);

                // Set number of barcodes
                $('#' + this.inputCount + '-barcodes').val(this.elementCount);

                this.updateSubviewsForBarcodeLocation();
            }
        },
        events: function() {
            var events = {};
            events['change #' + this.inputCount + '-barcodes'] = 'changeBarcodeCount';
            events['change #' + this.inputCount + '-barcode-location'] = 'updateSubviewsForBarcodeLocation';

            return events;
        },
        updateViewForSingleBarcodeLocation: function() {
            $('#' + this.inputCount + '-barcode-location').html(
                  '<option value="1">5\'</option>'
                + '<option value="2">3\'</option>'
            );
        },
        updateViewForDoubleBarcodeLocation: function() {
            $('#' + this.inputCount + '-barcode-location').html(
                  '<option value="3">Both 5\'</option>'
                + '<option value="4">Both 3\'</option>'
                + '<option value="5">3\' and 5\'</option>'
            );
        },
        changeBarcodeCount: function(e) {
            e.preventDefault();

            var barcodeCount = e.target.value;
            barcodeCount = parseInt(barcodeCount);

            if (this.elementCount < barcodeCount) {
                this.addBarcode();
            }
            else {
                this.removeBarcode();
            }

            if (barcodeCount === 1) {
                this.updateViewForSingleBarcodeLocation();

                $('#' + this.inputCount + '-barcode-location').val(1);
            }
            else if (barcodeCount === 2) {
                this.updateViewForDoubleBarcodeLocation();

                $('#' + this.inputCount + '-barcode-location').val(3);
            }

            this.updateSubviewsForBarcodeLocation();
        },
        updateSubviewsForBarcodeLocation: function(e) {
            if (e) {
                e.preventDefault();
            }

            var barcodeLocation = $('#' + this.inputCount + '-barcode-location').val();
            barcodeLocation = parseInt(barcodeLocation);

            // .value() is necessary for layoutmanager to return view stack as a JS array
            var barcodeSubviews = this.getViews('.added-barcode-subviews').value();

            var barcodeCount = $('#' + this.inputCount + '-barcodes').val();
            barcodeCount = parseInt(barcodeCount);

            var barcodeView;

            if (barcodeCount === 1) {

                if (barcodeLocation === 1) {
                    barcodeLocation = '5\'';
                }
                else if (barcodeLocation === 2) {
                    barcodeLocation = '3\'';
                }

                barcodeView = barcodeSubviews[0];
                barcodeView.updateForBarcodeLocation(barcodeLocation);
            }
            else if (barcodeCount === 2) {

                var barcodeLocations = [];

                switch (barcodeLocation) {
                    case 3:
                        barcodeLocations[0] = '5\'';
                        barcodeLocations[1] = '5\'';
                        break;

                    case 4:
                        barcodeLocations[0] = '3\'';
                        barcodeLocations[1] = '3\'';
                        break;

                    case 5:
                        barcodeLocations[0] = '3\'';
                        barcodeLocations[1] = '5\'';
                        break;

                    default:
                        break;
                }

                for (var i = 0; i < barcodeSubviews.length; i++) {
                    barcodeView = barcodeSubviews[i];
                    barcodeView.updateForBarcodeLocation(barcodeLocations[i]);
                }
            }
        },
        addBarcode: function(barcodeOptions) {

            this.elementCount = this.elementCount + 1;

            var elementView = new Vdjpipe.CustomDemultiplexBarcodeConfig({
                isEditable: this.isEditable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                elementCount: this.elementCount,
                options: barcodeOptions,
                files: this.files,
                barcodeFiles: this.barcodeFiles,
            });

            this.insertView('.added-barcode-subviews', elementView);
            elementView.render();
        },
        removeBarcode: function() {

            this.elementCount = this.elementCount - 1;

            var barcodeSubviews = this.getViews('.added-barcode-subviews').value();
            var barcodeView = barcodeSubviews[1];

            barcodeView.remove();
        },
    });

    Vdjpipe.CustomDemultiplexBarcodeConfig = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-custom-demultiplex-barcode-config',
        serialize: function() {
            if (this.parameterType) {

                /*
                var files = {};
                if (this.files && this.files.toJSON()) {
                    files = this.files.toJSON();
                }
                */
                var barcodeFiles = {};
                if (this.barcodeFiles && this.barcodeFiles.toJSON) {
                    barcodeFiles = this.barcodeFiles.toJSON();
                }

                return {
                    isEditable: this.isEditable,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    elementCount: this.elementCount,
                    options: this.options,
                    //files: files,
                    barcodeFiles: barcodeFiles,
                };
            }
        },
        afterRender: function() {
            // Set initial title for first render if one is available
            $('#' + this.inputCount + '-barcode-title-' + this.elementCount).text(this.title);
        },
        events: function() {
            var events = {};
            events['change #barcode-location-' + this.inputCount + '-' + this.elementCount] = 'setTitleByLocation';

            return events;
        },
        updateForBarcodeLocation: function(barcodeLocation) {
            this.setTitleByLocation(barcodeLocation);
            this.setBarcodeTypeByLocation(barcodeLocation);
        },
        setTitleByLocation: function(barcodeLocation) {

            this.title = barcodeLocation + ' Barcode Set';

            $('#' + this.inputCount + '-barcode-title-' + this.elementCount).text(this.title);
        },
        setBarcodeTypeByLocation: function(barcodeLocation) {
            //console.log("barcodeLocation is: " + barcodeLocation);
            $('#' + this.inputCount + '-' + this.parameterType + '-' + this.elementCount + '-element-barcode-type').val(barcodeLocation);
            //console.log("barcodeType check is: " + $('#' + this.inputCount + '-' + this.parameterType + '-' + this.elementCount + '-element-barcode-type').val());
        },
    });

    Vdjpipe.FindSharedSequences = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe-find-shared-sequences',
        afterRender: function() {
            this.updateUIForWorkflowOptions();
        },
        updateUIForWorkflowOptions: function() {
            if (this.options && this.options['fraction_match']) {
                this.setFractionMatch();
                $('.' + this.parameterType + '-fraction-match input').val(this.options['fraction_match']);
            }
            else if (this.options && this.options['ignore_ends']) {
                this.setIgnoreEnds();
                $('.' + this.parameterType + '-ignore-ends input').val(this.options['ignore_ends']);
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
        removeElement: function(e) {
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
        removeCombinationObject: function(e) {
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
