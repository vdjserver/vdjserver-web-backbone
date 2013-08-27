define(['app'], function(App){
    'use strict';

    var MainLayoutView = Backbone.View.extend({
        template: 'main'
    });

    App.Views.MainLayoutView = MainLayoutView;
    return MainLayoutView;
});
