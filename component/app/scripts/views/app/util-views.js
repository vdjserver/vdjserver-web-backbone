define(['app'], function(App) {
    'use strict';

    var Util = {};

    Util.Message = Backbone.View.extend({
        template: 'util/message',
        serialize: function() {
            return this.model.toJSON();
        },
    });

    Util.Loading = Backbone.View.extend({
        template: 'util/loading',
        initialize: function(parameters) {
            if (parameters && parameters.displayText) {
                this.displayText = parameters.displayText;
            }
            else {
                this.displayText = 'Loading...';
            }
        },
        serialize: function() {
            return {
                displayText: this.displayText,
            };
        },
    });

    Util.LoadingInline = Util.Loading.extend({
        template: 'util/loading-inline',
    });

    Util.Alert = Backbone.View.extend({
        template: 'util/alert',
        attributes: function() {
            var that = this;
            return {
                'class': function() {
                    return 'alert alert-' + that.options.type;
                }
            };
        },
        serialize: function() {
            return this.model.toJSON();
        },
    });

    Util.ModalMessage = Backbone.View.extend({
        template: 'util/modal-message',
        serialize: function() {
            return this.model.toJSON();
        },
        getModel: function() {
            return this.model;
        },
    });

    Util.ModalMessageConfirm = Backbone.View.extend({
        template: 'util/modal-message-confirm',
        serialize: function() {
            return this.model.toJSON();
        },
        getModel: function() {
            return this.model;
        },
    });

    App.Views.Util = Util;
    return Util;
});
