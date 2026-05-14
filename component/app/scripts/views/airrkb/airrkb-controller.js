
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

import { AIRRKB } from 'Scripts/backbone/backbone-airrkb';
import AIRRKBInfo from 'Scripts/models/airrkb-info';
import { AKCollection } from 'Scripts/collections/airrkb-collection';
import { ADCRearrangementCollection } from 'Scripts/collections/adc-rearrangements';
import { StudyCacheCollection, RepertoireCacheCollection } from 'Scripts/collections/adc-cache-collections';
import { RearrangementCounts } from 'Scripts/collections/adc-statistics';

import { PublicProject } from 'Scripts/models/agave-project';
import { PublicProjectCollection } from 'Scripts/collections/agave-projects';
import AirrkbMainView from 'Scripts/views/airrkb/airrkb-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
// import AddChartView from 'Scripts/views/community/add-chart';
import LoadingQueryView from 'Scripts/views/utilities/loading-adc-query-view';

import FilterController from 'Scripts/views/utilities/filter-controller';

// Community controller
function AirrkbController() {
    // the project view
    this.projectView = new AirrkbMainView({controller: this});

    // maintain state across multiple views
    this.repositoires = null;
    this.repositoryInfo = null;
    this.repertoireCollections = null;
    this.studies = null;
    this.publications = null;
    this.repertoireFilters = null;
    this.filteredStudies = null;
    this.projectList = null;
    this.currentProject = null;
    this.studyCache = null;
    this.repertoireCache = null;
    this.rearrangementCounts = null;

    // active filters
    this.filterController = new FilterController(this, "adc_rearrangement", true, "adc_rearrangement");
    this.filterController.airrkbSearch = true;
    this.filterController.showFilter();

    // statistics
    this.show_statistics = true;

    // active visualizations
    this.visualizationController = null;
}

