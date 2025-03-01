//
// project-single.js
// Single project controller
// Manages all the views for a single project
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
import Syphon from 'backbone.syphon';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import Bootstrap from 'bootstrap';
import Project from 'Scripts/models/agave-project';
import LoadingView from 'Scripts/views/utilities/loading-view';
import LoadingUsersView from 'Scripts/views/utilities/loading-users-view'
import { RepertoireCollection, RepertoireGroupCollection, SubjectCollection, SampleCollection, DataProcessingCollection } from 'Scripts/collections/agave-metadata-collections';
import { FilesCollection, ProjectFilesCollection } from 'Scripts/collections/agave-files';
import { ProjectJobs } from 'Scripts/collections/agave-jobs';
import Permissions from 'Scripts/collections/agave-permissions';
import Permission from 'Scripts/models/agave-permission';
import TenantUsers from 'Scripts/collections/agave-tenant-users';

// main subviews
import ProjectOverView from 'Scripts/views/project/project-single-overview';

// modal view for when the project is being created
import mm_template from 'Templates/util/modal-message.html';
var ModalMessage = Marionette.View.extend({
  template: Handlebars.compile(mm_template),
  region: '#modal'
});

// modal view for failure message
import mmc_template from 'Templates/util/modal-message-confirm.html';
var ModalMessageConfirm = Marionette.View.extend({
  template: Handlebars.compile(mmc_template),
  region: '#modal'
});

// Project header
import summary_template from 'Templates/project/project-single-header.html';
var ProjectSummaryView = Marionette.View.extend({
    template: Handlebars.compile(summary_template),

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
        var collections = this.controller.getCollections();

        var card = {};
        card['card_id'] = 'overview-tab';
        card['text'] = 'Overview';
        card['icon'] = 'fas fa-project-diagram';
        if (this.controller.page == 'overview') card['active'] = true;
        else card['active'] = false;
        if (! this.controller.page) card['active'] = true;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'files-tab';
        card['text'] = 'Files';
        card['icon'] = 'fas fa-file-alt';
        if (this.controller.fileList) {
            card['text'] = this.controller.fileList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'file') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'subjects-tab';
        card['text'] = 'Subjects';
        card['icon'] = 'fas fa-user-alt';
        if (collections.subjectList) {
            card['text'] = collections.subjectList.length + ' Subjects';
        }
        if (this.controller.page == 'subject') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'repertoires-tab';
        card['text'] = 'Repertoires';
        card['icon'] = 'fas fa-vial';
        if (this.controller.repertoireList) {
            card['text'] = this.controller.repertoireList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'repertoire') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'groups-tab';
        card['text'] = 'Repertoire Groups';
        card['icon'] = 'fas fa-vials';
        if (this.controller.groupList) {
            card['text'] = this.controller.groupList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'group') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'analyses-tab';
        card['text'] = 'Analyses';
        card['icon'] = 'fas fa-chart-bar';
        if (this.controller.analysisList) {
            card['text'] = this.controller.analysisList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'analysis') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        return {
            card_tabs: card_tabs
        };
    },

    events: {
        // traverse to Overview page
        'click #overview-tab': function() {
            this.controller.showProjectOverview();
        },

        // traverse to Files page
        'click #files-tab': function() {
            this.controller.showProjectFiles();
        },

        // traverse to Subjects page
        'click #subjects-tab': function() {
            this.controller.showProjectSubjects();
        },

        // traverse to Repertoires page
        'click #repertoires-tab': function() {
            this.controller.showProjectRepertoires();
        },

        // traverse to Groups page
        'click #groups-tab': function() {
            this.controller.showProjectGroups();
        },

        // traverse to Analyses page
        'click #analyses-tab': function() {
            this.controller.showProjectAnalyses();
        },
    },

});

// Subjects view
import SubjectsController from 'Scripts/views/project/subjects/project-subjects-controller';

// Repertoire view
import RepertoireController from 'Scripts/views/project/repertoires/project-repertoires-controller';

// Files view
import ProjectFilesController from 'Scripts/views/project/files/project-files-controller';

// Groups view
import ProjectGroupsController from 'Scripts/views/project/groups/project-groups-controller';

// Analyses view
import ProjectAnalysesController from 'Scripts/views/project/analyses/project-analyses-controller';

