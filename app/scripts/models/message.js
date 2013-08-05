define(['app'], function(App){
    var MessageModel = Backbone.Model.extend({
        defaults: {
            header: '',
            body:   ''
        }
    });

    App.Models.MessageModel = MessageModel;
    return MessageModel;
});
