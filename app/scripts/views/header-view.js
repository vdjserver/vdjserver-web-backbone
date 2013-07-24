define(['app'], function(App){
  var HeaderView = Backbone.View.extend({
    template: 'header',
    className: 'header'
  });

  App.Views.HeaderView = HeaderView;
  return HeaderView;
});
