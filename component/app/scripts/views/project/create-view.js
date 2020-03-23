/******************************************************
Configuring view for an "Create a Project" page
********************************************************/

import Marionette from 'backbone.marionette';
import template from '../../../templates/project/create.html';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'agave-project';

var CreateProjectView = Marionette.View.extend({
    template: Handlebars.compile("<h1>Testing</h1>")
    // tagName: 'tr',

  // events: {
  //     'click #edit-project': 'editProject',
  // },
});

export default Marionette.View.extend({
  template: Handlebars.compile("<h1>Hopefully this works!</h1>"),
  initialize: function(parameters) {
      this.childView = CreateProjectView;
    },
});
