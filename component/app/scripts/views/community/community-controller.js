//
// community-controller.js
// Manages all the public project views
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
// Author: Olivia Dorsey <olivia.dorsey@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import ADCInfo from 'Scripts/models/adc-info';
import ADCRepertoires from 'Scripts/collections/adc-repertoires';

import Project from 'Scripts/models/agave-project';
import ProjectList from 'Scripts/collections/agave-public-projects';
import CommunityListView from 'Scripts/views/community/community-list';
import LoadingView from 'Scripts/views/utilities/loading-view';

// Community controller
// Community Stats View
import community_stats_template from 'Templates/community/community-stats.html';
var CommunityStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(community_stats_template)
});

// Community Query View
import community_query_template from 'Templates/community/community-query.html';
var CommunityQueryView = Marionette.View.extend({
    template: Handlebars.compile(community_query_template)
});

// this manages displaying project content
import community_list_template from 'Templates/community/community-list.html';
var CommunityMainView = Marionette.View.extend({
    template: Handlebars.compile(community_list_template),
    tagName: 'div',
    className: 'community-container',

    // one region for the project content
    regions: {
        statsRegion: '#community-statistics',
        queryRegion: '#community-query',
        projectRegion: '#community-project',
    },

    initialize(options) {
        console.log('Initialize');
        this.projectList = null;
        this.currentProject = null;

        this.showChildView('statsRegion', new CommunityStatisticsView ({model: this.model}));

        this.showChildView('queryRegion', new CommunityQueryView ({model: this.model}));

    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('projectRegion', new LoadingView({}));
    },

    // displaying intro text before Project List
    showIntro: function() {
        // create view for intro text

        var that = this;
        var introView = new IntroView({});
        that.showChildView('introRegion', introView);
    },

    showProjectList(projectList) {
        console.log(this.controller);
        var view = new CommunityListView({collection: projectList, controller: this.controller});
        this.showChildView('projectRegion', view);
    },

});

//
// Project controller
// manages all the different project views
//
function CommunityController() {
    // the project view
    this.projectView = new CommunityMainView({controller: this});

    // maintain state across multiple views
    this.projectList = null;
    this.currentProject = null;
};

CommunityController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.projectView)
            this.projectView = new CommunityMainView({controller: this});
        else if (this.projectView.isDestroyed())
            this.projectView = new CommunityMainView({controller: this});
        return this.projectView;
    },

    // show list of public projects
    showProjectList() {
        if (! this.projectList) {
            this.projectList = new ProjectList();

            var that = this;

            // show a loading view while fetching the data
            this.projectView.showLoading();

            // load the projects
            this.projectList.fetch()
            .then(function() {
                console.log(that.projectList);
                // have the view display them
                that.projectView.showProjectList(that.projectList);
            })
            .then(function() {
                that.repositoryInfo = new ADCInfo();
                return that.repositoryInfo.fetch();
            })
            .then(function() {
                console.log(that.repositoryInfo);
                that.repertoires = new ADCRepertoires();
                return that.repertoires.fetch();
            })
            .then(function() {
                console.log(that.repertoires);
                that.studies = that.repertoires.normalize();
                console.log(that.studies);
            })
            .fail(function(error) {
                console.log(error);
            });
        } else {
            // projects already loaded
            // have the view display them
            this.projectView.showProjectList(this.projectList);
        }
    },

};
export default CommunityController;
