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

            $.fn.dataTableExt.oApi.fnFilterAll = function (oSettings, sInput, iColumn, bRegex, bSmart) {
             var settings = $.fn.dataTableSettings;

             for (var i = 0; i < settings.length; i++) {
                 settings[i].oInstance.fnFilter(sInput, iColumn, bRegex, bSmart);
             }
            };

            var community1 = that.$('#community').dataTable({
              responsive: true,
              pageLength: 10
            });


            that.$("#searchAll").keyup(function () {
                community1.fnFilterAll(this.value);
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
