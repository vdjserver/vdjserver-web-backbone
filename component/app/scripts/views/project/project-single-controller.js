//
// project-single.js
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

import Marionette from 'backbone.marionette';
import Syphon from 'backbone.syphon';
import Handlebars from 'handlebars';
import MessageModel from 'Scripts/models/message';
import Bootstrap from 'bootstrap';
import Project from 'Scripts/models/agave-project';
import LoadingView from 'Scripts/views/utilities/loading-view';
import LoadingUsersView from 'Scripts/views/utilities/loading-users-view'
import { RepertoireCollection, SubjectCollection, DiagnosisCollection, SampleCollection, DataProcessingCollection } from 'Scripts/collections/agave-metadata-collections';
import { FilesCollection, ProjectFilesCollection } from 'Scripts/collections/agave-files';
import { ProjectJobs } from 'Scripts/collections/agave-jobs';
import Permissions from 'Scripts/collections/agave-permissions';
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

    templateContext() {
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
        } else card['text'] = 'Subjects';
        if (this.controller.page == 'subject') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'samples-tab';
        card['text'] = 'Samples';
        card['icon'] = 'fas fa-user-alt';
        if (collections.sampleList) {
            card['text'] =  collections.sampleList.length + ' Samples';
        } else card['text'] = card['text'] + '<br>Samples';
        if (this.controller.page == 'sample') card['active'] = true;
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
    }
});

// Repertoire Groups Page
import groups_template from 'Templates/project/groups/groups.html';
var GroupsView = Marionette.View.extend({
    template: Handlebars.compile(groups_template)
});

// Add Repertoires Groups to Repertoire View
import addRepGroup_template from 'Templates/project/groups/add-rep-groups.html';
var AddRepGroupView = Marionette.View.extend({
    template: Handlebars.compile(addRepGroup_template)
});

// Steps through the metadata entry process
import entry_steps_template from 'Templates/project/repertoires/create-repertoire-steps.html';
var CreateRepertoireStepsView = Marionette.View.extend({
    template: Handlebars.compile(entry_steps_template),

    initialize: function(parameters) {
        // initial active step
        this.active_step = 'repertoire';
        if (parameters) {
            // our controller
            if (parameters.controller) this.controller = parameters.controller;
            if (parameters.active_step) this.active_step = parameters.active_step;
        }
    },

    templateContext() {
        return {
            active_step: this.active_step
        };
    },
});

// Create New Repertoire view
import create_template from 'Templates/project/repertoires/create-repertoire.html';
var CreateRepertoireView = Marionette.View.extend({
    template: Handlebars.compile(create_template)
});

// Add Subject to Repertoire View
import addSubject_template from 'Templates/project/repertoires/add-subject.html';
var AddSubjectView = Marionette.View.extend({
    template: Handlebars.compile(addSubject_template)
});

// Add Diagnosis to Repertoire View
import addDiagnosis_template from 'Templates/project/repertoires/add-diagnosis.html';
var AddDiagnosisView = Marionette.View.extend({
    template: Handlebars.compile(addDiagnosis_template)
});

// Add Sample to Repertoire View
import addSample_template from 'Templates/project/repertoires/add-sample.html';
var AddSampleView = Marionette.View.extend({
    template: Handlebars.compile(addSample_template)
});

// Add Cell Processing to Repertoire View
import addCell_template from 'Templates/project/repertoires/add-cell.html';
var AddCellView = Marionette.View.extend({
    template: Handlebars.compile(addCell_template)
});

// Add Nucleic Acid to Repertoire View
import addNucleic_template from 'Templates/project/repertoires/add-nucleic.html';
var AddNucleicView = Marionette.View.extend({
    template: Handlebars.compile(addNucleic_template)
});

// Subjects view
import SubjectsController from 'Scripts/views/project/subjects/project-subjects-controller';

// Samples view
import SamplesController from 'Scripts/views/project/samples/project-samples-controller';

// Repertoire view
import RepertoireController from 'Scripts/views/project/project-repertoire-controller';

