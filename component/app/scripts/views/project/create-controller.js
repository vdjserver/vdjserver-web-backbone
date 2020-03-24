import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import CreateView from 'create-view';
import LoadingView from 'loading-view';
// import CreateController from 'create-controller';

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
  }
});
