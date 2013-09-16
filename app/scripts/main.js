
define([
    'app',
    'handlebars',
    'jquery',
    'bootstrap',
    'backbone.syphon',
    'moment',

    'backbone-agave',
    'backbone-agave-io',
    'backbone-agave-jobs',
    'backbone-agave-apps',

    'vendor/backbone-vdj/backbone-vdj',

    'models/message',
    'models/form',
    'models/account',

    'views/app-views',
    'views/form-views',
    'views/util-views',
    'views/agave-auth',
    'views/agave-io',
    'views/agave-apps',
    'views/account-views',

    'routers/default'

], function(App) {
    App.start();
});
