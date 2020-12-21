import Marionette from 'backbone.marionette';
import template from 'Templates/project/project-summary.html';
import Handlebars from 'handlebars';

var ProjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(template),
    tagName: 'div',
    className: 'community-project',

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
    template: Handlebars.compile("<div></div>"),
//     tagName: 'table',
//     className: 'table table-hover table-sm table-bordered',
    initialize: function(parameters) {
    this.childView = ProjectSummaryView;
  },
});
