import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import CreateRepView from 'create-rep';
import LoadingView from 'loading-view';
import create_rep from '../../../templates/project/create-rep.html';

// Create Rep: manages any views associated with creating a repertoire
//
// this manages displaying repertoire content
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="create">' + create_rep),
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
});
