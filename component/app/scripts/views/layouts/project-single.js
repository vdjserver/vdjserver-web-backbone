 /******************************************************
 Configuring view for a single project page
********************************************************/

import Marionette from 'backbone.marionette';
import template from '../../../templates/project/single.html';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'agave-project';

export default Marionette.View.extend({
  template: Handlebars.compile(template),
  regions: {
    navigationRegion: '#navigation'
  },

  projectList: null,

  initialize: function(parameters) {
    if (parameters && parameters.projectUuid) {
      this.projectUuid = parameters.projectUuid;
    }

    //var nav_view = new NavigationView();
    //this.showChildView('navigationRegion', nav_view);

    this.project = new Project({uuid: this.projectUuid});

    var that = this;
    this.project.fetch()
         .then(function() {
           console.log(that.project);
           //var project_view = new ProjectListView({collection: that.projectList});
           //that.showChildView('mainRegion', project_view);
         })
         .fail(function(error) {
           console.log(error);
         });

  },
});
