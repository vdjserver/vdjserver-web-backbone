define(['app'], function(App) {

    'use strict';

    var MessageModel = Backbone.Model.extend({
        defaults: {
            header: '',
            body:   ''
        }
    });

    App.Models.MessageModel = MessageModel;
    return MessageModel;
});