// Main project
import template from 'Templates/project/project-single.html';
var SingleProjectView = Marionette.View.extend({
    template: Handlebars.compile(template),

    // one region for the project summary
    // one region to show progress through metadata entry, normally this is empy
    // one region for the project detail
    regions: {
        summaryRegion: '#project-summary',
        detailRegion: '#project-detail'
    },

    initialize: function(parameters) {

        // our controller
        if (parameters) {
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.model) this.model = parameters.model;
        }

        // show project summary
        // detail region will be decided by controller
        this.summaryView = new ProjectSummaryView({controller: this.controller, model: this.model});
        App.AppController.navController.setStatisticsBar(this.summaryView, this.controller, true);
        //this.showChildView('summaryRegion', this.summaryView);
    },

    // update summary view with new counts and active tab
    updateSummary: function() {
        this.summaryView = new ProjectSummaryView({controller: this.controller, model: this.model});
        App.AppController.navController.setStatisticsBar(this.summaryView, this.controller, this.controller.showStatistics());
        //this.summaryView = new ProjectSummaryView({controller: this.controller, model: this.model});
        //this.showChildView('summaryRegion', this.summaryView);
    },

    // show a loading view, used while fetching the data
    showLoading: function() {
        this.showChildView('detailRegion', new LoadingView({}));
    },

    //
    // the main project tab views
    //
    showProjectOverview: function(project)
    {
        this.detailView = new ProjectOverView({model: project, controller: this.controller});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectSubjects: function(theController)
    {
        this.showChildView('detailRegion', theController.getView());

        // tell repertoire controller to display the subjects list
        theController.showProjectSubjectsList();
    },

    showProjectSamples: function(theController)
    {
        this.showChildView('detailRegion', theController.getView());

        // tell repertoire controller to display the samples list
        theController.showProjectSamplesList();
    },

    showProjectRepertoires: function(repertoireController)
    {
        this.showChildView('detailRegion', repertoireController.getView());

        // tell repertoire controller to display the repertoire list
        repertoireController.showProjectRepertoiresList();
    },

    showProjectGroups: function(projectGroupsController)
    {
        this.showChildView('detailRegion', projectGroupsController.getView());

        // tell controller to display its data
        projectGroupsController.showProjectGroupsList();
    },

    showProjectFiles: function(projectFilesController)
    {
        this.showChildView('detailRegion', projectFilesController.getView());

        // tell controller to display its data
        projectFilesController.showProjectFilesList();
    },

    showProjectAnalyses: function(projectAnalysesController)
    {
        this.showChildView('detailRegion', projectAnalysesController.getView());

        // tell controller to display its data
        projectAnalysesController.showProjectAnalysesList();
    },

});

//
// Project controller for a single project
// manages all the different project views
//
function SingleProjectController(project, page) {
    // maintain state across multiple views
    this.model = project;
    this.page = page;
    this.repertoireController = null;
    this.repertoireList = null;
    this.subjectsController = null;
    this.subjectList = null;
    this.sampleList = null;
    this.groupList = null;
    this.projectFilesController = null;
    this.fileList = null;
    this.analysisList = null;
    this.projectUserList = null;
    this.allUsersList = null;

    // statistics/summary
    this.show_statistics = true;

    // the project view
    this.projectView = new SingleProjectView({controller: this, model: this.model});
    this.hasEdits = false;

    // kick off lazy loads
    this.repertoireListPromise = this.lazyLoadRepertoires();
    this.groupListPromise = this.lazyLoadGroups();
    this.fileListPromise = this.lazyLoadFiles();
    this.analysisListPromise = this.lazyLoadAnalyses();
    this.projectUserListPromise = this.lazyLoadUsers();

    // are we routing to a specific page?
    switch (this.page) {
        case 'subject':
            this.showProjectSubjects();
            break;
        case 'sample':
            this.showProjectSamples();
            break;
        case 'repertoire':
            this.showProjectRepertoires();
            break;
        case 'group':
            this.showProjectGroups();
            break;
        case 'file':
            this.showProjectFiles();
            break;
        case 'analysis':
            this.showProjectAnalyses();
            break;
        case 'overview':
        default:
            this.showProjectOverview();
            break;
    }
}

