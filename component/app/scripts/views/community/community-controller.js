
'use strict';

//
// community-controller.js
// Manages the community data page
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
import CommunityMainView from 'Scripts/views/community/community-main';
import LoadingView from 'Scripts/views/utilities/loading-view';

// Community controller
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
                // have the view display them
                that.projectView.showResultsList(that.studies);
            })
            .fail(function(error) {
                console.log(error);
            });
        } else {
            // projects already loaded
            // have the view display them
            this.projectView.showResultsList(this.projectList);
        }
    },

};
export default CommunityController;
