define(['app'], function(App){
    'use strict';

    var FooterLayoutView = Backbone.View.extend({
        render: function () {
            $(this.el).html('<h1>Hello world</h1>');
            return this;
        }
    });

    App.Views.FooterLayoutView = FooterLayoutView;
    return FooterLayoutView;
});