// Files view
import ProjectFilesController from 'Scripts/views/project/files/project-files-controller';

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
        stepsRegion: '#create-repertoire-steps',
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
        this.showChildView('summaryRegion', this.summaryView);
    },

    events: {
        //
        // Overview page specific events
        //

        // setting event for Overview page
        'click #overview-tab': function() {
            this.controller.showProjectOverview();
        },

        'click #save-edit-project': function(e) {
            // update summary in case project title changed
            this.updateSummary();
        },

        //
        // Subjects page specific events
        //

        // setting event for Subjects page
        'click #subjects-tab': function() {
            this.controller.showProjectSubjects();
        },

        //
        // Samples page specific events
        //

        // setting event for Samples page
        'click #samples-tab': function() {
            this.controller.showProjectSamples();
        },

        //
        // Repertoires page specific events
        //

        // setting event for Repertoires page
        'click #repertoires-tab': function() {
            this.controller.showProjectRepertoires();
        },

        //
        // Events for step-by-step walkthrough for repertoire metadata entry
        // The controller manages the step progression
        //
        // this starts the walkthrough
        'click #create-rep': function() {
            this.controller.startCreateRepertoireSteps();
        },

        'click .add-repertoire': function() {
            this.controller.startCreateRepertoireSteps();
        },

        'click .add-subject': function() {
            this.controller.addSubjectStep();
        },

        'click .add-diagnosis': function() {
            this.controller.addDiagnosisStep();
        },

        'click .add-sample': function() {
            this.controller.addSampleStep();
        },

        'click .add-cell': function() {
            this.controller.addCellProcessingStep();
        },

        'click .add-nucleic': function() {
            this.controller.addNucleicProcessingStep();
        },

        // this finishes the walkthrough
        'click #finish-create-rep': function() {
            // transition back to repertoire list
        },

        //
        // Groups page specific events
        //

        // setting event for Groups page
        'click #groups-tab': function() {
            this.controller.showProjectGroups();
        },

        'click #create-rep-group': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/group/create', {trigger: false});
            this.showAddRepGroup();
        },

        //
        // Files page specific events
        //

        // setting event for Files page
        'click #files-tab': function() {
            this.controller.showProjectFiles();
        },

        //
        // Analyses page specific events
        //

        // setting event for Analyses page
        'click #analyses-tab': function() {
            this.controller.showProjectAnalyses();
        },

    },

    // update summary view with new counts and active tab
    updateSummary() {
        this.summaryView = new ProjectSummaryView({controller: this.controller, model: this.model});
        this.showChildView('summaryRegion', this.summaryView);
    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('detailRegion', new LoadingView({}));
    },

    //
    // the main project tab views
    //
    showProjectOverview(project)
    {
        this.getRegion('stepsRegion').empty();
        this.detailView = new ProjectOverView({model: project, controller: this.controller});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectSubjects(theController)
    {
        this.getRegion('stepsRegion').empty();
        this.showChildView('detailRegion', theController.getView());

        // tell repertoire controller to display the subjects list
        theController.showProjectSubjectsList();
    },

    showProjectSamples(theController)
    {
        this.getRegion('stepsRegion').empty();
        this.showChildView('detailRegion', theController.getView());

        // tell repertoire controller to display the samples list
        theController.showProjectSamplesList();
    },

    showProjectRepertoires(repertoireController)
    {
        this.getRegion('stepsRegion').empty();
        this.showChildView('detailRegion', repertoireController.getView());

        // tell repertoire controller to display the repertoire list
        repertoireController.showRepertoireList();
    },

    showProjectGroups(project)
    {
        this.getRegion('stepsRegion').empty();
        this.detailView = new GroupsView({model: project});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectFiles(projectFilesController)
    {
        this.getRegion('stepsRegion').empty();
        this.showChildView('detailRegion', projectFilesController.getView());

        // tell controller to display its data
        projectFilesController.showProjectFilesList();
    },

    showProjectAnalyses(projectAnalysesController)
    {
        this.getRegion('stepsRegion').empty();
        this.showChildView('detailRegion', projectAnalysesController.getView());

        // tell controller to display its data
        projectAnalysesController.showProjectAnalysesList();
    },

    //
    // Step-by-step walkthrough of repertoire metadata entry
    // Note the controller
    //
    showCreateRepertoire()
    {
        // add the entry steps progression view
        this.stepsView = new CreateRepertoireStepsView({controller: this.controller, active_step: 'repertoire'});
        this.showChildView('stepsRegion', this.stepsView);

        this.detailView = new CreateRepertoireView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddSubject() {
        this.stepsView = new CreateRepertoireStepsView({controller: this.controller, active_step: 'subject'});
        this.showChildView('stepsRegion', this.stepsView);

        this.detailView = new AddSubjectView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddDiagnosis() {
        this.stepsView = new CreateRepertoireStepsView({controller: this.controller, active_step: 'diagnosis'});
        this.showChildView('stepsRegion', this.stepsView);

        this.detailView = new AddDiagnosisView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddSample() {
        this.stepsView = new CreateRepertoireStepsView({controller: this.controller, active_step: 'sample'});
        this.showChildView('stepsRegion', this.stepsView);

        this.detailView = new AddSampleView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddCell() {
        this.stepsView = new CreateRepertoireStepsView({controller: this.controller, active_step: 'cell'});
        this.showChildView('stepsRegion', this.stepsView);

        this.detailView = new AddCellView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddNucleic() {
        this.stepsView = new CreateRepertoireStepsView({controller: this.controller, active_step: 'nucleic'});
        this.showChildView('stepsRegion', this.stepsView);

        this.detailView = new AddNucleicView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddRepGroup() {
        this.detailView = new AddRepGroupView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
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
    this.samplesController = null;
    this.sampleList = null;
    this.groupList = null;
    this.projectFilesController = null;
    this.fileList = null;
    this.analysisList = null;
    this.projectUserList = null;
    this.allUsersList = null;

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
            repertoireGroupList: this.groupList,
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
        var repList = new RepertoireCollection({projectUuid: that.model.get('uuid')});
        var subjectList = new SubjectCollection({projectUuid: that.model.get('uuid')});
        var sampleList = new SampleCollection({projectUuid: that.model.get('uuid')});

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
                // update the project summary
                that.projectView.updateSummary();
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    // refreshes with the latest data from the server
    reloadRepertoireList: function(newList) {
        this.repertoireListPromise = this.lazyLoadRepertoires();
    },

    lazyLoadGroups: function() {
    },

    lazyLoadFiles: function() {
        var that = this;
        var fileList = new ProjectFilesCollection({projectUuid: that.model.get('uuid')});

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
        var projectJobs = new ProjectJobs({projectUuid: this.model.get('uuid')});

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
        var userList = new Permissions({uuid: that.model.get('uuid')});
        var allUsers = new TenantUsers();

        // TODO: this design will need to be changed to support multiple identity providers
        return userList.fetch()
            .then(function() {
                // remove service account from list
                userList.remove(EnvironmentConfig.agave.serviceAccountUsername);

                // TODO: fetch all the users
                return allUsers.fetch();
            })
            .then(function() {
                // now propagate loaded data to project
                that.projectUserList = userList;
                that.allUsersList = allUsers;
            })
            .fail(function(error) {
                console.log(error);
            });
    },

    //
    // The main project tabs
    //
    showProjectOverview: function() {
        this.page = 'overview';
        App.router.navigate('project/' + this.model.get('uuid'), {trigger: false});
        this.projectView.updateSummary();
        this.projectView.showProjectOverview(this.model);
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

    showProjectSamples: function() {
        this.page = 'sample';
        App.router.navigate('project/' + this.model.get('uuid') + '/sample', {trigger: false});

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
                    if (! that.samplesController) that.samplesController = new SamplesController(that);
                    that.projectView.showProjectSamples(that.samplesController);
                })
                .fail(function(error) {
                    console.log(error);
                });
        } else {
            // tell controller to display the lists
            that.projectView.updateSummary();
            if (! that.samplesController) that.samplesController = new SamplesController(that);
            that.projectView.showProjectSamples(that.samplesController);
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
    },

    showProjectGroups: function() {
        this.page = 'group';
        App.router.navigate('project/' + this.model.get('uuid') + '/group', {trigger: false});
        this.projectView.updateSummary();
        this.projectView.showProjectGroups(this.model);
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

    //
    // Step-by-step walkthrough for repertoire metadata entry
    //
    startCreateRepertoireSteps: function() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create', {trigger: false});
        this.projectView.showCreateRepertoire();
    },

    addSubjectStep: function() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/subject', {trigger: false});
        this.projectView.showAddSubject();
    },

    addDiagnosisStep: function() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/subject/diagnosis', {trigger: false});
        this.projectView.showAddDiagnosis();
    },

    addSampleStep: function() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/sample', {trigger: false});
        this.projectView.showAddSample();
    },

    addCellProcessingStep: function() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/sample/cell', {trigger: false});
        this.projectView.showAddCell();
    },

    addNucleicProcessingStep: function() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/sample/nucleic', {trigger: false});
        this.projectView.showAddNucleic();
    },
};
export default SingleProjectController;
