define(['app'], function(App) {

    'use strict';

    var NotFound = {};

    NotFound.Error = Backbone.View.extend({
        template: 'notfound/404',
    });

    App.Views.NotFound = NotFound;
    return NotFound;
});
