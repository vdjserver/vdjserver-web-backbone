define([
  'app',
  'environment-config',
  'recaptcha-ajax',
  'backbone.syphon',
  ], function(
    App,
    EnvironmentConfig
  ) {

    'use strict';

    var Community = {};

    Community.Index = Backbone.View.extend({
      template: 'community/community',
      events: {
        'click .paginate_button' : 'switchPage'
      },
      initialize: function() {
        this.community = new Backbone.Agave.Collection.Communities();
      },

      startChart: function(){
        var that = this;

        this.fetchData()
          .then(function() {
            return that.render();
          })
          .then(function() {
            that.$('#community').dataTable({
              responsive: true,
              pageLength: 10
            });
          });
      },

      serialize: function() {
        return {
          community: this.community.toJSON(),
        };
      },

      fetchData: function() {
        return this.community.fetch();
      },

    });

    App.Views.Community = Community;
    return Community;
  });
