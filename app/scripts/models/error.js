define(['app'], function(App){

    'use strict';

    var Error = Backbone.Model.extend({
        defaults: {
            message: '',
            type: '',
        },
        initialize: function(parameters) {
            if (parameters.message) {
                this.set('message', parameters.message);
            }

            if (parameters.type) {
                this.set('type', parameters.type);
            }
        },

    });

    App.Models.Error = Error;
    return Error;
});
