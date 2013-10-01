
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

    'backbone-vdj',
    'backbone-vdj-account',
    'backbone-vdj-projects',

    'models/message',
    'models/form',

    'views/app-views',
    'views/form-views',
    'views/util-views',
    'views/agave-auth',
    'views/agave-io',
    'views/agave-apps',
    'views/account-views',
    'views/project-views',

    'routers/default'

], function(App) {
    App.start();
});
