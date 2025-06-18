//
// admin-controller.js
// Manages all the administration views
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
import Bootstrap from 'bootstrap';
import LoadingView from 'Scripts/views/utilities/loading-view';
import { ADCStatus } from 'Scripts/models/admin-vdjserver';
import { ProjectLoadCollection, RearrangementLoadCollection } from 'Scripts/collections/adc-admin-collections';
import { StudyCacheCollection, RepertoireCacheCollection } from 'Scripts/collections/adc-cache-collections';
import { PublicCollection } from 'Scripts/collections/agave-projects';
import AdminRepositoryView from 'Scripts/views/admin/admin-repository';
import AdminADCView from 'Scripts/views/admin/admin-adc';

// Admin card tabs for navigation
import tabs_template from 'Templates/admin/admin-tabs.html';
var AdminTabsView = Marionette.View.extend({
    template: Handlebars.compile(tabs_template),

    initialize: function(parameters) {

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.model) this.model = parameters.model;
        }
    },

    templateContext: function() {
        // gather the dynamic content for the cards
        // array of card tabs with fields
        // card id
        // is active flag
        // text to display
        var card_tabs = [];

        var card = {};
        card['card_id'] = 'overview-tab';
        card['text'] = 'Overview';
        card['icon'] = 'fas fa-vial';
        if (this.controller.page == 'overview') card['active'] = true;
        else card['active'] = false;
        if (! this.controller.page) card['active'] = true;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'users-tab';
        card['text'] = 'Users';
        card['icon'] = 'fas fa-vial';
        if (this.controller.repertoireList) {
            card['text'] = this.controller.repertoireList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'users') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'jobs-tab';
        card['text'] = 'Jobs';
        card['icon'] = 'fas fa-vial';
        if (this.controller.groupList) {
            card['text'] = this.controller.groupList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'jobs') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'repository-tab';
        card['text'] = 'Data Repository';
        card['icon'] = 'fas fa-vial';
        if (this.controller.publicProjectList) {
            card['text'] += '<br>' + this.controller.publicProjectList.length + ' Public Projects';
        }
        if (this.controller.projectLoadList) {
            card['text'] += '<br>' + this.controller.projectLoadList.length + ' Project Loads';
        }
        if (this.controller.page == 'repository') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'adc-tab';
        card['text'] = 'ADC Download Cache';
        card['icon'] = 'fas fa-vial';
        if (this.controller.studyCacheList) {
            if(this.controller.studyCacheList.length > 1) {
                card['text'] += '<br>' + this.controller.studyCacheList.length + ' Study Caches';
            } else {
                card['text'] += '<br>' + this.controller.studyCacheList.length + ' Study Cache';
            }
        }
        /*if (this.controller.repertoireCacheList) {
            if(this.controller.repertoireCacheList.length > 1) {
                card['text'] += '<br>' + this.controller.repertoireCacheList.length + ' Repertoire Caches';
            } else {
                card['text'] += '<br>' + this.controller.repertoireCacheList.length + ' Repertoire Cache';
            }
        }*/
        if (this.controller.page == 'adc') card['active'] = true;
        else card['active'] = false;
        if (! this.controller.page) card['active'] = true;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'statistics-tab';
        card['text'] = 'Statistics Cache';
        card['icon'] = 'fas fa-vial';
        if (this.controller.analysisList) {
            card['text'] = this.controller.analysisList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'statistics') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        return {
            card_tabs: card_tabs
        };
    },

    events: {
        //
        // Overview page specific events
        //
        'click #overview-tab': function() {
            this.controller.showAdminOverview();
        },

        //
        // Users page specific events
        //
        'click #users-tab': function() {
            this.controller.showUsersAdmin();
        },

        //
        // Jobs page specific events
        //
        'click #jobs-tab': function() {
            this.controller.showJobsAdmin();
        },

        //
        // Data repository page specific events
        //
        'click #repository-tab': function() {
            this.controller.showRepositoryAdmin();
        },

        //
        // ADC Download Cache specific events
        //
        'click #adc-tab': function() {
            this.controller.showADCAdmin();
        },

        //
        // Statistics page specific events
        //
        'click #statistics-tab': function() {
            this.controller.showStatisticsAdmin();
        },

    },
});