AirrkbController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.projectView)
            this.projectView = new AirrkbMainView({controller: this});
        else if (this.projectView.isDestroyed())
            this.projectView = new AirrkbMainView({controller: this});
        return this.projectView;
    },

    showInitStatistics(queryString) {
        this.statistics = {};
        this.statistics['num_of_complexes'] = 'XXX'; // this.length;
        this.statistics['num_of_receptors'] = 'XXX'; // colls['receptor'].length; // TODO: we need akc_id from API
        this.statistics['num_of_epitopes'] = 'XXX'; // colls['epitope'].length;
        this.statistics['num_of_mhcs'] = 0;
        this.statistics['num_of_chains'] = 'XXX'; // colls['chain'].length;
        this.statistics['num_of_paired_chains'] = 0;
        this.statistics['num_of_investigations'] = 'XXX'; // colls['investigation'].length;
        this.statistics['num_of_assays'] = 'XXX'; // colls['assay'].length;
        this.statistics['num_of_participants'] = 'XXX'; // colls['participant'].length;
        this.statistics['num_of_specimens'] = 'XXX'; // colls['specimen'].length;

        this.projectView.showResultsList();
        this.filterController.showFilter();
    },

    // show community data portal studies
    // showProjectList(queryString, projectUuid) {
    //      if (! this.studies) {
    //         // this.repositoires = new Backbone.Collection();
    //         // var repos = ADC.Repositories();
    //         // console.log(Object.keys(repos).length);

    //         this.projectList = new PublicProjectCollection();
    //         this.studyCache = new StudyCacheCollection();

    //         var that = this;
    //         var total_reps = 0;

    //         // show a loading view while fetching the data
    //         // loading from single repo
    //         this.projectView.showLoading(0, 0, 1, 0);

    //         // fetch the AKC repository info
    //         this.repositoryInfo = new Backbone.Collection();
    //         var promises = [];
    //         let info = new AIRRKBInfo();
    //         // info.set('id', r);
    //         this.repositoryInfo.add(info);
    //         const p = info.fetch({timeout: 10000}).then(function(res) {
    //             //console.log(info);
    //             promises.splice(promises.indexOf(p), 1);
    //             console.log('resolved');
    //             return res;
    //         })
    //         .fail(function(error) {
    //             // remove from list of repos
    //             // delete repos[info.get('id')];
    //             that.repositoryInfo.remove(info);
    //             //console.log(info);
    //             console.log('error: ' + JSON.stringify(error));
    //             if (error['statusText'] == 'timeout') {
    //                 info.set('error', 'timeout');
    //                 console.log("timeout");
    //             } else info.set('error', error)
    //         });
    //         promises.push(p);
            

    //         // TODO: handle when a repository is down
    //         Promise.allSettled(promises)
    //         .then(function() {
    //             console.log(that.repositoryInfo);

    //             that.repertoireCollection = new AKCollection();
    //             var promises = [];
                
    //             const p = that.repertoireCollection.fetch().then(res => {
                    
    //                 // how to fix??
    //                 // total_reps += res['Repertoire'].length;

    //                 // update loading screen with running total
    //                 // not showing total_reps rn, one repo, count incrimented
    //                 that.projectView.showLoading(total_reps, 1, 1, 0);
    //                 return res;
    //             })
    //             .fail(function(error) {
    //                 console.log('error: ' + JSON.stringify(error));
    //             });
    //             promises.push(p);
    //             console.log('1');

    //             // load the ADC repertoires
    //             return Promise.allSettled(promises);
    //         })
    //         // .then(function() {
    //         //     // load VDJServer public projects
    //         //     // TODO: skip for now
    //         //     //return that.projectList.fetch();
    //         //     return;
    //         // })
    //         // .then(function() {
    //         //     // load AKC download study cache entries
    //         //     console.log('2');
    //         //     return that.studyCache.fetch();
    //         // })
    //         // .then(function() {
    //         //     try {
    //         //         // load statistics
    //         //         that.rearrangementCounts = {};
    //         //         promises = [];
    //         //         var thecnt = 0;
    //         //         for (var r in repos) {
    //         //             // which repositories support stats?
    //         //             if (! repos[r]['stats_path']) {
    //         //                 thecnt += 1;
    //         //                 continue;
    //         //             }
    //         //             let reps = that.repertoireCollection[r];
    //         //             var coll = new RearrangementCounts(null, { repertoires: reps });
    //         //             that.rearrangementCounts[r] = coll;
    //         //             const p = coll.fetch().then(res => {
    //         //                 //promises.splice(promises.indexOf(p), 1);
    //         //                 thecnt += 1;
    //         //                 // update loading screen with running total
    //         //                 that.projectView.showLoading(total_reps, Object.keys(repos).length, Object.keys(repos).length, thecnt);
    //         //                 return res;
    //         //             });
    //         //             promises.push(p);
    //         //         }

    //         //         return Promise.allSettled(promises);
    //         //     } catch (e) {
    //         //         // mainly for catching coding errors
    //         //         console.error(e);
    //         //         console.error(e.stack);
    //         //         throw e;
    //         //     }
    //         // })
    //         .then(function() {
    //             // try {
    //             //     console.log(that.projectList);
    //             //     console.log(that.studyCache);
    //             //     console.log(that.rearrangementCounts);

    //             //     that.studies = new AKCollection();
    //             //     console.log(that.repertoireCollection);
    //             //     that.studies.normalize(that.repertoireCollection); 
                    
    //             //     that.studies.attachCacheEntries(that.studyCache);
    //             //     that.studies.attachCountStatistics(that.rearrangementCounts);
    //             //     console.log(that.studies);

    //             //     // construct filter values
    //             //     that.filterController.constructValues(that.studies);

    //             //     // have the view display them
    //             //     if (queryString) {
    //             //         // filter on specific Study ID if provided
    //             //         var filters = that.filterController.queryStringToFilter(queryString);
    //             //         //App.router.navigate('/community?study_id='+filters.filters[0].value, {trigger: false});
    //             //         App.router.navigate('/akc', {trigger: false});
    //             //         // console.log("I'm in CommunityController showProjectList");
    //             //         that.filterController.applyFilter(filters, { filters: [] });
    //             //     } else if (projectUuid) {
    //             //         var filters = {full_text_search: projectUuid, filters: [] };
    //             //         App.router.navigate('/akc', {trigger: false});
    //             //         that.filterController.applyFilter(filters, { filters: [] });
    //             //     } else {
    //             //         that.projectView.showResultsList(that.studies);
    //             //         that.filterController.showFilter();
    //             //     }
    //             // } catch (e) {
    //             //     // mainly for catching coding errors
    //             //     console.error(e);
    //             //     console.error(e.stack);
    //             //     throw e;
    //             // }
    //             that.projectView.showResultsList(that.repertoireCollection);
    //             console.log('3');
    //         })
    //         .catch(function(error) {
    //             console.log('error from Promise.allSettled: ' + JSON.stringify(error));
    //         });
    //     } else {
    //         // projects already loaded
    //         // have the view display them
    //         if (queryString) {
    //             // filter on specific Study ID if provided
    //             var filters = that.filterController.queryStringToFilter(queryString);
    //             App.router.navigate('/community?study_id='+filters.filters[0].value, {trigger: false});
    //             that.filterController.applyFilter(filters, { filters: [] });
    //         } else if (projectUuid) {
    //             var filters = {full_text_search: projectUuid, filters: [] };
    //             App.router.navigate('/community', {trigger: false});
    //             that.filterController.applyFilter(filters, { filters: [] });
    //         } else {
    //             this.projectView.showResultsList(this.studies);
    //             this.filterController.showFilter();
    //         }
    //     }
    // },

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

    queryRearrangements: async function(filters) {
        // generate query to AIRR Knowledge first
        var ak = new AKCollection(null);
        ak.addFilters(filters);
        var that = this;
        let akResults = await this.doQuery(ak)
            .then(function() {
                that.akResults = ak;
                that.akResults.calcStatistics();
                console.log('akResults', ak);
            })
            .catch(function(error) {
                console.log('error from query: ' + JSON.stringify(error));
                //return Promise.resolve();
            });

        // this.filteredStudies.attachCountStatistics(this.rearrangementCounts);

        // this.filteredStudies.sort_by = this.studies.sort_by;
        // this.filteredStudies.sort();

        // App.AppController.navController.emptyMessageBar();
        // this.projectView.showResultsList(this.filteredStudies);

        if (this.akResults) this.projectView.updateCharts(null, this.akResults);
    },

    applyFilter: function(unused_filter, filter) {
        if (filter) {
            this.queryRearrangements(filter);

            // this.filteredRepertoires.sort_by = this.repertoireList.sort_by;
            // this.filteredRepertoires.sort();
        } else this.akResults = null;
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
export default AirrkbController;
