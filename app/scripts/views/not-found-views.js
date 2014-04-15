define(['app'], function(App) {

    'use strict';

    var NotFound = {};

    NotFound.Error = Backbone.View.extend({
        template: 'notfound/404',
        initialize: function() {
            console.log("rendeirn gnot found");
        }
    });

    App.Views.NotFound = NotFound;
    return NotFound;
});