// Admin overview page
import overview_template from 'Templates/admin/admin-overview.html';
var AdminOverView = Marionette.View.extend({
    template: Handlebars.compile(overview_template)
});

// Admin users page
import users_template from 'Templates/admin/admin-users.html';
var AdminUsersView = Marionette.View.extend({
    template: Handlebars.compile(users_template)
});

// Admin jobs page
import jobs_template from 'Templates/admin/admin-jobs.html';
var AdminJobsView = Marionette.View.extend({
    template: Handlebars.compile(jobs_template)
});

/*// Admin ADC Download Cache page
import adc_template from 'Templates/admin/admin-adc.html';
var AdminADCView = Marionette.View.extend({
    template: Handlebars.compile(adc_template)
});*/

// Admin statistics cache page
import statistics_template from 'Templates/admin/admin-statistics.html';
var AdminStatisticsView = Marionette.View.extend({
    template: Handlebars.compile(statistics_template)
});


// Main admin
var AdminView = Marionette.View.extend({
    template: Handlebars.compile('<div id="admin-content" class="general-padding"></div>'),

    // one region for the navigation tabs
    // one region for the admin page content
    regions: {
        contentRegion: '#admin-content'
    },

    initialize: function(parameters) {

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.model) this.model = parameters.model;
        }

        // show project summary
        // detail region will be decided by controller
        this.tabView = new AdminTabsView({controller: this.controller, model: this.model});
        App.AppController.navController.setStatisticsBar(this.tabView, this.controller, true);
        //this.showChildView('tabRegion', this.tabView);
    },

    // update summary view with new counts and active tab
    updateTab: function() {
        this.tabView = new AdminTabsView({controller: this.controller, model: this.model});
        App.AppController.navController.setStatisticsBar(this.tabView, this.controller, this.controller.showStatistics());
        //this.showChildView('tabRegion', this.tabView);
    },


    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('contentRegion', new LoadingView({}));
    },

    //
    // the main admin tab views
    //
    showAdminOverview: function()
    {
        this.contentView = new AdminOverView();
        this.showChildView('contentRegion', this.contentView);
    },

    showUsersAdmin: function()
    {
        this.contentView = new AdminUsersView();
        this.showChildView('contentRegion', this.contentView);
    },

    showJobsAdmin: function()
    {
        this.contentView = new AdminJobsView();
        this.showChildView('contentRegion', this.contentView);
    },

    showRepositoryAdmin: function(projectLoadList)
    {
        this.contentView = new AdminRepositoryView({controller: this.controller, collection: projectLoadList, loaded_mode: false});
        //this.contentView = new ObjectTableView({controller: this.controller, collection: projectLoadList, objectView: AdminRepositoryView});
        this.showChildView('contentRegion', this.contentView);
    },

    showADCAdmin: function(studyCacheList)
    {
        this.contentView = new AdminADCView({controller: this.controller, collection: studyCacheList});
        this.showChildView('contentRegion', this.contentView);
    },


    showStatisticsAdmin: function()
    {
        this.contentView = new AdminStatisticsView();
        this.showChildView('contentRegion', this.contentView);
    },

});

//
// Admin controller manages all the administration views
// constructor
//
function AdminController(page) {
    // maintain state across multiple views
    this.page = page;

    // statistics/summary
    this.show_statistics = true;

    // the admin view
    this.contentView = new AdminView({controller: this});

    // kick off lazy loads
    // data repository
    this.adcStatus = null;
    this.projectLoadList = null;
    this.publicProjectList = null;
    this.dataRepositoryPromise = this.lazyLoadDataRepository();
    this.studyCacheList = null;
    this.studyCachePromise = this.lazyLoadADCStudyCache();
    //this.repertoireCacheList = null;
    //this.repertoireCachePromise = this.lazyLoadADCRepertoireCache();

    // are we routing to a specific page?
    this.showAdminPage(this.page);
}

