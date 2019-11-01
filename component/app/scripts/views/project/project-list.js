import Marionette from 'backbone.marionette';
import template from '../../../templates/project/project-summary.html';
import Handlebars from 'handlebars';

var ProjectSummaryView = Marionette.View.extend({
  template: Handlebars.compile(template),

  events: {
      'click #edit-project': 'editProject',
  },

  editProject: function(e) {
      console.log('child editProject');
      e.preventDefault();

      // navigate to the project page
      App.router.navigate('/project/' + this.model.get('uuid'), {trigger:true});
  },
});

export default Marionette.CollectionView.extend({
  initialize: function(parameters) {
    this.childView = ProjectSummaryView;
  },
});
