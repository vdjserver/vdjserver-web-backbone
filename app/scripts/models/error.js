define(['app'], function(App) {

    'use strict';

    var Error = Backbone.Model.extend({
        defaults: {
            message: '',
            type: '',
        },
        initialize: function(parameters) {

            Backbone.Agave.Model.prototype.initialize.apply(this, [parameters]);

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
