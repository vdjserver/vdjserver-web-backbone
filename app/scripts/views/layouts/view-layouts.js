define([
    'app'
], function(App) {

    'use strict';

    var Layouts = {};

    // layouts
    //Layouts.HeaderLayout  = Backbone.Layout.extend();
    Layouts.MainLayout = Backbone.Layout.extend({
        el: '#main',
    });
    Layouts.SidebarLayout = Backbone.Layout.extend({
        template: 'layouts/project/project-sidebar',
    });
    Layouts.ContentLayout = Backbone.Layout.extend({
        template: 'layouts/project/project-content',
    });

    App.Views.Layouts = Layouts;
    return Layouts;
});