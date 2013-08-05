define(['app'], function(App) {
  var DefaultRouter = Backbone.Router.extend({
    routes: {

      '' : 'index',

      'auth'       : 'authIndex',
      'auth/login' : 'authLogin',
      'auth/new'   : 'authNew',
      'auth/check' : 'authCheck',
      'auth/active': 'authListActive',
      'auth/logout': 'authLogout',

      'account/new'    : 'accountNew',
      'account/profile': 'accountProfile',

      'apps/public': 'appsPublicList',
      'apps/shared': 'appsSharedList',
      'apps/:id'   : 'appsView',

      'io'         : 'ioBrowser',
      'io/:owner'  : 'ioBrowser',
      'io/:owner/*path': 'ioBrowser'

    },


    // Index
    index: function() {
      App.Layouts.main.template = 'one-col';
      App.Layouts.main.setView('.content', new App.Views.AppViews.Home());
      App.Layouts.main.render();
    },


    // Auth
    authLogin: function() {
      App.Layouts.main.template = 'one-col';
      App.Layouts.main.setView('.content', new App.Views.AgaveAuth.NewTokenForm({model: App.Agave.token()}));
      App.Layouts.main.render();
    },

    authNew: function() {
      App.Layouts.main.template = 'one-col';
      App.Layouts.main.setView('.content', new App.Views.AgaveAuth.NewTokenForm({model: new Backbone.Agave.Auth.Token()}));
      App.Layouts.main.render();
    },

    authListActive: function() {
      App.Layouts.main.template = 'one-col';
      App.Layouts.main.setView('.content', new App.Views.AgaveAuth.ActiveTokens({model: App.Agave.token()}));
      App.Layouts.main.render();
    },

    authLogout: function() {
      App.Agave.destroyToken();
      window.localStorage.removeItem('Agave.Token');
      App.router.navigate('', {trigger:true});
    },


    // Account
    accountNew: function() {
      App.Layouts.main.template = 'one-col';
      App.Layouts.main.setView('.content', new App.Views.Account.NewAccountForm({model: new App.Models.Account.NewAccount()}));
      App.Layouts.main.render();
    },

    accountProfile: function() {
        App.Layouts.main.template = 'one-col';
        App.Layouts.main.setView('.content', new App.Views.Account.ProfileForm({model: new App.Models.Account.Profile()}));
        App.Layouts.main.render();
    },


    // Apps
    appsPublicList: function() {
      App.Layouts.main.template = 'two-col';
      App.Layouts.main.setView('.sidebar', new App.Views.AgaveApps.AppList({collection: new Backbone.Agave.Apps.PublicApplications()}));
      App.Layouts.main.render();
    },

    appsSharedList: function() {
      App.Layouts.main.template = 'two-col';
      App.Layouts.main.setView('.sidebar', new App.Views.AgaveApps.AppList({collection: new Backbone.Agave.Apps.SharedApplications()}));
      App.Layouts.main.render();
    },

    appsView: function(id) {
      App.Layouts.main.template = 'one-col';
      App.Layouts.main.setView('.content', new App.Views.AgaveApps.AppView({model: new Backbone.Agave.Apps.Application({id:id})}));
      App.Layouts.main.render();
    },


    // IO
    ioBrowser: function(owner, path) {
      App.Layouts.main.template = 'one-col';
      var fullPath = owner || App.Agave.token().get('internalUsername');
      if (path) {
        fullPath += '/' + path;
      }
      App.Layouts.main.setView('.content',new App.Views.AgaveIO.Browser({collection: new Backbone.Agave.IO.Listing([], {path: fullPath})}));
      App.Layouts.main.render();
    }
  });


  App.Routers.DefaultRouter = DefaultRouter;
  return DefaultRouter;
});
