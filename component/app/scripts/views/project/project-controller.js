import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import Project from 'agave-project';
import ProjectList from 'agave-projects';
import ProjectListView from 'project-list';
import ProjectPageView from 'project-single';
import intro_template from '../../../templates/project/intro.html';
// import IntroView from './intro-view';
import LoadingView from 'loading-view';

var IntroView = Marionette.View.extend({
  template: Handlebars.compile(intro_template)
});

// Project controller
//
// this manages displaying project content
export default Marionette.View.extend({
    template: Handlebars.compile('<div id="intro"><h1>Welcome!</h1><p>Welcome to your "My Projects" home page. Here, you\'ll find all of your projects, as well as various tasks.</p><button type="button" class="btn btn-primary" id="create-project">Create New Project</button></div><div id="project">'),
    //

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

  // displaying intro text before Project List
  showIntroView() {
      this.showChildView('introRegion', new IntroView());
  },

  showProjectList: function() {
    if (! this.projectList) {
        this.projectList = new ProjectList();

        var that = this;

        // show a loading view while fetching the data
        that.showChildView('projectRegion', new LoadingView({}));

        // load the projects
        this.projectList.fetch()
        .then(function() {
            console.log(that.projectList);
            // create view with project data
            var view = new ProjectListView({collection: that.projectList});
            that.showChildView('projectRegion', view);
        })
        .fail(function(error) {
          console.log(error);
        });
    } else {
        // projects already loaded
        // we need to create a new view each time
        var view = new ProjectListView({collection: this.projectList});
        this.showChildView('projectRegion', view);
    }
  },

  showProjectPage(projectUuid) {
    // if project list is not loaded yet, just fetch the single project
    if (! this.projectList) {
        this.currentProject = new Project({uuid: projectUuid});
        var that = this;
        this.currentProject.fetch()
            .then(function() {
                console.log(that.project);

                var view = new ProjectPageView({model: that.currentProject});
                this.showChildView('projectRegion', view);
                //that.showChildView('singleRegion', view);
            })
            .fail(function(error) {
                console.log(error);
            });
    } else {
        // get project from the list
        this.currentProject = this.projectList.get(projectUuid);
        if (! this.currentProject) {
            // ERROR: could not find project!
        }

        // show the current project view
        var view = new ProjectPageView({model: this.currentProject});
        this.showChildView('projectRegion', view);
    }
  },
});
