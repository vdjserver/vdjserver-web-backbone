
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
import { StudyCacheCollection, RepertoireCacheCollection } from 'Scripts/collections/adc-cache-collections';

import Project from 'Scripts/models/agave-project';
import ProjectList from 'Scripts/collections/agave-public-projects';
import CommunityMainView from 'Scripts/views/community/community-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
// import AddChartView from 'Scripts/views/community/add-chart';

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
    this.filteredRepertoires = null;
    this.filteredStudies = null;
    this.projectList = null;
    this.currentProject = null;
    this.studyCache = null;
    this.repertoireCache = null;

    // active filters
    this.filters = {};
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
            this.studyCache = new StudyCacheCollection();

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
                    var coll = new ADCRepertoireCollection(null, {repository: r});
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
                return that.projectList.fetch();
            })
            .then(function() {
                // load ADC download study cache entries
                return that.studyCache.fetch();
            })
            .then(function() {
                console.log(that.projectList);
                console.log(that.studyCache);

                that.studies = new ADCStudyCollection();
                for (var r in repos) {
                    //console.log(that.repertoireCollection[r]);
                    that.studies.normalize(that.repertoireCollection[r]);
                }
                that.studies.attachCacheEntries(that.studyCache);
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

    updateFilters(filters) {
        this.filters = filters;
        this.projectView.updateFilters(filters);
    },

    applyFilter(filters) {
        this.filters = filters;
        this.filteredStudies = new ADCStudyCollection();
        this.filteredRepertoires = {};
        for (var i = 0; i < this.repositoryInfo.length; ++i) {
            var repo = this.repositoryInfo.at(i);
            var r = repo.get('id');
            this.filteredRepertoires[r] = this.repertoireCollection[r].filterCollection(filters);
            this.filteredStudies.normalize(this.filteredRepertoires[r]);
        }

        //this.filteredList = this.repertoires.filterCollection();
        //this.studies = new ADCStudyCollection();
        //this.studies.normalize(this.filteredList);
        this.projectView.showResultsList(this.filteredStudies, filters);
    },

    applySort(sort_by) {
        this.studies.sort_by = sort_by;
        this.studies.sort();
    },

    // showAddChart() {
    //     console.log('showAddChart from community-controller.js');
    //
    //     this.chartView = new AddChartView();
    //
    //     this.projectView.showAddChart(this.chartView);
    //
    //     // this.showChildView('mainRegion', new AddChartView());
    // }
};
export default CommunityController;
