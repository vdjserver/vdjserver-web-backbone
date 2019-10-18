import Backbone from 'backbone';

export default Backbone.Model.extend({
        defaults: {
            header: '',
            body:   ''
        }
    });

/*
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
*/
