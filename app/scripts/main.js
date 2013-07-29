require.config({
  paths: {
    'backbone': '../components/backbone/backbone',
    'bootstrap': 'vendor/bootstrap',
    'handlebars': '../components/handlebars/handlebars',
    'jquery': '../components/jquery/jquery',
    'layoutmanager': '../components/layoutmanager/backbone.layoutmanager',
    'moment': '../components/moment/moment',
    'underscore': '../components/underscore/underscore',

    'backbone-agave': 'vendor/backbone-agave/backbone-agave',
    'backbone-agave-apps': 'vendor/backbone-agave/backbone-agave-apps',
    'backbone-agave-jobs': 'vendor/backbone-agave/backbone-agave-jobs',
    'backbone-agave-io': 'vendor/backbone-agave/backbone-agave-io',
    'fileSaver': 'vendor/fileSaver'
  },
  shim: {
    handlebars: {
      exports: 'Handlebars'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    layoutmanager: {
      deps: ['backbone'],
      exports: 'layoutmanager'
    },
    bootstrap: {
      deps: ['jquery'],
      exports: 'jquery'
    },
    'backbone-agave': {
      deps: ['backbone'],
      exports: 'Backbone.Agave'
    },
    'backbone-agave-io': {
      deps: ['backbone', 'backbone-agave'],
      exports: 'Backbone.Agave.IO'
    },
    'backbone-agave-jobs': {
      deps: ['backbone', 'backbone-agave', 'backbone-agave-io'],
      exports: 'Backbone.Agave.Jobs'
    },
    'backbone-agave-apps': {
      deps: ['backbone', 'backbone-agave', 'backbone-agave-io', 'backbone-agave-jobs'],
      exports: 'Backbone.Agave.Apps'
    }
  }
});

define([
  'app',
  'jquery',
  'bootstrap',
  'moment',
  'handlebars',
  'backbone-agave',
  'backbone-agave-io',
  'backbone-agave-jobs',
  'backbone-agave-apps',
  
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
