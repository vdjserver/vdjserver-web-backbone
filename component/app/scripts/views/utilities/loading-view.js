import Marionette from 'backbone.marionette';
import template from 'Templates/util/loading.html';
import Handlebars from 'handlebars';

export default Marionette.View.extend({
  template: Handlebars.compile(template),
});
