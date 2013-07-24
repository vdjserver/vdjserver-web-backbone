define(['app'], function(App){
  var MainLayoutView = Backbone.View.extend({
    template: 'main'
  });

  App.Views.MainLayoutView = MainLayoutView;
  return MainLayoutView;
});
