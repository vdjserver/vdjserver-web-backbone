import Marionette from 'backbone.marionette';
import template from '../../../templates/project/project-summary.html';
import Handlebars from 'handlebars';

var ProjectSummaryView = Marionette.View.extend({
  template: Handlebars.compile(template)
});

export default Marionette.CollectionView.extend({
  initialize: function(parameters) {
    this.childView = ProjectSummaryView;
  },

});
