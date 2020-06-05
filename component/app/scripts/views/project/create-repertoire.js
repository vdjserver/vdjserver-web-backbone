/******************************************************
Configuring view for an "Create a Repertoire" page
********************************************************/

import Marionette from 'backbone.marionette';
import template from 'Templates/project/create-repertoire.html';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'agave-project';

var CreateRepView = Marionette.View.extend({
    template: Handlebars.compile("<h1>Testing Rep View</h1>")
});

export default Marionette.View.extend({
  template: Handlebars.compile("<h1>Hopefully this works!</h1>"),
  initialize: function(parameters) {
      this.childView = CreateRepView;
    },
});
