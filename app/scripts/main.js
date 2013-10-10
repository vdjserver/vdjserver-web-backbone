
define([
    'app',
    'handlebars',
    'jquery',
    'bootstrap',
    'backbone.syphon',
    'moment',

    // Agave
    'backbone-agave',
    'backbone-agave-io',

    // VDJ
    'backbone-vdj',
    'backbone-vdj-account',
    'backbone-vdj-projects',

    'models/message',
    'models/form',

    // Views
    'app-views',
    'form-views',
    'util-views',
    'agave-auth',
    'agave-io',
    'account-views',
    'project-views',

    // Routers
    'router'

], function(App) {
    App.start();
});