AdminController.prototype = {
    // return the main view, create it if necessary
    getView: function() {
        if (!this.contentView)
            this.contentView = new AdminView({controller: this});
        else if (this.contentView.isDestroyed())
            this.contentView = new AdminView({controller: this});
        return this.contentView;
    },

    // returns all the main non-filtered collections
    getCollections: function() {
        return {
            adcStatus: this.adcStatus,
            loadCollection: function() {
                if (this.adcStatus) return this.adcStatus.get('load_collection');
                else return null;
            },
            queryCollection: function() {
                if (this.adcStatus) return this.adcStatus.get('query_collection');
                else return null;
            },
            projectLoadList: this.projectLoadList,
            publicProjectList: this.publicProjectList,
            studyCacheList: this.studyCacheList
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

    //
    // lazy loading of data repository records, these return promises
    //
    lazyLoadDataRepository: function() {
        var that = this;
        //var plList = new ProjectLoadCollection({collection: '_0'});
        var plList = new ProjectLoadCollection();
        var pubList = new PublicCollection();
        var adcStatus = new ADCStatus();
        //var rlList = new RearrangementLoadCollection();

        // fetch the project loads
        return plList.fetch()
            .then(function() {
                console.log(plList);
                // fetch the public projects
                return pubList.fetch();
            })
            .then(function() {
                // repository status
                return adcStatus.fetch();
            })
            .then(function() {
                console.log(adcStatus);
                //console.log(pubList);
                // now propagate loaded data to project
                that.projectLoadList = plList;
                that.publicProjectList = pubList;
                that.adcStatus = adcStatus;
                for (let i = 0; i < that.publicProjectList.length; ++i) {
                  let pubEntry = that.publicProjectList.at(i);
                  for(let j = 0; j < that.projectLoadList.length; ++j) {
                    let loadEntry = that.projectLoadList.at(j);
                    let loadAssociationIdsArray = loadEntry.get('associationIds');
                    let k = loadAssociationIdsArray.indexOf(pubEntry.get('uuid'));
                    if(k!=-1) { //match
                      if(loadEntry.get('value').collection == '_0') {
                        pubEntry.load_0 = loadEntry;
                      }
                      if(loadEntry.get('value').collection == '_1') {
                        pubEntry.load_1 = loadEntry;
                      }
                    }
                  }
                }
            })
            .then(function() {
                // update the project summary
                that.contentView.updateTab();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    lazyLoadADCStudyCache: function() {
        var that = this;
        var scList = new StudyCacheCollection();

        // fetch the list
        return scList.fetch()
            .then(function() {
                that.studyCacheList = scList;
                that.contentView.updateTab();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    //merge into lazyLoadADCStudyCache when backend is implemented
    lazyLoadADCRepertoireCache: function() {
        var that = this;
        var rcList = new RepertoireCacheCollection();

        // fetch the list
        return rcList.fetch()
            .then(function() {
                that.repertoireCacheList = rcList;
                that.contentView.updateTab();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    showAdminPage: function(page)
    {
        switch (page) {
            case 'users':
                this.page = 'users';
                this.showUsersAdmin();
                break;
            case 'jobs':
                this.page = 'jobs';
                this.showJobsAdmin();
                break;
            case 'repository':
                this.page = 'repository';
                this.showRepositoryAdmin();
                break;
            case 'adc':
                this.page = 'adc';
                this.showADCAdmin();
                break;
            case 'statistics':
                this.page = 'statistics';
                this.showStatisticsAdmin();
                break;
            case 'overview':
            default:
                this.page = 'overview';
                this.showAdminOverview();
                break;
        }
    },

    //
    // The main admin tabs
    //
    showAdminOverview: function()
    {
        this.page = 'overview';
        App.router.navigate('admin', {trigger: false});
        this.contentView.updateTab();
        this.contentView.showAdminOverview(this.model);
    },

    showUsersAdmin: function()
    {
        this.page = 'users';
        App.router.navigate('admin/users', {trigger: false});
        this.contentView.updateTab();
        this.contentView.showUsersAdmin(this.model);
    },

    showJobsAdmin: function()
    {
        this.page = 'jobs';
        App.router.navigate('admin/jobs', {trigger: false});
        this.contentView.updateTab();
        this.contentView.showJobsAdmin(this.model);
    },

    showRepositoryAdmin: function()
    {
        this.page = 'repository';
        App.router.navigate('admin/repository', {trigger: false});
        this.contentView.updateTab();
        var that = this;
        if (! this.projectLoadList) {
            // it should be lazy loading

            // show loading while we fetch
            that.contentView.showLoading();

            // wait on the lazy load
            this.dataRepositoryPromise.then(function() {
                    // have the view display them
                    that.contentView.updateTab();
                    that.contentView.showRepositoryAdmin(that.publicProjectList);
                    //that.contentView.showRepositoryAdmin(that.projectLoadList);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // have the view display them
            that.contentView.updateTab();
            that.contentView.showRepositoryAdmin(that.publicProjectList);
            //that.contentView.showRepositoryAdmin(that.projectLoadList);
        }
    },

    showADCAdmin: function()
    {
        this.page = 'adc';
        App.router.navigate('admin/adc', {trigger: false});
        this.contentView.updateTab();

        var that = this;
        if (! this.studyCacheList) {
            // it should be lazy loading show loading while we fetch
            that.contentView.showLoading();

            // wait on the lazy load
            this.studyCachePromise.then(function() {
                    // have the view display them
                    that.contentView.updateTab();
                    that.contentView.showADCAdmin(that.studyCacheList);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // have the view display them
            that.contentView.updateTab();
            that.contentView.showADCAdmin(that.studyCacheList);
        }
    },

    //merge into showADCAdmin when backend is implemented
    showADCRepertoireAdmin: function()
    {
        this.page = 'adc';
        App.router.navigate('admin/adc', {trigger: false});
        this.contentView.updateTab();

        var that = this;
        if (! this.repertoireCacheList) {
            // it should be lazy loading show loading while we fetch
            that.contentView.showLoading();

            // wait on the lazy load
            this.repertoireCachePromise.then(function() {
                    // have the view display them
                    that.contentView.updateTab();
                    that.contentView.showADCRepertoireAdmin(that.repertoireCacheList);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // have the view display them
            that.contentView.updateTab();
            that.contentView.showADCRepertoireAdmin(that.repertoireCacheList);
        }
    },

    showStatisticsAdmin: function()
    {
        this.page = 'statistics';
        App.router.navigate('admin/statistics', {trigger: false});
        this.contentView.updateTab();
        this.contentView.showStatisticsAdmin(this.model);
    }

/*
    showProjectRepertoires() {
        this.page = 'repertoire';
        App.router.navigate('project/' + this.model.get('uuid') + '/repertoire', {trigger: false});
        this.projectView.updateSummary();
        var that = this;
        if (! this.repertoireList) {
            // it should be lazy loading

            // show loading while we fetch
            that.projectView.showLoading();

            // wait on the lazy load
            this.repertoireListPromise.then(function() {
                    // have the view display them
                    that.projectView.updateSummary();
                    that.repertoireController = new RepertoireController(that);
                    that.projectView.showProjectRepertoires(that.repertoireController);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // tell repertoire controller to display the repertoire list
            that.projectView.updateSummary();
            that.repertoireController = new RepertoireController(that);
            that.projectView.showProjectRepertoires(that.repertoireController);
        }
    }, */

};
export default AdminController;
