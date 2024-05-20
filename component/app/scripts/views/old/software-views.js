define([
    'app',
], function(App) {

    'use strict';

    var Software = {};

    Software.Index = Backbone.View.extend({
        template: 'software/index',
    });

    App.Views.Software = Software;
    return Software;
});
