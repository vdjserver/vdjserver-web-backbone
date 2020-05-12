/******************************************************
Configuring view for a "Single Repertoire" page
********************************************************/

import Marionette from 'backbone.marionette';
import template from '../../../templates/project/single-repertoire.html';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'agave-project';

var SingleRepView = Marionette.View.extend({
    template: Handlebars.compile("<h1>Testing Rep View</h1>")
});

export default Marionette.View.extend({
  template: Handlebars.compile("<h1>Hopefully this works!</h1>"),
  initialize: function(parameters) {
      this.childView = SingleRepView;
    },
});
