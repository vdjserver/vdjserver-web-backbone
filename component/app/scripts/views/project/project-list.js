import Marionette from 'backbone.marionette';
import template from '../../../templates/project/project-summary.html';
import Handlebars from 'handlebars';

var ProjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(template),
    tagName: 'tr',

  events: {
      'click #edit-project': 'editProject'
  },

  editProject: function(e) {
      console.log('child editProject');
      e.preventDefault();

      // navigate to the project page
      App.router.navigate('/project/' + this.model.get('uuid'), {trigger:true});
  },
});

export default Marionette.CollectionView.extend({
    template: Handlebars.compile("<thead class='thead-light'><tr><th scope='col'>Projects</th><th scope='col'>Summary</th><th scope='col'>Date Created</th><th scope='col'>Tasks</th></tr></thead>"),
    tagName: 'table',
    className: 'table',
    initialize: function(parameters) {
    this.childView = ProjectSummaryView;
  },
});
