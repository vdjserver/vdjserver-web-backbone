
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

import { ADC } from 'Scripts/backbone/backbone-adc';
import ADCInfo from 'Scripts/models/adc-info';
import { ADCRepertoireCollection, ADCStudyCollection } from 'Scripts/collections/adc-repertoires';

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
    this.repositoires = null;
    this.repositoryInfo = null;
    this.repertoireCollections = null;
    this.studies = null;
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

    // show community data portal studies
    showProjectList() {
        if (! this.studies) {
            this.repositoires = new Backbone.Collection();
            var repos = ADC.Repositories();
            console.log(Object.keys(repos).length);

            this.projectList = new ProjectList();

            var that = this;

            // show a loading view while fetching the data
            this.projectView.showLoading(0, 0, Object.keys(repos).length);

            // fetch the ADC repository info
            this.repositoryInfo = new Backbone.Collection();
            var promises = [];
            for (var r in repos) {
                var info = new ADCInfo({repository: r});
                info.set('id', r);
                this.repositoryInfo.add(info);
                promises.push(info.fetch());
            }

            // TODO: handle when a repository is down
            Promise.allSettled(promises)
            .then(function() {
                console.log(that.repositoryInfo);

                that.repertoireCollection = {};
                promises = [];
                for (var r in repos) {
                    var coll = new ADCRepertoireCollection({repository: r});
                    that.repertoireCollection[r] = coll;
                    promises.push(coll.fetch());
                }

                // load the ADC repertoires
                return Promise.allSettled(promises);
            })
            .then(function() {
                for (var r in repos) {
                    console.log(that.repertoireCollection[r]);
                }
                that.repertoires = that.repertoireCollection['vdjserver'];
                that.projectView.showLoading(that.repertoires.length, 1, 1);
            })
            .then(function() {
                // load VDJServer public projects
                that.projectList.fetch()
            })
            .then(function() {
                console.log(that.projectList);

                that.studies = new ADCStudyCollection();
                that.studies.normalize(that.repertoires);
                //that.studies = that.repertoires.normalize();
                console.log(that.studies);

                var tmp = that.studies.countByField('subject.sex');
                console.log(tmp);

                // have the view display them
                that.projectView.showResultsList(that.studies);
            })
            .catch(function(error) {
                console.log(error);
            });
        } else {
            // projects already loaded
            // have the view display them
            this.projectView.showResultsList(this.studies);
        }
    },

    // returns all the main non-filtered collections
    getCollections() {
        return {
            repositoryInfo: this.repositoryInfo,
            repertoireCollection: this.repertoireCollection,
            studyList: this.studies,
            projectList: this.projectList
        }
    },

    applyFilter() {
        // get current filter

        this.filteredList = this.repertoires.filterCollection();
        this.studies = new ADCStudyCollection();
        this.studies.normalize(this.filteredList);
        this.projectView.showResultsList(this.studies);
    }
};
export default CommunityController;