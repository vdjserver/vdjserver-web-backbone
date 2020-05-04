/******************************************************
Configuring view for Files content area on a page
********************************************************/

import Marionette from 'backbone.marionette';
import template from '../../../templates/project/files.html';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'agave-project';

export default Marionette.View.extend({
  template: Handlebars.compile("the files page" + template)
  // childViewContainer: '.files'
});
