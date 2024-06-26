define([
    'app',
    'handlebars-utilities',
    'handlebars',
    'serialization-tools',
], function(App, HandlebarsUtilities, Handlebars, SerializationTools) {

    'use strict';

    HandlebarsUtilities.registerRawPartial(
        'jobs/vdjpipe/fragments/vdjpipe-base-view-top',
        'vdjpipe-base-view-top'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/vdjpipe/fragments/vdjpipe-base-view-bottom',
        'vdjpipe-base-view-bottom'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/vdjpipe/fragments/vdjpipe-paired-reads-direction-fragment',
        'vdjpipe-paired-reads-direction-fragment'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/vdjpipe/fragments/vdjpipe-paired-reads-direction-limited-fragment',
        'vdjpipe-paired-reads-direction-limited-fragment'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/vdjpipe/demultiplex/fragments/vdjpipe-custom-demultiplex-barcode-top',
        'vdjpipe-custom-demultiplex-barcode-top'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/vdjpipe/demultiplex/fragments/vdjpipe-custom-demultiplex-barcode-shared-options',
        'vdjpipe-custom-demultiplex-barcode-shared-options'
    );

    HandlebarsUtilities.registerRawPartial(
        'jobs/vdjpipe/demultiplex/fragments/vdjpipe-custom-demultiplex-barcode-bottom',
        'vdjpipe-custom-demultiplex-barcode-bottom'
    );

    Handlebars.registerHelper('ifGreaterThan', function(v1, v2, options) {

        if (v1 > v2) {
            return options.fn(this);
        }

        return options.inverse(this);
    });

    var Vdjpipe = {};

    Vdjpipe.AmbiguousWindowFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-ambiguous-nucleotide-window-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Ambiguous Nucleotide Window Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.AverageQualityWindowFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-average-quality-window-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Average Quality Window Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.CompositionStats = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-composition-stats',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Generate Composition Statistics';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.CustomJPrimerTrimming = App.Views.Generic.Vdjpipe.PrimerTrimming.extend({
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Reverse PCR Primer Matching';
            App.Views.Generic.Vdjpipe.PrimerTrimming.prototype.initialize.apply(this, [options]);
            this.render();

            this.primerFiles = {};
        },
        prepareFiles: function() {
            this.primerFiles = this.allFiles.getPrimerCollection();
        },
        beforeRender: function() {
            // Apparently, this vdjpipe step should always be removable.
            this.isRemovable = true;
        },
        serialize: function() {

            var files = SerializationTools.GetSerializedModel(this.files);
            var primerFiles = SerializationTools.GetSerializedModel(this.primerFiles);

            return {
                isOrderable: this.isOrderable,
                isRemovable: this.isRemovable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                files: files,
                options: this.options,
                vdjpipeOptionTitle: this.vdjpipeOptionTitle,
                primerFiles: primerFiles,
            };
        },
    });

    Vdjpipe.CustomVPrimerTrimming = App.Views.Generic.Vdjpipe.PrimerTrimming.extend({
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Forward PCR Primer Matching';
            App.Views.Generic.Vdjpipe.PrimerTrimming.prototype.initialize.apply(this, [options]);
            this.render();

            this.primerFiles = {};
        },
        prepareFiles: function() {
            this.primerFiles = this.allFiles.getPrimerCollection();
        },
        beforeRender: function() {
            // Apparently, this vdjpipe step should always be removable.
            this.isRemovable = true;
        },
        serialize: function() {

            var files = SerializationTools.GetSerializedModel(this.files);
            var primerFiles = SerializationTools.GetSerializedModel(this.primerFiles);

            return {
                isOrderable: this.isOrderable,
                isRemovable: this.isRemovable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                files: files,
                options: this.options,
                vdjpipeOptionTitle: this.vdjpipeOptionTitle,
                primerFiles: primerFiles,
            };
        },
    });

    Vdjpipe.BarcodeDemultiplex = App.Views.Generic.Vdjpipe.BaseOptionView.extend({

        template: 'jobs/vdjpipe/vdjpipe-barcode',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Barcode Demultiplexing';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();

            this.barcodeFiles = {};
        },
        prepareFiles: function() {
            this.barcodeFiles = this.allFiles.getBarcodeCollection();
        },
        beforeRender: function() {
            // Apparently, this vdjpipe step should always be removable.
            this.isRemovable = true;
        },
        serialize: function() {

            var files = SerializationTools.GetSerializedModel(this.files);
            var barcodeFiles = SerializationTools.GetSerializedModel(this.barcodeFiles);

            return {
                isOrderable: this.isOrderable,
                isRemovable: this.isRemovable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                files: files,
                options: this.options,
                vdjpipeOptionTitle: this.vdjpipeOptionTitle,
                barcodeFiles: barcodeFiles,
            };
        },
    });

    Vdjpipe.CustomDemultiplex = App.Views.Generic.Vdjpipe.BaseOptionView.extend({

        template: 'jobs/vdjpipe/demultiplex/vdjpipe-custom-demultiplex',
        initialize: function(options) {

            this.elementCount = 0;
            this.objectCount  = 0;
            this.barcodeSubviewsSelector = '#' + this.inputCount + '-' + this.parameterType + '-added-barcode-subviews';
            this.combinationSubviewSelector = '#' + this.inputCount + '-' + this.parameterType + '-combination-subview';
            this.barcodeFiles = {};
            this.combinationFiles = {};

            this.vdjpipeOptionTitle = 'Demultiplex';

            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);

        },
        beforeRender: function() {
            // Apparently, this vdjpipe step should always be removable.
            this.isRemovable = true;
        },
        afterRender: function() {

            // Since barcodes have separate dynamic views, they need to be added
            // here in afterRender()

            if (this.options && this.options.elements) {

                // Setup barcode files
                if (this.allFiles) {
                    this.barcodeFiles = this.allFiles.getBarcodeCollection();
                    this.combinationFiles = this.allFiles.getCombinationCollection();
                }

                // Restore any previously saved barcode elements
                if (this.options.elements.length === 1) {
                    var barcodeOptions = this.options.elements[0];

                    this.addSingleBarcode(barcodeOptions);
                }
                else {
                    for (var i = 0; i < this.options.elements.length; i++) {
                        var barcodeOptions = this.options.elements[i];

                        this.addMultiBarcode(barcodeOptions);
                    }
                }

                // Set location HTML
                if (this.options.elements.length === 1) {
                    this.updateViewForSingleBarcodeLocation();
                }
                else {
                    this.updateViewForDoubleBarcodeLocation();
                }

                // Select correct location
                // TODO: if we restore the custom workflow feature, then this val will need to be dynamic
                $('#' + this.inputCount + '-barcode-location').val('1'); //this.options['custom_location']);

                // Set number of barcodes
                $('#' + this.inputCount + '-barcodes').val(this.elementCount);

                this.updateSubviewsForBarcodeLocation();
            }

            this.layoutView.trigger('FixModalBackdrop');

            $('.demultiplex-tooltip').tooltip();
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

                // Combination View
                this.removeCombinationView();

                this.removeAllBarcodes();
                this.addSingleBarcode();

                this.updateViewForSingleBarcodeLocation();

                $('#' + this.inputCount + '-barcode-location').val(1);
            }
            else if (barcodeCount === 2) {

                // Get options from original barcode so they can applied to the new barcode
                var barcodeOptions = {};
                if (this.options && this.options.elements && this.options.elements[0]) {
                    barcodeOptions = this.options.elements[0];
                }

                this.removeAllBarcodes();

                this.addMultiBarcode(barcodeOptions);
                this.addMultiBarcode(barcodeOptions);

                // add combination view after barcodes have been added
                // in order to get correct |elementCount|
                this.addCombinationView();

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
        addSingleBarcode: function(barcodeOptions) {
            // "Command" design pattern

            var barcodeView = this.generateBarcodeView(barcodeOptions);

            this.insertBarcodeView(barcodeView);
        },
        addMultiBarcode: function(barcodeOptions) {
            // "Command" design pattern

            var barcodeView = this.generateBarcodeView(barcodeOptions);
            barcodeView.template = 'jobs/vdjpipe/demultiplex/vdjpipe-custom-demultiplex-barcode-multiple';

            this.insertBarcodeView(barcodeView);
        },
        generateBarcodeView: function(barcodeOptions) {

            if (barcodeOptions === undefined) {
                barcodeOptions = {};
            }

            this.elementCount += 1;

            var barcodeView = new Vdjpipe.CustomDemultiplexBarcodeConfig({
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
                layoutView: this.layoutView,
            });

            return barcodeView;
        },
        insertBarcodeView: function(barcodeView) {
            this.insertView(this.barcodeSubviewsSelector, barcodeView);

            barcodeView.render().promise().done(
                this.layoutView.trigger('FixModalBackdrop')
            );
        },
        removeAllBarcodes: function() {
            this.elementCount = 0;

            var barcodeSubviews = this.getViews(this.barcodeSubviewsSelector).value();

            var removeBarcodeSubviewsPromises = barcodeSubviews.map(function(barcodeView) {
                return barcodeView.remove();
            });

            this.layoutView.trigger('FixModalBackdrop')
        },
        addCombinationView: function() {

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
                this.combinationSubviewSelector,
                combinationView
            );

            var that = this;

            combinationView.render().promise().done(
                function() {
                    //that.updateCombinationView();
                    that.layoutView.trigger('FixModalBackdrop');
                }
            );
        },
        removeCombinationView: function() {
            this.removeView(this.combinationSubviewSelector);
            this.layoutView.trigger('FixModalBackdrop');
        },
        /*
        updateCombinationView: function() {

            if (this.elementCount === 2) {

                var combinationView = this.getView(
                    this.combinationSubviewSelector
                );

                var barcodeInfo = [];

                var barcodeElementViews = this.getViews(this.barcodeSubviewsSelector).value();

                for (var i = 0; i < barcodeElementViews.length; i++) {
                    barcodeInfo.push({
                        'barcodeElementNumber': i + 1,
                    });
                }

                combinationView.updateBarcodeInfo(barcodeInfo, this.elementCount);
            }
        },
        */
    });

    Vdjpipe.CustomDemultiplexBarcodeConfig = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/demultiplex/vdjpipe-custom-demultiplex-barcode',
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

            // Bootstrap the initial location value to avoid lots of rendering juggling.
            this.options['custom_type'] = '5\'';
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

            this.layoutView.trigger('FixModalBackdrop');
        },
        events: function() {
            var events = {};
            events['change #barcode-location'
                           + '-' + this.inputCount
                           + '-' + this.elementCount
            ] = 'setTitleByLocation';

            return events;
        },
        updateForBarcodeLocation: function(barcodeLocation) {
            this.setTitleByLocation(barcodeLocation);
            this.setBarcodeTypeByLocation(barcodeLocation);
        },
        setTitleByLocation: function(barcodeLocation) {

            this.title = this._getStringElementCount(this.elementCount) + ' ' + barcodeLocation + ' Barcode Set';

            $('#' + this.inputCount + '-barcode-title-' + this.elementCount).text(this.title);
        },
        setBarcodeTypeByLocation: function(barcodeLocation) {

            $('#' + this.inputCount
                  + '-' + this.parameterType
                  + '-' + this.elementCount
                  + '-element-custom-type'
            ).val(barcodeLocation);

        },
        _getStringElementCount: function(elementCount) {
            if (elementCount === 1) {
                return 'First Element:';
            }
            else if (elementCount === 2) {
                return 'Second Element:';
            }
        },
    });

    Vdjpipe.CustomDemultiplexCombinationConfig = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/demultiplex/vdjpipe-custom-demultiplex-combination',
        initialize: function() {
            // Don't let layout manager discard this view if it is re-rendered!
            // We're managing it manually to allow user interaction with barcode subviews.
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
                    barcodeColumns: new Array(this.elementCount + 1),
                };
            }
        },
        events: function() {
            var events = {};
            events['change #' + this.inputCount + '-' + this.parameterType + '-combination-csv-file'] = '_setupColumnNamesEventHandler';
            events['change .' + this.inputCount + '-' + this.parameterType + '-combination-selectable-column-name'] = '_autoselectSecondBarcode';

            return events;
        },
        afterRender: function() {
            var defaultModel = this.combinationFiles.at(0);

            try {
                this._setupColumnNames(defaultModel.get('value').name);
            }
            catch (e) {
            }
        },
        _setupColumnNamesEventHandler: function(e) {

            var targetFilename = '';

            try {
                e.preventDefault();
                targetFilename = e.target.value;
            }
            catch (e) {
            }

            this._setupColumnNames(targetFilename);
        },
        _autoselectSecondBarcode: function() {
            var columnNames = document.getElementById(this.inputCount + '-' + this.parameterType + '-combination-first-barcode-column');

            var barcodeA = $('#' + this.inputCount + '-' + this.parameterType + '-combination-names-column option:selected').text();
            var barcodeB = $('#' + this.inputCount + '-' + this.parameterType + '-combination-first-barcode-column option:selected').text();
            var barcodeC = '';

            var selectedBarcodes = new Set();
            selectedBarcodes.add(barcodeA);
            selectedBarcodes.add(barcodeB);

            for (var i = 0; i < columnNames.length; i++) {
                if (selectedBarcodes.has(columnNames[i].value) === false) {
                    barcodeC = columnNames[i].value;
                    break;
                }
            };

            $('#' + this.inputCount + '-' + this.parameterType + '-combination-second-barcode-column').val(barcodeC);
        },
        _setupColumnNames: function(targetFilename) {

            // TODO: refactor this out into helper function

            // Disable select setup
            $('#' + this.inputCount + '-' + this.parameterType + '-combination-names-column').attr('disabled', true);
            $('#' + this.inputCount + '-' + this.parameterType + '-combination-first-barcode-column').attr('disabled', true);

            // Loading View setup
            var loadingViewA = new App.Views.Util.LoadingInline({keep: true});
            var loadingViewB = new App.Views.Util.LoadingInline({keep: true});

            this.insertView('#' + this.inputCount + '-' + this.parameterType + '-combination-names-column-section', loadingViewA);
            this.insertView('#' + this.inputCount + '-' + this.parameterType + '-combination-first-barcode-column-section', loadingViewB);

            loadingViewA.render();
            loadingViewB.render();

            var selectedFileMetadata = this.combinationFiles.find(function(combinationFile) {
                return combinationFile.get('value').name === targetFilename;
            });

            if (selectedFileMetadata) {

                var selectedFile = selectedFileMetadata.getFileModel();

                var that = this;
                selectedFile.downloadFileToMemory()
                    .always(function() {
                        loadingViewA.remove();
                        loadingViewB.remove();
                    })
                    .done(function(file) {
                        var columns = that._parseColumnNamesFromFirstLine(file);

                        // Remove old options
                        $('#' + that.inputCount + '-' + that.parameterType + '-combination-names-column > option').remove();
                        $('#' + that.inputCount + '-' + that.parameterType + '-combination-first-barcode-column > option').remove();

                        // Set new options
                        for (var i = 0; i < columns.length; i++) {
                            $('#' + that.inputCount + '-' + that.parameterType + '-combination-names-column')
                                .append('<option value="' + i + '">' + columns[i] + '</option>')
                                ;

                            $('#' + that.inputCount + '-' + that.parameterType + '-combination-first-barcode-column')
                                .append('<option value="' + columns[i] + '">' + columns[i] + '</option>')
                                ;
                        }

                        // Reenable select setup
                        $('#' + that.inputCount + '-' + that.parameterType + '-combination-names-column').attr('disabled', false);
                        $('#' + that.inputCount + '-' + that.parameterType + '-combination-first-barcode-column').attr('disabled', false);
                    })
                    .fail(function() {
                    })
                    ;
            }
        },
        _parseColumnNamesFromFirstLine: function(file) {
            var columnNames = [];

            try {
                var newlineSplit = file.split('\n');
                newlineSplit = newlineSplit[0];

                var commaSplit = newlineSplit.split(',');
                columnNames = commaSplit;
            }
            catch (e) {
            }

            return columnNames;
        },
        /*
        updateBarcodeInfo: function(barcodeInfo, elementCount) {
            this.barcodeInfo = barcodeInfo;

            this.elementCount = elementCount;

            this.render();
        },
        */
    });

    Vdjpipe.FindSharedSequences = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-find-shared-sequences',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Find Unique Sequences';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    /*
    Vdjpipe.FindSharedSequences = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
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

    Vdjpipe.Histogram = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-histogram',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Histogram';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.HomopolymerFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-homopolymer-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Homopolymer Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.LengthFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-length-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Length Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MatchExternalMolecularIdentifier = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-match-external-molecular-identifier',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Match External Molecular Identifier';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MergePairedReads = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-merge-paired-reads',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Merge Paired Reads';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MinimalAverageQualityFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-min-average-quality-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Minimum Average Quality Window Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MinimalQualityFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-min-quality-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Minimum Quality Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.MinimalQualityWindowFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-min-quality-window-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Minimum Quality Window Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.NucleotideFilter = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-nucleotide-filter',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Nucleotide Filter';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
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

    Vdjpipe.QualityStats = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-quality-stats',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Generate Quality Statistics';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.Statistics = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-statistics',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Generate Quality and Composition Statistics';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });


    /*
    Vdjpipe.TextImmutable = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
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

    Vdjpipe.WriteSequence = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-write-sequences',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Write Sequences';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    Vdjpipe.WriteValue = App.Views.Generic.Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-write-values',
        initialize: function(options) {
            this.vdjpipeOptionTitle = 'Write Values';
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    App.Views.Vdjpipe = Vdjpipe;
    return Vdjpipe;
});
