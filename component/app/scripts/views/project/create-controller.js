import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import CreateView from 'create-view';
import LoadingView from 'loading-view';
import create_template from '../../../templates/project/create.html';

// Create Controller: manages any views associated with creating a project
//
// this manages displaying project content
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="create"><h1>Create a Project</h1>' + create_template),

  // one region for the project content
  regions: {
    introRegion: '#intro',
    projectRegion: '#project',
    // singleRegion: '#projectsView'
  },

  initialize(options) {
    console.log('Initialize');
    this.projectList = null;
    this.currentProject = null;
    // this.createProject = null;
  },

//
// showCreatePage: function() {
//   if (! this.createProject) {
//       this.createProject = new CreateView();
//
//       var that = this;
//
//       // show a loading view while fetching the data
//       that.showChildView('projectRegion', new LoadingView({}));
//
//       // load the projects
//       this.createProject.fetch()
//       .then(function() {
//           console.log(that.createProject);
//           // create view with project data
//           var view = new CreateView({collection: that.createProject});
//           that.showChildView('projectRegion', view);
//       })
//       .fail(function(error) {
//         console.log(error);
//       });
//   } else {
//       // projects already loaded
//       // we need to create a new view each time
//       var view = new CreateView({collection: this.createProject});
//       this.showChildView('projectRegion', view);
//   }
// },
});
