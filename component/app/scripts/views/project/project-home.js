/******************************************************
Configuring view for a projects list page
********************************************************/

import Marionette from 'backbone.marionette';
import template from 'Templates/app/main.html';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import NavigationView from 'Scripts/views/navbar-view';
import IntroView from 'Scrips/views/project./intro-view';
import ProjectListView from 'Scripts/views/project/project-list';
import ProjectList from 'Scripts/collections/agave-projects';

export default Marionette.View.extend({
  template: Handlebars.compile(template),
  regions: {
    navigationRegion: '#navigation',
    mainRegion: '#main',
    introRegion: '#intro'
  },

  projectList: null,

  initialize: function(parameters) {
    var nav_view = new NavigationView();
    this.showChildView('navigationRegion', nav_view);

    var intro_view = new IntroView();
    this.showChildView('introRegion', intro_view);

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
