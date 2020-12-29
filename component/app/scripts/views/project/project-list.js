import Marionette from 'backbone.marionette';
import template from 'Templates/project/project-summary.html';
import Handlebars from 'handlebars';

var ProjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(template),
    tagName: 'div',
    className: 'community-project',

  events: {
      'click #edit-project': 'editProject',
      'click .study-desc-more': function(e) {
          // console.log("clicked expand for desc");
          $(event.target).parent(".community-study-desc").addClass("no-display");

          $(event.target).parent(".community-study-desc").siblings(".community-study-desc-full").removeClass("no-display");
      },
      'click .study-desc-collapse': function(e) {
          // console.log("clicked collapse for desc");
          $(event.target).parent(".community-study-desc-full").addClass("no-display");

          $(event.target).parent(".community-study-desc-full").siblings(".community-study-desc").removeClass("no-display");
      }
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
