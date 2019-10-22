import Marionette from 'backbone.marionette';
import template from '../../templates/navbar/main.html';
import Handlebars from 'handlebars';
import NavigationView from 'navbar-view';

export default Marionette.View.extend({
  template: Handlebars.compile(template),
  regions: {
    navigationRegion: '#navigation',
    mainRegion: '#main'
  },

  initialize: function(parameters) {
    var nav_view = new NavigationView();
    this.showChildView('navigationRegion', nav_view);

    //var project_view = new ProjectListView();
    //this.showChildView('main', project_view);
  },
});
