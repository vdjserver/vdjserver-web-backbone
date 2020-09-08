define([
    'app',
    'serialization-tools',
], function(App, SerializationTools) {

    'use strict';

    var Vdjpipe = {};

    Vdjpipe.BaseOptionView = Backbone.View.extend({

        // Public Methods
        initialize: function() {
            this.keep = false;
        },
        // Template Design Pattern
        prepareFiles: function() {

        },
        serialize: function() {
            return this._getSerializeObject();
        },

        // Private Methods
        _getSerializeObject: function() {
            var files = SerializationTools.GetSerializedModel(this.files);

            // Options can occasionally be empty, and this can
            // cause serialization issues if left unchecked.
            if (_.isArray(this.options) && _.isEmpty(this.options)) { //_.size(this.options) === 0) {
                this.options = '';
            }

            return {
                isOrderable: this.isOrderable,
                isRemovable: this.isRemovable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                files: files,
                options: this.options,
                vdjpipeOptionTitle: this.vdjpipeOptionTitle,
            };
        },
    });

    Vdjpipe.PrimerTrimming = Vdjpipe.BaseOptionView.extend({
        template: 'jobs/vdjpipe/vdjpipe-custom-primer-trimming',
        initialize: function(options) {
            App.Views.Generic.Vdjpipe.BaseOptionView.prototype.initialize.apply(this, [options]);
            this.render();
        },
    });

    App.Views.Generic.Vdjpipe = Vdjpipe;
    return Vdjpipe.BaseOptionView;
});
