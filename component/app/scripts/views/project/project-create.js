//
// create-view.js
// Create new project view
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
import ModalView from 'Scripts/views/utilities/modal-view';
import OntologySearchView from 'Scripts/views/utilities/ontology-search-view';

// project creation form
import create_template from 'Templates/project/project-create.html';
var CreateView = Marionette.View.extend({
    template: Handlebars.compile('<h1>Create New Project</h1>' + create_template),

    // study type ontology dropdown
    regions: {
        studyTypeRegion: '#study-type-region'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        var common = [{ id: 'NCIT:C16084', label: 'Observational Study' },
            { id: 'NCIT:C93130', label: 'Animal Study'}];

        var view = new OntologySearchView({schema: 'Study', field: 'study_type',
            button_label: 'Choose a Study Type', field_label: 'Study Type', common: common,
            context: this, selectFunction: this.selectStudyType});
        this.showChildView('studyTypeRegion', view);
    },

    templateContext() {
        return {
            // labels for keywords_study
            keywords_object: {
                'contains_ig': 'Ig',
                'contains_tr': 'TCR',
                'contains_paired_chain': 'Paired Chain',
                'is_10x_genomics': '10x Genomics'
            }
        }
    },

    onAttach() {
        // setup popovers and tooltips
        $('[data-toggle="popover"]').popover({
            trigger: 'hover'
        });

        $('[data-toggle="tooltip"]').tooltip();
    },

    selectStudyType(context, value) {
        //console.log("study type selected", value);
        context.model.selected_study_type = value;
    },

});

export default Marionette.View.extend({
    template: Handlebars.compile('<div id="create-project-region"></div>'),

    // one region for the create project content
    regions: {
        createRegion: '#create-project-region'
    },

    initialize: function(parameters) {
        // our controller
        if (parameters && parameters.controller)
            this.controller = parameters.controller;

        // we use a state variable to know what type of modal to display
        this.modalState = 'create';

        var view = new CreateView({model: this.model});
        this.showChildView('createRegion', view);
    },

    events: {
        'click #create-new-project': 'createNewProject',
        'click #cancel-project': 'cancelProject',
        'click #save-project': 'saveProject'
    },

    // cancel just takes you back to the project list
    cancelProject: function(e) {
        App.router.navigate('project', {trigger: true});
    },

    // handle create project event
    createNewProject: function(e) {
        //console.log('create-view: createNewProject');
        e.preventDefault();

        // trigger validation
        $('.needs-validation').addClass('was-validated');

        // Fetch the form
        var form = document.getElementsByClassName('needs-validation');
        //console.log(form);

        // only a single validation form
        if (form[0].checkValidity() === false) {
            //console.log("form validation worked");

            // scroll and focus to first invalid element
            var errorElements = $(form).find(".form-control:invalid");
            $('html, body').animate({
                scrollTop: $(errorElements[0]).focus().offset().top - 50
            }, 1000);

            return;
        }

        // form passes validation

        // pull data out of form and put into model
        var data = Syphon.serialize(this);

        data['study_type'] = null;
        if (this.model.selected_study_type)
            data['study_type'] = this.model.selected_study_type;

        // concatenate collector info
        var fields = [];
        if (data['collectedby_name'].length > 0) fields.push(data['collectedby_name']);
        if (data['collectedby_email'].length > 0) fields.push(data['collectedby_email']);
        if (data['collectedby_address'].length > 0) fields.push(data['collectedby_address']);
        data['collected_by'] = fields.join(', ');

        // concatenate submitter info
        fields = [];
        if (data['submittedby_name'].length > 0) fields.push(data['submittedby_name']);
        if (data['submittedby_email'].length > 0) fields.push(data['submittedby_email']);
        if (data['submittedby_address'].length > 0) fields.push(data['submittedby_address']);
        data['submitted_by'] = fields.join(', ');

        this.model.setAttributesFromData(data);
        //console.log(this.model);

        // display a modal while the project is being created
        this.modalState = 'create';
        var message = new MessageModel({
          'header': 'Project Creation',
          'body':   '<p><i class="fa fa-spinner fa-spin fa-2x"></i> Please wait while we create the new project...</p>'
        });

        // the app controller manages the modal region
        var view = new ModalView({model: message});
        App.AppController.startModal(view, this, this.onShownModal, this.onHiddenModal);
        $('#modal-message').modal('show');
    },

    // project creation request is sent to server after the modal is shown
    onShownModal(context) {
        //console.log('create: Show the modal');

        // use modal state variable to decide
        //console.log(context.modalState);
        if (context.modalState == 'create') {

            // save the model
            //console.log(context.model);
            context.model.save()
            .done(function() {
                context.modalState = 'pass';
                $('#modal-message').modal('hide');
            })
            .fail(function(error) {
                // save failed so show error modal
                context.modalState = 'fail';
                $('#modal-message').modal('hide');

                var message = new MessageModel({
                    'header': 'Project Creation',
                    'body':   '<div class="alert alert-danger"><i class="fa fa-times"></i> Project creation failed!</div>',
                    cancelText: 'Ok',
                    serverError: error
                });

                var view = new ModalView({model: message});
                App.AppController.startModal(view, null, null, null);
                $('#modal-message').modal('show');
            });
        }
    },

    onHiddenModal(context) {
        //console.log('create: Hide the modal');
        if (context.modalState == 'pass') {
            // display a success modal
            var message = new MessageModel({
                'header': 'Project Creation',
                'body': '<p>Project successfully created!</p>',
                cancelText: 'Ok'
            });

            var view = new ModalView({model: message});
            App.AppController.startModal(view, context, null, context.onHiddenSuccessModal);
            $('#modal-message').modal('show');
        }
    },

    onHiddenSuccessModal(context) {
        // create passed so route to the project view
        App.router.navigate('project/' + context.model.get('uuid'), {trigger: true});
    },


});
