
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
import { ADCRearrangementCollection } from 'Scripts/collections/adc-rearrangements';
import { StudyCacheCollection, RepertoireCacheCollection } from 'Scripts/collections/adc-cache-collections';
import { RearrangementCounts } from 'Scripts/collections/adc-statistics';

import Project from 'Scripts/models/agave-project';
import ProjectList from 'Scripts/collections/agave-public-projects';
import CommunityMainView from 'Scripts/views/community/community-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
// import AddChartView from 'Scripts/views/community/add-chart';
import LoadingQueryView from 'Scripts/views/utilities/loading-adc-query-view';

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
    this.filterController = new FilterController(this, "adc_study", true, "adc_rearrangement");
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
    showProjectList(queryString) {
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
                // TODO: skip for now
                //return that.projectList.fetch();
                return;
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
                    if (queryString) {
                        // filter on specific Study ID if provided
                        var filters = that.filterController.queryStringToFilter(queryString);
                        App.router.navigate('/community?study_id='+filters.filters[0].value, {trigger: false});
                        // console.log("I'm in CommunityController showProjectList");
                        that.filterController.applyFilter(filters, { filters: [] });
                        // if (projectUuid) {
                    //     // filter on specific VDJServer uuid if provided
                    //     console.log(projectUuid);
                    //     var filters = {filters: [{field: "study.vdjserver_uuid", value: projectUuid, title: "VDJServer UUID"}]};
                    //     App.router.navigate('/community', {trigger: false});
                    //     that.filterController.applyFilter(filters);
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
            if (queryString) {
                // filter on specific Study ID if provided
                var filters = that.filterController.queryStringToFilter(queryString);
                App.router.navigate('/community?study_id='+filters.filters[0].value, {trigger: false});
                that.filterController.applyFilter(filters, { filters: [] });
                // if (projectUuid) {
            //     // filter on specific VDJServer uuid if provided
            //     console.log(projectUuid);
            //     var filters = {filters: [{field: "study.vdjserver_uuid", value: projectUuid, title: "VDJServer UUID"}]};
            //     App.router.navigate('/community', {trigger: false});
            //     this.filterController.applyFilter(filters);
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

    doQuery: function(coll) {
        return new Promise((resolve, reject) => {
            coll.fetch()
                .then(function(data) { resolve(data); })
                .fail(function(error) { reject(error); });
            });
    },

    queryRearrangements: async function(queryStudies, secondary_filters) {
        var total = queryStudies.length;

        var promises = [];
        var thecnt = 0;

        // show a loading view
        var view = new LoadingQueryView({queried_studies: thecnt, total_studies: total});
        App.AppController.navController.showMessageBar(view);

        // generate query for each study
        // TODO: we should do these in parallel for each repository
        // but in serial for one repository to not overload the server
        for (let i = 0; i < queryStudies.length; ++i) {
            var s = queryStudies.at(i);
            var repertoires = s.get('repertoires');
            var r = new ADCRearrangementCollection(null, {repository: s['repository'], repertoires: repertoires});
            r.addFilters(secondary_filters);

            var res = await this.doQuery(r)
                .catch(function(error) {
                    console.log('error from query: ' + JSON.stringify(error));
                    //return Promise.resolve();
                });

            // did it return any results?
            //console.log(res);
            if (res && res['Facet'] && (res['Facet'].length > 0)) {
                var c = new ADCRepertoireCollection(null, {repository: s.repository});
                for (let j = 0; j < res['Facet'].length; ++j) {
                    c.add(repertoires.get(res['Facet'][j]['repertoire_id']));
                }
                this.filteredStudies.normalize(c);
            }

            thecnt += 1;
            // update loading screen with running total
            App.AppController.navController.showMessageBar(new LoadingQueryView({queried_studies: thecnt, total_studies: total}));
        }
        this.filteredStudies.attachCountStatistics(this.rearrangementCounts);

        this.filteredStudies.sort_by = this.studies.sort_by;
        this.filteredStudies.sort();

        App.AppController.navController.emptyMessageBar();
        this.projectView.showResultsList(this.filteredStudies);
    },

    applyFilter: function(filters, secondary_filters) {
        console.log('first', filters);
        console.log('secondary', secondary_filters);
        // we apply the first filters first as we can do that locally
        if (filters) {
            this.filteredStudies = new ADCStudyCollection();
            this.filteredRepertoires = {};
            for (let i = 0; i < this.repositoryInfo.length; ++i) {
                var repo = this.repositoryInfo.at(i);
                var r = repo.get('id');
                this.filteredRepertoires[r] = this.repertoireCollection[r].filterCollection(filters);
                this.filteredStudies.normalize(this.filteredRepertoires[r]);
            }
            this.filteredStudies.attachCountStatistics(this.rearrangementCounts);

            this.filteredStudies.sort_by = this.studies.sort_by;
            this.filteredStudies.sort();

            //this.projectView.showResultsList(this.filteredStudies);
        } else {
            this.filteredStudies = null;
            this.filteredRepertoires = null;
            //this.projectView.showResultsList(this.studies);
        }

        // the secondary filters require a query on rearrangements
        if (secondary_filters) {
            var queryStudies = this.studies;
            if (this.filteredStudies) queryStudies = this.filteredStudies;

            // start with empty result and studies will be added as the queries finish
            if (queryStudies.length > 0) {
                this.filteredStudies = new ADCStudyCollection();
                this.queryRearrangements(queryStudies, secondary_filters);
            }
        }

        if (this.filteredStudies) this.projectView.showResultsList(this.filteredStudies);
        else this.projectView.showResultsList(this.studies);
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
