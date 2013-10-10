define(['app'], function(App){
    'use strict';

    var HeaderView = Backbone.View.extend({
        template: 'header',
        className: 'header'
    });

    App.Views.HeaderView = HeaderView;
    return HeaderView;
});
