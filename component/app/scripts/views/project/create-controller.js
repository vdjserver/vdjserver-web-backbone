import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import CreateView from 'create-view';
import LoadingView from 'loading-view';

import create_template from '../../../templates/project/create.html';

// Create Controller: manages any views associated with creating a project
//
// this manages displaying project content
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="create">' + create_template),
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
  },

  // showCreatePage() {
  //   console.log('showCreatePage');
  //
  //   // create project controller if needed
  //   if (! this.createController) {
  //     this.createController = new CreateController();
  //   }
  //   this.showChildView('mainRegion', this.createController);
  //
  //   // tell navigation controller to display its private nav bar
  //   this.navController.showPrivateNavigation();
  //
  //   // tell create controller to display the create a project page
  //   this.createController.showCreatePage();
  // }
});
