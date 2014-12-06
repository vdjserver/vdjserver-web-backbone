define([
    'app',
    'handlebars-utilities',
], function(App, HandlebarsUtilities) {

    'use strict';

    HandlebarsUtilities.registerRawPartial('jobs/vdjpipe/vdjpipe-base-view-top', 'vdjpipe-base-view-top');
    HandlebarsUtilities.registerRawPartial('jobs/vdjpipe/vdjpipe-base-view-bottom', 'vdjpipe-base-view-bottom');

    var Vdjpipe = {};

    Vdjpipe.AmbiguousWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-ambiguous-nucleotide-window-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Ambiguous Nucleotide Window Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.AverageQualityWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-average-quality-window-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Average Quality Window Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.CompositionStats = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-composition-stats',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Generate Composition Stats';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.CustomDemultiplex = App.Views.Generic.VdjpipeOptionView.extend(
        _.extend({}, App.Mixins.Handlebars, {

            template: 'jobs/vdjpipe/vdjpipe-custom-demultiplex',
            initialize: function(options) {

                this.elementCount = 0;
                this.objectCount  = 0;
                this.barcodeSubviewsSelector = '#' + this.inputCount + '-' + this.parameterType + '-added-barcode-subviews';
                this.barcodeFiles = {};
                this.combinationFiles = {};

                this.vdjpipeOptionTitle = 'Demultiplex';

                App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);

            },
            beforeRender: function() {
                this.isRemovable = true;
            },
            afterRender: function() {
                if (this.options && this.options.elements) {

                    // Setup barcode files
                    if (this.allFiles) {
                        this.barcodeFiles = this.allFiles.getBarcodeCollection();
                        this.combinationFiles = this.allFiles.getCombinationCollection();
                    }

                    // Combination View
                    this.setupCombinationView();

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

                if (barcodeCount === 1) {

                    // User removed a barcode since we have an element count
                    if (this.elementCount > 1) {
                        this.removeBarcode();
                    }
                    // User added an initial barcode
                    else {
                        this.addBarcode();
                    }

                    this.updateViewForSingleBarcodeLocation();

                    $('#' + this.inputCount + '-barcode-location').val(1);
                }
                else if (barcodeCount === 2) {
                    // User added a barcode since the target count is 2
                    this.addBarcode();
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
                var barcodeSubviews = this.getViews(this.barcodeSubviewsSelector).value();

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

                this.elementCount += 1;

                var elementView = new Vdjpipe.CustomDemultiplexBarcodeConfig({
                    isOrderable: this.isOrderable,
                    isRemovable: this.isRemovable,
                    loadDefaultOptions: this.loadDefaultOptions,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    elementCount: this.elementCount,
                    options: barcodeOptions,
                    files: this.files,
                    barcodeFiles: this.barcodeFiles,
                    parentView: this,
                });

                this.insertView(this.barcodeSubviewsSelector, elementView);

                var that = this;

                elementView.render().promise().done(function() {
                    that.updateCombinationView();
                });
            },
            removeBarcode: function() {

                this.elementCount -= 1;

                var barcodeSubviews = this.getViews(this.barcodeSubviewsSelector).value();

                var barcodeView = barcodeSubviews[1];

                var that = this;
                barcodeView.remove().promise().done(function() {
                    that.updateCombinationView();
                });
            },
            setupCombinationView: function() {

                var combinationView = new Vdjpipe.CustomDemultiplexCombinationConfig({
                    isOrderable: this.isOrderable,
                    isRemovable: this.isRemovable,
                    loadDefaultOptions: this.loadDefaultOptions,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    elementCount: this.elementCount,
                    //options: barcodeOptions,
                    files: this.files,
                    combinationFiles: this.combinationFiles,
                    barcodeFiles: this.barcodeFiles,
                });

                this.setView(
                    '#' + this.inputCount + '-' + this.parameterType + '-combination-subview',
                    combinationView
                );

                combinationView.render();
            },
            updateCombinationView: function() {
                var combinationView = this.getView(
                    '#' + this.inputCount + '-' + this.parameterType + '-combination-subview'
                );

                var barcodeInfo = [];

                var barcodeElementViews = this.getViews(this.barcodeSubviewsSelector).value();

                for (var i = 0; i < barcodeElementViews.length; i++) {
                    var barcodeFilename = barcodeElementViews[i].getBarcodeFilename();
                    barcodeInfo.push({
                        'barcodeName': barcodeFilename,
                        'barcodeElementNumber': i + 1,
                    });
                }

                combinationView.updateBarcodeInfo(barcodeInfo, this.elementCount);
            },
        })
    );

    Vdjpipe.CustomDemultiplexBarcodeConfig = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-custom-demultiplex-barcode-config',
        initialize: function() {

            // Don't let layout manager discard this view if it is re-rendered!
            // We're managing it manually to allow user interaction with barcode subviews.
            this.keep = true;

            if (this.loadDefaultOptions) {
                if (!this.options) {
                    this.options = {};
                }
                this.options['custom_trim'] = true;
            }
        },
        serialize: function() {
            if (this.parameterType) {

                var barcodeFiles = {};
                if (this.barcodeFiles && this.barcodeFiles.toJSON) {
                    barcodeFiles = this.barcodeFiles.toJSON();
                }

                return {
                    isOrderable: this.isOrderable,
                    isRemovable: this.isRemovable,
                    loadDefaultOptions: this.loadDefaultOptions,
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
            events['change #' + this.inputCount + '-' + this.parameterType + '-' + this.elementCount + '-element-sequence-file'] = 'selectBarcodeFile';

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
            $('#' + this.inputCount + '-' + this.parameterType + '-' + this.elementCount + '-element-barcode-type').val(barcodeLocation);
        },
        getBarcodeFilename: function() {
            var barcodeName = $('#' + this.inputCount + '-' + this.parameterType + '-' + this.elementCount + '-element-sequence-file').val();

            return barcodeName;
        },
        selectBarcodeFile: function(e) {
            e.preventDefault();

            this.parentView.updateCombinationView();
        },
    });

    Vdjpipe.CustomDemultiplexCombinationConfig = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-custom-demultiplex-combination-config',
        initialize: function() {

            // Don't let layout manager discard this view if it is re-rendered!
            // We're managing it manually to allow user interaction with barcode subviews.
            //this.keep = true;
            this.keep = false;
            this.barcodeInfo = [];
        },
        serialize: function() {
            if (this.parameterType) {

                var combinationFiles = {};
                if (this.combinationFiles && this.combinationFiles.toJSON) {
                    combinationFiles = this.combinationFiles.toJSON();
                }

                var barcodeInfo = [];
                if (this.barcodeInfo.length > 0) {
                    barcodeInfo = this.barcodeInfo;
                }

                var barcodeColumns = this.getBarcodeColumns(this.elementCount);

                return {
                    isOrderable: this.isOrderable,
                    isRemovable: this.isRemovable,
                    loadDefaultOptions: this.loadDefaultOptions,
                    parameterType: this.parameterType,
                    inputCount: this.inputCount,
                    elementCount: this.elementCount,
                    options: this.options,
                    combinationFiles: combinationFiles,
                    barcodeInfo: barcodeInfo,
                    barcodeColumns: barcodeColumns,
                };
            }
        },
        updateBarcodeInfo: function(barcodeInfo, elementCount) {
            this.barcodeInfo = barcodeInfo;

            this.elementCount = elementCount;

            this.render();
        },
        getBarcodeColumns: function(elementCount) {
            var barcodeColumns = [];

            for (var i = 1; i < elementCount + 1; i++) {
                barcodeColumns.push(i);
            }

            return barcodeColumns;
        },
    });

    Vdjpipe.FindSharedSequences = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-find-shared-sequences',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Find Unique Sequences';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });
/*
    Vdjpipe.FindSharedSequences = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-find-shared-sequences',
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

            if ($('#' + this.parameterType + '-ignore-ends-button').hasClass('btn-success')) {
                this.resetOptionalFormElementState();
            }
            else {
                this.resetOptionalFormElementState();

                // Show this input
                $('.' + this.parameterType + '-ignore-ends').removeClass('hidden');

                // Highlight selected button
                $('#' + this.parameterType + '-ignore-ends-button').removeClass('btn-default');
                $('#' + this.parameterType + '-ignore-ends-button').addClass('btn-success');
            }
        },
        setFractionMatch: function(e) {
            if (e) {
                e.preventDefault();
            }

            if ($('#' + this.parameterType + '-fraction-match-button').hasClass('btn-success')) {
                this.resetOptionalFormElementState();
            }
            else {
                this.resetOptionalFormElementState();

                // Show this input
                $('.' + this.parameterType + '-fraction-match').removeClass('hidden');

                // Highlight selected button
                $('#' + this.parameterType + '-fraction-match-button').removeClass('btn-default');
                $('#' + this.parameterType + '-fraction-match-button').addClass('btn-success');
            }
        },
    });
*/

    Vdjpipe.Histogram = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-histogram',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Histogram';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.HomopolymerFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-homopolymer-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Homopolymer Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.LengthFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-length-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Length Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MatchExternalMolecularIdentifier = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-match-external-molecular-identifier',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Match External Molecular Identifier';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MergePairedReads = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-merge-paired-reads',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Merge Paired Reads';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MinimalAverageQualityFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-min-average-quality-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Minimum Average Quality Window Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MinimalQualityFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-min-quality-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Minimum Quality Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MinimalQualityWindowFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-min-quality-window-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Minimum Quality Window Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.NucleotideFilter = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-nucleotide-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Nucleotide Filter';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
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

    Vdjpipe.QualityStats = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-quality-stats',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Generate Quality Statistics';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

/*
    Vdjpipe.TextImmutable = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-text-immutable',
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
*/

    Vdjpipe.WriteSequence = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-write-sequences',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Write Sequences';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.WriteValue = App.Views.Generic.VdjpipeOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-write-values',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Write Values';
            App.Views.Generic.VdjpipeOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    App.Views.Vdjpipe = Vdjpipe;
    return Vdjpipe;
});
