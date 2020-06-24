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
import Handlebars from 'handlebars';
import Bootstrap from 'bootstrap';
import Project from 'Scripts/models/agave-project';
import LoadingView from 'Scripts/views/utilities/loading-view';
import { RepertoireCollection, SubjectCollection, DiagnosisCollection, SampleCollection } from 'Scripts/collections/agave-metadata-collections';

// Sidebar view
//import sidebar_template from 'Templates/project/project-sidebar.html';
//var ProjectSidebarView = Marionette.View.extend({
//    template: Handlebars.compile(sidebar_template)
//});

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

// Project overview page
// TODO: merge create.html with this
import overview_template from 'Templates/project/project-overview.html';
var ProjectOverView = Marionette.View.extend({
    template: Handlebars.compile(overview_template)
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

// Edit Project
import edit_template from 'Templates/project/create.html';
var EditProjectView = Marionette.View.extend({
    template: Handlebars.compile(edit_template),
    templateContext() {
        return {
            // need to add toggle for edit/read-only
            edit_mode: true
        }
    }
});

// Handlebar playground
Handlebars.registerHelper('contains', function(needle, haystack, options) {
   needle = Handlebars.escapeExpression(needle);
   haystack = Handlebars.escapeExpression(haystack);
   return (haystack.indexOf(needle) > -1) ? options.fn(this) : options.inverse(this);
});

import hbp_template from 'Templates/project/playground.html';
var PlaygroundView = Marionette.View.extend({
    template: Handlebars.compile(hbp_template),
    templateContext() {
        return {
            // pass as object
            airr_schema: this.model.airr_schema,

            // pass as string
            airr_string: JSON.stringify(this.model.airr_schema, null, 2),

            // label array
            keywords_array: [ 'Ig', 'TCR', 'Single Cell', 'Paired Chain'],

            // label object
            keywords_object: {
                'contains_single_cell': 'Single Cell',
                'contains_ig': 'Ig',
                'contains_paired_chain': 'Paired Chain',
                'contains_tcr': 'TCR'
            }
        };
    }

});

// Repertoire view
import RepertoireController from 'Scripts/views/project/repertoire-controller';

// Main project
import template from 'Templates/project/single.html';
var SingleProjectView = Marionette.View.extend({
    template: Handlebars.compile(template),

    // one region for the project summary
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
        this.showChildView('summaryRegion', this.summaryView);
    },

    events: {
        'click #overview-tab': function() {
            this.controller.showProjectOverview();
        },

        // setting event for Repertoires page
        'click #repertoires-tab': function() {
            this.controller.showProjectRepertoires();
        },

        // setting event for Groups page
        'click #groups-tab': function() {
            this.controller.showProjectGroups();
        },

        // setting event for Files page
        'click #files-tab': function() {
            this.controller.showProjectFiles();
        },

        // setting event for Analyses page
        'click #analyses-tab': function() {
            this.controller.showProjectAnalyses();
        },

        // setting event for Create a Repertoire page
        'click #create-rep': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/create', {trigger: false});
            this.showCreateRepertoire();
        },

        'click #add-subject': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/create/subject', {trigger: false});
            this.showAddSubject();
        },

        'click #add-diagnosis': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/create/subject/diagnosis', {trigger: false});
            this.showAddDiagnosis();
        },

        'click #add-sample': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/create/sample', {trigger: false});
            this.showAddSample();
        },

        'click #add-cell': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/create/sample/cell', {trigger: false});
            this.showAddCell();
        },

        'click #add-nucleic': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/create/sample/nucleic', {trigger: false});
            this.showAddNucleic();
        },

        'click #create-rep-group': function() {
            App.router.navigate('project/' +
            this.model.get('uuid') + '/group/create', {trigger: false});
            this.showAddRepGroup();
        },

        'click #edit-project': function() {
            App.router.navigate('project/' + this.model.get('uuid') + '/edit', {trigger: false});
            this.showEditProject();
        },

        'click #playground': function() {
            this.showPlayground();
        },
    },

    // update summary with new counts and active tab
    updateSummary() {
        this.summaryView = new ProjectSummaryView({controller: this.controller, model: this.model});
        this.showChildView('summaryRegion', this.summaryView);
    },

    // show a loading view, used while fetching the data
    showLoading() {
        this.showChildView('detailRegion', new LoadingView({}));
    },

    showProjectOverview(project)
    {
        this.detailView = new ProjectOverView({model: project});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectRepertoires(repertoireController)
    {
        this.showChildView('detailRegion', repertoireController.getView());

        // tell repertoire controller to display the repertoire list
        repertoireController.showRepertoireList();
    },

    showProjectGroups(project)
    {
        this.detailView = new GroupsView({model: project});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectFiles(project)
    {
        this.detailView = new FilesView({model: project});
        this.showChildView('detailRegion', this.detailView);
    },

    showProjectAnalyses(project)
    {
        this.detailView = new AnalysesView({model: project});
        this.showChildView('detailRegion', this.detailView);
    },

    showCreateRepertoire()
    {
        this.detailView = new CreateRepertoireView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddSubject() {
        this.detailView = new AddSubjectView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddDiagnosis() {
        this.detailView = new AddDiagnosisView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddSample() {
        this.detailView = new AddSampleView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddCell() {
        this.detailView = new AddCellView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddNucleic() {
        this.detailView = new AddNucleicView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showAddRepGroup() {
        this.detailView = new AddRepGroupView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showEditProject() {
        this.detailView = new EditProjectView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    },

    showPlayground() {
        this.detailView = new PlaygroundView({model: this.model});
        this.showChildView('detailRegion', this.detailView);
    }
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

    // the project view
    this.projectView = new SingleProjectView({controller: this, model: this.model});

    // kick off lazy loads
    this.repertoireListPromise = this.lazyLoadRepertoires();
    this.groupListPromise = this.lazyLoadGroups();
    this.fileListPromise = this.lazyLoadFiles();
    this.analysisListPromise = this.lazyLoadAnalyses();

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

    // lazy loading of project data, these return promises
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

};
export default SingleProjectController;
