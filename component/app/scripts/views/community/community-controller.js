
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

import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import Handlebars from 'handlebars';

import { ADC } from 'Scripts/backbone/backbone-adc';
import ADCInfo from 'Scripts/models/adc-info';
import { ADCRepertoireCollection, ADCStudyCollection } from 'Scripts/collections/adc-repertoires';
import { StudyCacheCollection, RepertoireCacheCollection } from 'Scripts/collections/adc-cache-collections';
import { RearrangementCounts } from 'Scripts/collections/adc-statistics';

import Project from 'Scripts/models/agave-project';
import ProjectList from 'Scripts/collections/agave-public-projects';
import CommunityMainView from 'Scripts/views/community/community-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
// import AddChartView from 'Scripts/views/community/add-chart';

import FilterController from 'Scripts/views/utilities/filter-controller';

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
    this.repertoireFilters = null;
    this.filteredStudies = null;
    this.projectList = null;
    this.currentProject = null;
    this.studyCache = null;
    this.repertoireCache = null;
    this.rearrangementCounts = null;

    // active filters
    this.filterController = new FilterController(this, "adc_study", true);
    this.filterController.showFilter();

    // statistics
    this.show_statistics = true;

    // active visualizations
    this.visualizationController = null;
}

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
    showProjectList(projectUuid) {
        if (! this.studies) {
            this.repositoires = new Backbone.Collection();
            var repos = ADC.Repositories();
            console.log(Object.keys(repos).length);

            this.projectList = new ProjectList();
            this.studyCache = new StudyCacheCollection();

            var that = this;
            var total_reps = 0;

            // show a loading view while fetching the data
            this.projectView.showLoading(0, 0, Object.keys(repos).length, 0);

            // fetch the ADC repository info
            this.repositoryInfo = new Backbone.Collection();
            var promises = [];
            for (var r in repos) {
                let info = new ADCInfo({repository: r});
                info.set('id', r);
                this.repositoryInfo.add(info);
                const p = info.fetch({timeout: 10000}).then(function(res) {
                    //console.log(info);
                    promises.splice(promises.indexOf(p), 1);
                    console.log('resolved');
                    return res;
                })
                .fail(function(error) {
                    // remove from list of repos
                    delete repos[info.get('id')];
                    that.repositoryInfo.remove(info);
                    //console.log(info);
                    console.log('error: ' + JSON.stringify(error));
                    if (error['statusText'] == 'timeout') {
                        info.set('error', 'timeout');
                        console.log("timeout");
                    } else info.set('error', error)
                });
                promises.push(p);
            }

            // TODO: handle when a repository is down
            Promise.allSettled(promises)
            .then(function() {
                console.log(that.repositoryInfo);

                that.repertoireCollection = {};
                var promises = [];
                var thecnt = 0;
                for (var r in repos) {
                    var coll = new ADCRepertoireCollection(null, {repository: r});
                    that.repertoireCollection[r] = coll;
                    const p = coll.fetch().then(res => {
                        //promises.splice(promises.indexOf(p), 1);
                        thecnt += 1;
                        total_reps += res['Repertoire'].length;
                        // update loading screen with running total
                        that.projectView.showLoading(total_reps, thecnt, Object.keys(repos).length, 0);
                        return res;
                    })
                    .fail(function(error) {
                        console.log('error: ' + JSON.stringify(error));
                    });
                    promises.push(p);
                }

                // load the ADC repertoires
                return Promise.allSettled(promises);
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
                try {
                    // load statistics
                    that.rearrangementCounts = {};
                    promises = [];
                    var thecnt = 0;
                    for (var r in repos) {
                        // which repositories support stats?
                        if (! repos[r]['stats_path']) {
                            thecnt += 1;
                            continue;
                        }
                        let reps = that.repertoireCollection[r];
                        var coll = new RearrangementCounts(null, { repertoires: reps });
                        that.rearrangementCounts[r] = coll;
                        const p = coll.fetch().then(res => {
                            //promises.splice(promises.indexOf(p), 1);
                            thecnt += 1;
                            // update loading screen with running total
                            that.projectView.showLoading(total_reps, Object.keys(repos).length, Object.keys(repos).length, thecnt);
                            return res;
                        });
                        promises.push(p);
                    }

                    return Promise.allSettled(promises);
                } catch (e) {
                    // mainly for catching coding errors
                    console.error(e);
                    console.error(e.stack);
                    throw e;
                }
            })
            .then(function() {
                try {
                    console.log(that.projectList);
                    console.log(that.studyCache);
                    console.log(that.rearrangementCounts);

                    that.studies = new ADCStudyCollection();
                    for (var r in repos) {
                        console.log(that.repertoireCollection[r]);
                        that.studies.normalize(that.repertoireCollection[r]);
                    }
                    that.studies.attachCacheEntries(that.studyCache);
                    that.studies.attachCountStatistics(that.rearrangementCounts);
                    console.log(that.studies);

                    // construct filter values
                    that.filterController.constructValues(that.studies);

                    // have the view display them
                    if (projectUuid) {
                        // filter on specific VDJServer uuid if provided
                        console.log(projectUuid);
                        var filters = {filters: [{field: "study.vdjserver_uuid", value: projectUuid, title: "VDJServer UUID"}]};
                        App.router.navigate('/community', {trigger: false});
                        that.filterController.applyFilter(filters);
                    } else {
                        that.projectView.showResultsList(that.studies);
                        that.filterController.showFilter();
                    }
                } catch (e) {
                    // mainly for catching coding errors
                    console.error(e);
                    console.error(e.stack);
                    throw e;
                }
            })
            .catch(function(error) {
                console.log('error from Promise.allSettled: ' + JSON.stringify(error));
            });
        } else {
            // projects already loaded
            // have the view display them
            if (projectUuid) {
                // filter on specific VDJServer uuid if provided
                console.log(projectUuid);
                var filters = {filters: [{field: "study.vdjserver_uuid", value: projectUuid, title: "VDJServer UUID"}]};
                App.router.navigate('/community', {trigger: false});
                this.filterController.applyFilter(filters);
            } else {
                this.projectView.showResultsList(this.studies);
                this.filterController.showFilter();
            }
        }
    },

    // returns all the main non-filtered collections
    getCollections() {
        return {
            repositoryInfo: this.repositoryInfo,
            repertoireCollection: this.repertoireCollection,
            studyList: this.studies,
            projectList: this.projectList,
            rearrangementCounts: this.rearrangementCounts
        }
    },

    applyFilter(filters) {
        if (filters) {
            this.filteredStudies = new ADCStudyCollection();
            this.filteredRepertoires = {};
            for (var i = 0; i < this.repositoryInfo.length; ++i) {
                var repo = this.repositoryInfo.at(i);
                var r = repo.get('id');
                this.filteredRepertoires[r] = this.repertoireCollection[r].filterCollection(filters);
                this.filteredStudies.normalize(this.filteredRepertoires[r]);
            }
            this.filteredStudies.attachCountStatistics(this.rearrangementCounts);

            this.filteredStudies.sort_by = this.studies.sort_by;
            this.filteredStudies.sort();

            this.projectView.showResultsList(this.filteredStudies);
        } else {
            this.filteredStudies = null;
            this.filteredRepertoires = null;
            this.projectView.showResultsList(this.studies);
        }
    },

    applySort(sort_by) {
        this.studies.sort_by = sort_by;
        this.studies.sort();
        if (this.filteredStudies) {
            this.filteredStudies.sort_by = sort_by;
            this.filteredStudies.sort();
            this.projectView.updateSummary(this.filteredStudies);
        } else {
            this.projectView.updateSummary(this.studies);
        }
    },

    shouldToggleStatisticsBar: function() {
        return true;
    },

    didToggleStatisticsBar: function(status) {
        this.show_statistics = status;
    },

    showStatistics: function() {
        return this.show_statistics;
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