SingleProjectController.prototype = {
    // return the main view, create it if necessary
    getView: function() {
        if (!this.projectView)
            this.projectView = new SingleProjectView({controller: this});
        else if (this.projectView.isDestroyed())
            this.projectView = new SingleProjectView({controller: this});
        return this.projectView;
    },

    // returns all the main non-filtered collections
    getCollections: function() {
        return {
            repertoireList: this.repertoireList,
            subjectList: this.subjectList,
            sampleList: this.sampleList,
            groupList: this.groupList,
            fileList: this.fileList,
            analysisList: this.analysisList,
            projectJobs: this.projectJobs,
            projectUserList: this.projectUserList,
            allUsersList: this.allUsersList
        }
    },

    //
    // project edits
    //
    flagProjectEdit: function(flag) {
        this.hasEdits = flag;
    },

    hasProjectEdits: function() {
        return this.hasEdits;
    },

    //
    // lazy loading of project data, these return promises
    //
    lazyLoadRepertoires: function() {
        var that = this;
        var repList = new RepertoireCollection(null, {projectUuid: that.model.get('uuid')});
        var subjectList = new SubjectCollection(null, {projectUuid: that.model.get('uuid')});
        var sampleList = new SampleCollection(null, {projectUuid: that.model.get('uuid')});

        // fetch the repertoires
        return repList.fetch()
            .then(function() {
                // fetch the subjects
                return subjectList.fetch();
            })
            .then(function() {
                // fetch the samples
                return sampleList.fetch();
            })
            .then(function() {
                // now propagate loaded data to project
                that.subjectList = subjectList;
                that.sampleList = sampleList;
                that.repertoireList = repList;
            })
            .then(function() {
                // drop subject and samples into the repertoire
                for (var j = 0; j < that.repertoireList.length; j++) {
                    var model = that.repertoireList.at(j);
                    var value = model.get('value');
                    var subject = that.subjectList.get(value['subject']['vdjserver_uuid']);
                    model.setSubject(subject);
                    var samples = new SampleCollection(null, {projectUuid: that.model.get('uuid')});
                    for (let s in value['sample']) {
                        samples.add(that.sampleList.get(value['sample'][s]['vdjserver_uuid']));
                    }
                    model.setSample(samples);
                }

                // update the project summary
                that.projectView.updateSummary();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    replaceRepertoireList: function(newReps, newSamples) {
        this.repertoireList = newReps;
        this.sampleList = newSamples;
    },


    // refreshes with the latest data from the server
    reloadRepertoireList: function(newList) {
        this.repertoireListPromise = this.lazyLoadRepertoires();
    },

    lazyLoadGroups: function() {
        var that = this;
        var rgList = new RepertoireGroupCollection(null, {projectUuid: that.model.get('uuid')});

        // fetch the files
        return rgList.fetch()
            .then(function() {
                // now propagate loaded data to project
                that.groupList = rgList;
                console.log(that.groupList);
            })
            .then(function() {
                // update the project summary
                that.projectView.updateSummary();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    lazyLoadFiles: function() {
        var that = this;
        var fileList = new ProjectFilesCollection(null, {projectUuid: that.model.get('uuid')});

        // fetch the files
        return fileList.fetch()
            .then(function() {
                // now propagate loaded data to project
                that.fileList = fileList;
                console.log(fileList);
            })
            .then(function() {
                // update the project summary
                that.projectView.updateSummary();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    replaceSubjectsList: function(newList) {
        this.subjectList = newList;
    },

    // this is used when edits are made then thrown away
    replaceFilesList: function(newList) {
        this.fileList = newList;
    },

    // refreshes with the latest data from the server
    reloadFilesList: function(newList) {
        this.fileListPromise = this.lazyLoadFiles();
    },

    lazyLoadAnalyses: function() {
        var that = this;
        //var dataProcessings = new
        var projectJobs = new ProjectJobs(null, {projectUuid: this.model.get('uuid')});

        // fetch the jobs
        return projectJobs.fetch()
            .then(function() {
                // now propagate loaded data to project
                that.projectJobs = projectJobs;
                that.analysisList = projectJobs;
                console.log(projectJobs);
            })
            .then(function() {
                // update the project summary
                that.projectView.updateSummary();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    lazyLoadUsers: function() {
        var that = this;
        var userList = new Permissions(null, {uuid: that.model.get('uuid')});
        var allUsers = new TenantUsers(null, {});

        var perms = this.model.get('permission');
        for (let i in perms) {
            var p = new Permission({ username: perms[i]['username'], permission: perms[i]['permission'] });
            userList.add(p);
        }

        // TODO: this design will need to be changed to support multiple identity providers
        return allUsers.fetch()
            .then(function() {
                console.log(allUsers);
                // now propagate loaded data to project
                that.projectUserList = userList;
                that.allUsersList = allUsers;
                return Promise.resolve();
            })
            .fail(function(error) {
                console.log(error);
            });
        //return Promise.resolve();
    },

    //
    // The main project tabs
    //
    showProjectOverview: function() {
        this.page = 'overview';
        App.router.navigate('project/' + this.model.get('uuid'), {trigger: false});
        // no filters
        App.AppController.navController.setFilterBar(null, this, false);
        this.projectView.updateSummary();
        this.projectView.showProjectOverview(this.model);
    },

    shouldToggleFilterBar: function() {
        // TODO: might this be called for other pages?
        // no filter bar for project overview
        return false;
    },

    didToggleFilterBar: function(status) {
        return;
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

    showProjectSubjects: function() {
        this.page = 'subject';
        App.router.navigate('project/' + this.model.get('uuid') + '/subject', {trigger: false});

        var that = this;
        if (! this.repertoireList) {
            // it should be lazy loading
            // subjects/samples loaded with the repertoires

            // show loading while we fetch
            that.projectView.showLoading();

            // wait on the lazy load
            this.repertoireListPromise.then(function() {
                    // have the view display them
                    that.projectView.updateSummary();
                    if (! that.subjectsController) that.subjectsController = new SubjectsController(that);
                    that.projectView.showProjectSubjects(that.subjectsController);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // tell controller to display the lists
            that.projectView.updateSummary();
            if (! that.subjectsController) that.subjectsController = new SubjectsController(that);
            that.projectView.showProjectSubjects(that.subjectsController);
        }
    },

    showProjectRepertoires: function() {
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
                    if (! that.repertoireController) that.repertoireController = new RepertoireController(that);
                    that.projectView.showProjectRepertoires(that.repertoireController);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // tell repertoire controller to display the repertoire list
            that.projectView.updateSummary();
            if (! that.repertoireController) that.repertoireController = new RepertoireController(that);
            that.projectView.showProjectRepertoires(that.repertoireController);
        }
    },

    showProjectGroups: function() {
        this.page = 'group';
        App.router.navigate('project/' + this.model.get('uuid') + '/group', {trigger: false});
        this.projectView.updateSummary();
        var that = this;
        if (! this.groupList) {
            // it should be lazy loading

            // show loading while we fetch
            that.projectView.showLoading();

            // wait on the lazy load
            this.groupListPromise.then(function() {
                    // have the view display them
                    that.projectView.updateSummary();
                    if (! that.groupController) that.groupController = new ProjectGroupsController(that);
                    that.projectView.showProjectGroups(that.groupController);
                })
                .catch(function(error) {
//                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // tell repertoire controller to display the repertoire list
            that.projectView.updateSummary();
            if (! that.groupController) that.groupController = new ProjectGroupsController(that);
            that.projectView.showProjectGroups(that.groupController);
        }
    },

    showProjectFiles: function() {
        this.page = 'file';
        App.router.navigate('project/' + this.model.get('uuid') + '/file', {trigger: false});
        this.projectView.updateSummary();
        var that = this;
        if (! this.fileList) {
            // it should be lazy loading

            // show loading while we fetch
            that.projectView.showLoading();

            // wait on the lazy load
            this.fileListPromise.then(function() {
                    // have the view display them
                    that.projectView.updateSummary();
                    if (! that.projectFilesController) that.projectFilesController = new ProjectFilesController(that);
                    that.projectView.showProjectFiles(that.projectFilesController);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // tell repertoire controller to display the repertoire list
            that.projectView.updateSummary();
            if (! that.projectFilesController) that.projectFilesController = new ProjectFilesController(that);
            that.projectView.showProjectFiles(that.projectFilesController);
        }
    },

    showProjectAnalyses: function() {
        this.page = 'analysis';
        App.router.navigate('project/' + this.model.get('uuid') + '/analysis', {trigger: false});
        this.projectView.updateSummary();
        var that = this;
        if (! this.analysisList) {
            // it should be lazy loading

            // show loading while we fetch
            that.projectView.showLoading();

            // wait on the lazy load
            this.analysisListPromise.then(function() {
                    // have the view display them
                    that.projectView.updateSummary();
                    if (! that.projectAnalysesController) that.projectAnalysesController = new ProjectAnalysesController(that);
                    that.projectView.showProjectAnalyses(that.projectAnalysesController);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // tell repertoire controller to display the repertoire list
            that.projectView.updateSummary();
            if (! that.projectAnalysesController) that.projectAnalysesController = new ProjectAnalysesController(that);
            that.projectView.showProjectAnalyses(that.projectAnalysesController);
        }
    },

};
export default SingleProjectController;
