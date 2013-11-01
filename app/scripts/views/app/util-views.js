define(['app'], function(App){
    'use strict';

    var Util = {};

    Util.Message = Backbone.View.extend({
        template: 'util/message',
        serialize: function() {
            return this.model.toJSON();
        }
    });

    Util.Loading = Backbone.View.extend({
        template: 'util/loading',
        initialize: function() {
            if (! this.model) {
                this.model = new App.Models.MessageModel({body: 'Loading...'});
            }
        },
        serialize: function() {
            return this.model.toJSON();
        }
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
        }
    });

    Util.ModalMessage = Backbone.View.extend({
        template: 'util/modal-message',
        serialize: function() {
            return this.model.toJSON();
        },
        getModel: function() {
            return this.model;
        }
    });

    App.Views.Util = Util;
    return Util;
});
