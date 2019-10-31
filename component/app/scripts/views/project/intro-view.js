import Marionette from 'backbone.marionette';
import template from '../../../templates/project/intro.html';
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';


export default Marionette.View.extend({
  template: Handlebars.compile(template)
});
