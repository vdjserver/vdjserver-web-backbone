define([
    'app',
], function(App) {

    'use strict';

    var VdjpipeOptionView = Backbone.View.extend({
        initialize: function() {
            this.keep = false;
        },
        getSerializeObject: function() {

            var files = {};

            if (this.files && this.files.toJSON()) {
                files = this.files.toJSON();
            }

            return {
                isEditable: this.isEditable,
                parameterType: this.parameterType,
                inputCount: this.inputCount,
                files: files,
                options: this.options,
            };
        },
        serialize: function() {
            return this.getSerializeObject();
        },
    });

    App.Views.Generic.VdjpipeOptionView = VdjpipeOptionView;
    return VdjpipeOptionView;
});
