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
});
