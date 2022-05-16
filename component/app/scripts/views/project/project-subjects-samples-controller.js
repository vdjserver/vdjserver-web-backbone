
'use strict';

//
// project-subjects-samples-controller.js
// Controller for the project subjects/samples page
//
// VDJServer Analysis Portal
// Web Interface
// https://vdjserver.org
//
// Copyright (C) 2022 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
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

import Project from 'Scripts/models/agave-project';
import SubjectsView from 'Scripts/views/project/subjects/subjects-main';
import SamplesView from 'Scripts/views/project/samples/samples-main';
import LoadingView from 'Scripts/views/utilities/loading-view';
import SubjectsListView from 'Scripts/views/project/subjects/subjects-list';

import headerTemplate from 'Templates/project/subjects/subjects-header.html';
// Project subjects/samples layout
// two regions, one for subjects, one for samples
// content display is handled by sub views
var ProjectSubjectsSamplesView = Marionette.View.extend({
    template: Handlebars.compile(headerTemplate),
    //template: Handlebars.compile('<div id="project-subjects"></div><div id="project-samples"></div>'),

    // one region for any header content
    // one region for the files collection
    regions: {
        subjectsRegion: '#project-subjects',
        samplesRegion: '#project-samples',
        listRegion: '#project-subject-details',
    },

    events: {
        'click #project-subjects-header-button' : 'toggleSubjectsCompressedView',
        'click #project-samples' : 'togglesSamplesCompressedView',
	//'click #project-subjects-list' : 'toggleSubjectsDetailedView',
    },

    /*toggleSubjectsDetailedView(e) {
        console.log("details toggle");
        let collections = this.controller.getCollections();
        let subjectList = collections.subjectList;
        if (this.detailed_view) { //if detailed view is shown 
            this.showChildView('listRegion', new SubjectsListView({collection: subjectList, controller: this.controller}));
            this.detailed_view = false;
        } else {
            //this.getRegion('subjectsRegion').$el.hide();
            this.getRegion('listRegion').empty();
            this.detailed_view = true;
        }
    },*/

    toggleSamplesCompressedView(e) {
        console.log("samples");
    },

    toggleSubjectsCompressedView(e) {
	let collections = this.controller.getCollections();
        let subjectList = collections.subjectList;
        if (this.compressed_view) { //if compressed view is shown then show Summary
            this.showChildView('subjectsRegion', new SubjectsView({collection: subjectList, controller: this.controller}));
            this.compressed_view = false;
        } else {
            this.getRegion('subjectsRegion').empty();
            this.compressed_view = true;
        }
    },

    initialize(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;
	    this.compressed_view = false;
    },

    showSubjectsSamplesList(subjectList, sampleList) {
        this.showChildView('subjectsRegion', new SubjectsView({collection: subjectList, controller: this.controller}));
        this.showChildView('samplesRegion', new SamplesView({collection: sampleList, controller: this.controller}));
    },

    templateContext() {
        var num_subjects = 0;
        var collections = this.controller.getCollections();
        if (collections.subjectList) num_subjects = collections.subjectList.length;
        return {
            num_subjects: num_subjects
        }
    }

});

// Project files controller
//
function ProjectSubjectsSamplesController(controller) {
    // upper level controller, i.e. the single project controller
    this.controller = controller;

    this.mainView = new ProjectSubjectsSamplesView({controller: this});
}

ProjectSubjectsSamplesController.prototype = {
    // return the main view, create it if necessary
    getView() {
        if (!this.mainView)
            this.mainView = new ProjectSubjectsSamplesView({controller: this});
        else if (this.mainView.isDestroyed())
            this.mainView = new ProjectSubjectsSamplesView({controller: this});
        return this.mainView;
    },

    getCollections() {
        return this.controller.getCollections();
    },
    // access data held by upper level controller
    //getProjectFilesList() {
    //    return this.controller.fileList;
    //},

    // show project subjects and samples
    showSubjectsSamples() {
        var collections = this.controller.getCollections();

        // TODO: any filtering?

        this.mainView.showSubjectsSamplesList(collections.subjectList, collections.sampleList);
    },

};
export default ProjectSubjectsSamplesController;

