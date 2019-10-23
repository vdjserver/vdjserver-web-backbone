import Marionette from 'backbone.marionette';
import template from '../../templates/navbar/main.html';
import Handlebars from 'handlebars';
import NavigationView from 'navbar-view';
import ProjectListView from 'project-list';
import ProjectList from 'agave-projects';

export default Marionette.View.extend({
  template: Handlebars.compile(template),
  regions: {
    navigationRegion: '#navigation',
    mainRegion: '#main'
  },

  projectList: null,

  initialize: function(parameters) {
    var nav_view = new NavigationView();
    this.showChildView('navigationRegion', nav_view);

    this.projectList = new ProjectList();

    var that = this;

    this.projectList.fetch()
        .then(function() {
          console.log(that.projectList);
          var project_view = new ProjectListView({collection: that.projectList});
          that.showChildView('mainRegion', project_view);
        })
        .fail(function(error) {
          console.log(error);
        });

  },
});
