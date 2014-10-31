define([
    'app',
], function(App) {

    'use strict';

    var VdjpipeOptionView = Backbone.View.extend({

        // Public Methods
        initialize: function() {
            this.keep = false;
        },
        serialize: function() {
            return this._getSerializeObject();
        },

        // Private Methods
        _getSerializeObject: function() {

            var files = {};

            if (this.files && this.files.toJSON()) {
                files = this.files.toJSON();
            }

            // Options can occasionally be undefined, and this can
            // cause serialization issues if left unchecked.
            if (this.options.length === undefined) {
                this.options = '';
            }

            return {
                isEditable: this.isEditable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                files: files,
                options: this.options,
            };
        },
    });

    App.Views.Generic.VdjpipeOptionView = VdjpipeOptionView;
    return VdjpipeOptionView;
});
