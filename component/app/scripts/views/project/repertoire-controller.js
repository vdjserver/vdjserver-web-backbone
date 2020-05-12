import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';
import SingleRepView from 'rep-view';
import LoadingView from 'loading-view';
import single_rep from '../../../templates/project/single-repertoire.html';

// Repertoire Controller: manages any views associated with viewing a repertoire

// this manages displaying repertoire content
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="rep">' + single_rep),
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
