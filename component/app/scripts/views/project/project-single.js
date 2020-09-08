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
import { RepertoireCollection, SubjectCollection, DiagnosisCollection, SampleCollection } from 'Scripts/collections/agave-metadata-collections';
import Permissions from 'Scripts/collections/agave-permissions';
import TenantUsers from 'Scripts/collections/agave-tenant-users';

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

// Project summary
import summary_template from 'Templates/project/single-summary.html';
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

        var card = {};
        card['card_id'] = 'overview-tab';
        card['text'] = 'Overview';
        if (this.controller.page == 'overview') card['active'] = true;
        else card['active'] = false;
        if (! this.controller.page) card['active'] = true;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'repertoires-tab';
        card['text'] = 'Repertoires';
        if (this.controller.repertoireList) {
            card['text'] = this.controller.repertoireList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'repertoire') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'groups-tab';
        card['text'] = 'Repertoire Groups';
        if (this.controller.groupList) {
            card['text'] = this.controller.groupList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'group') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'files-tab';
        card['text'] = 'Files';
        if (this.controller.fileList) {
            card['text'] = this.controller.fileList.length + ' ' + card['text'];
        }
        if (this.controller.page == 'file') card['active'] = true;
        else card['active'] = false;
        card_tabs.push(card);

        card = {};
        card['card_id'] = 'analyses-tab';
        card['text'] = 'Analyses';
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
import groups_template from 'Templates/project/groups.html';
var GroupsView = Marionette.View.extend({
    template: Handlebars.compile(groups_template)
});

// Add Repertoires Groups to Repertoire View
import addRepGroup_template from 'Templates/project/add-rep-groups.html';
var AddRepGroupView = Marionette.View.extend({
    template: Handlebars.compile(addRepGroup_template)
});

// Project Files Page
import files_template from 'Templates/project/files.html';
var FilesView = Marionette.View.extend({
    template: Handlebars.compile(files_template)
});

// Analyses Page
import analyses_template from 'Templates/project/analyses.html';
var AnalysesView = Marionette.View.extend({
    template: Handlebars.compile(analyses_template)
});

// Steps through the metadata entry process
import entry_steps_template from 'Templates/project/create-repertoire-steps.html';
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
import create_template from 'Templates/project/create-repertoire.html';
var CreateRepertoireView = Marionette.View.extend({
    template: Handlebars.compile(create_template)
});

// Add Subject to Repertoire View
import addSubject_template from 'Templates/project/add-subject.html';
var AddSubjectView = Marionette.View.extend({
    template: Handlebars.compile(addSubject_template)
});

// Add Diagnosis to Repertoire View
import addDiagnosis_template from 'Templates/project/add-diagnosis.html';
var AddDiagnosisView = Marionette.View.extend({
    template: Handlebars.compile(addDiagnosis_template)
});

// Add Sample to Repertoire View
import addSample_template from 'Templates/project/add-sample.html';
var AddSampleView = Marionette.View.extend({
    template: Handlebars.compile(addSample_template)
});

// Add Cell Processing to Repertoire View
import addCell_template from 'Templates/project/add-cell.html';
var AddCellView = Marionette.View.extend({
    template: Handlebars.compile(addCell_template)
});

// Add Nucleic Acid to Repertoire View
import addNucleic_template from 'Templates/project/add-nucleic.html';
var AddNucleicView = Marionette.View.extend({
    template: Handlebars.compile(addNucleic_template)
});

// Repertoire view
import RepertoireController from 'Scripts/views/project/repertoire-controller';

// Main project
import template from 'Templates/project/single.html';
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

        'click #add-subject': function() {
            this.controller.addSubjectStep();
        },

        'click #add-diagnosis': function() {
            this.controller.addDiagnosisStep();
        },

        'click #add-sample': function() {
            this.controller.addSampleStep();
        },

        'click #add-cell': function() {
            this.controller.addCellProcessingStep();
        },

        'click #add-nucleic': function() {
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

    showProjectFiles(project)
    {
        this.getRegion('stepsRegion').empty();
        this.detailView = new FilesView({model: project});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectAnalyses(project)
    {
        this.getRegion('stepsRegion').empty();
        this.detailView = new AnalysesView({model: project});
        this.showChildView('detailRegion', this.detailView);
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
    this.subjectList = null;
    this.sampleList = null;
    this.groupList = null;
    this.fileList = null;
    this.analysisList = null;
    this.projectUserList = null;
    this.allUsersList = null;

    // the project view
    this.projectView = new SingleProjectView({controller: this, model: this.model});

    // kick off lazy loads
    this.repertoireListPromise = this.lazyLoadRepertoires();
    this.groupListPromise = this.lazyLoadGroups();
    this.fileListPromise = this.lazyLoadFiles();
    this.analysisListPromise = this.lazyLoadAnalyses();
    this.projectUserListPromise = this.lazyLoadUsers();

    // are we routing to a specific page?
    switch (this.page) {
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
};

SingleProjectController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.projectView)
            this.projectView = new SingleProjectView({controller: this});
        else if (this.projectView.isDestroyed())
            this.projectView = new SingleProjectView({controller: this});
        return this.projectView;
    },

    //
    // lazy loading of project data, these return promises
    //
    lazyLoadRepertoires() {
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

    lazyLoadGroups() {
    },

    lazyLoadFiles() {
    },

    lazyLoadAnalyses() {
    },

    lazyLoadUsers() {
        var that = this;
        var userList = new Permissions({uuid: that.model.get('uuid')});
        var allUsers = new TenantUsers();

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
    showProjectOverview() {
        this.page = 'overview';
        App.router.navigate('project/' + this.model.get('uuid'), {trigger: false});
        this.projectView.updateSummary();
        this.projectView.showProjectOverview(this.model);
    },

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
    },

    showProjectGroups() {
        this.page = 'group';
        App.router.navigate('project/' + this.model.get('uuid') + '/group', {trigger: false});
        this.projectView.updateSummary();
        this.projectView.showProjectGroups(this.model);
    },

    showProjectFiles() {
        this.page = 'file';
        App.router.navigate('project/' + this.model.get('uuid') + '/file', {trigger: false});
        this.projectView.updateSummary();
        this.projectView.showProjectFiles(this.model);
    },

    showProjectAnalyses() {
        this.page = 'analysis';
        App.router.navigate('project/' + this.model.get('uuid') + '/analysis', {trigger: false});
        this.projectView.updateSummary();
        this.projectView.showProjectAnalyses(this.model);
    },

    //
    // Step-by-step walkthrough for repertoire metadata entry
    //
    startCreateRepertoireSteps() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create', {trigger: false});
        this.projectView.showCreateRepertoire();
    },

    addSubjectStep() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/subject', {trigger: false});
        this.projectView.showAddSubject();
    },

    addDiagnosisStep() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/subject/diagnosis', {trigger: false});
        this.projectView.showAddDiagnosis();
    },

    addSampleStep() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/sample', {trigger: false});
        this.projectView.showAddSample();
    },

    addCellProcessingStep() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/sample/cell', {trigger: false});
        this.projectView.showAddCell();
    },

    addNucleicProcessingStep() {
        App.router.navigate('project/' + this.model.get('uuid') + '/create/sample/nucleic', {trigger: false});
        this.projectView.showAddNucleic();
    },
};
export default SingleProjectController;
