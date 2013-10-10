define(['app'], function(App){
    'use strict';

    var NavView = Backbone.View.extend({
        template: 'nav',
        className: 'navbar navbar-fixed-top'
    });

    App.Views.NavView = NavView;
    return NavView;
});
